import { parentPort } from "worker_threads";
import { ParserFactory } from "../parsers/ParserFactory.js";
import { FilterProcessorService } from "../services/FilterProcessorService.js";
import { JsonFileWriterService } from "../services/JsonFileWriterService.js";

let parserInstance = null;
let isPaused = false;
let isStopped = false;
const BATCH_SIZE = 1000;

parentPort.on("message", async (task) => {
  try {
    const { action, params } = task;

    if (task === "pause") return (isPaused = true);
    if (task === "resume") return (isPaused = false);
    if (task === "stop") return (isStopped = true);

    switch (action) {
      case "initParser":
        parserInstance = await ParserFactory.createParser(
          params.filePath,
          params.format,
          params.delimiter,
        );
        await parserInstance.init();
        parentPort.postMessage({ type: "parserReady" });
        break;

      case "analyze":
        parserInstance._ensureInitialized();
        const analysis = await parserInstance.analyze();
        parentPort.postMessage({ type: "analyzeDone", result: analysis });
        break;

      case "getLine":
        parserInstance._ensureInitialized();
        const line = await parserInstance.getLine(params.index);
        parentPort.postMessage({ type: "lineData", data: line });
        break;

      case "getLineCount":
        parserInstance._ensureInitialized();
        const count = await parserInstance.getLineCount();
        parentPort.postMessage({ type: "lineCount", data: count });
        break;

      case "getElementCountInLine":
        parserInstance._ensureInitialized();
        const elementCount = await parserInstance.getElementCountInLine(
          params.index,
        );
        parentPort.postMessage({ type: "elementCount", data: elementCount });
        break;

      case "getElementsInLine":
        parserInstance._ensureInitialized();
        const elements = await parserInstance.getElementsInLine(params.index);
        parentPort.postMessage({ type: "elementsInLine", data: elements });
        break;

      case "getRange":
        const { start, end } = params;
        const rows = [];
        const total = end - start;

        for (let i = start; i < end; i++) {
          const line = await parserInstance.getLine(i);
          rows.push(line);

          const progress = Math.round(((i - start + 1) / total) * 100);
          parentPort.postMessage({ type: "rangeProgress", data: progress });
        }

        parentPort.postMessage({ type: "rangeDone", data: rows });
        break;

      case "processAndSaveAll":
        parserInstance._ensureInitialized();
        const { folderPath, columns } = params;
        const rawColumns = columns.map((col) => ({
          key: col.key,
          filters: col.filters.map((f) => ({ type: f.type, name: f.name })),
          columnIndex: col.columnIndex,
        }));

        let batchValid = [];
        let batchInvalid = [];
        let rowIndex = 0;

        for await (const row of parserInstance.iterateLines()) {
          if (isStopped) {
            parentPort.postMessage({ type: "stopped", index: rowIndex });
            break;
          }

          while (isPaused) await new Promise((res) => setTimeout(res, 200));

          const { valid, invalid } = FilterProcessorService.processRows(
            [row],
            rawColumns,
            columns.length,
          );
          batchValid.push(...valid);
          batchInvalid.push(...invalid);

          // Write batches
          if (batchValid.length >= BATCH_SIZE) {
            await JsonFileWriterService.saveArrayToJsonL(
              folderPath,
              "valid_data.jsonl",
              batchValid,
            );
            batchValid = [];
          }
          if (batchInvalid.length >= BATCH_SIZE) {
            await JsonFileWriterService.saveArrayToJsonL(
              folderPath,
              "no_valid_data.jsonl",
              batchInvalid,
            );
            batchInvalid = [];
          }

          rowIndex++;
          const percent = Math.round((rowIndex / params.lineCount) * 100);
          parentPort.postMessage({ type: "progress", percent });
        }

        // Final write
        if (batchValid.length)
          await JsonFileWriterService.saveArrayToJsonL(
            folderPath,
            "valid_data.jsonl",
            batchValid,
          );
        if (batchInvalid.length)
          await JsonFileWriterService.saveArrayToJsonL(
            folderPath,
            "no_valid_data.jsonl",
            batchInvalid,
          );

        if (!isStopped) parentPort.postMessage({ type: "done" });
        break;

      default:
        throw new Error(`Unknown task action: ${action}`);
    }
  } catch (err) {
    parentPort.postMessage({ type: "error", error: err.message });
  }
});
