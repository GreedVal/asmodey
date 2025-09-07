import { ipcMain, dialog } from "electron";
import { Worker } from "worker_threads";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let fileWorker = null;

ipcMain.handle("dialog:openFile", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Все подходящие", extensions: ["xls", "xlsx", "json", "csv"] },
      { name: "CSV", extensions: ["csv"] },
      { name: "Excel", extensions: ["xls", "xlsx"] },
      { name: "JSON", extensions: ["json"] },
      { name: "Все файлы", extensions: ["*"] },
    ],
  });
  return canceled ? null : filePaths[0];
});

ipcMain.handle("dialog:openFolder", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return canceled ? null : filePaths[0];
});

function initWorker(event) {
  if (!fileWorker) {
    fileWorker = new Worker(join(__dirname, "workers", "fileWorker.js"), {
      type: "module",
    });

    fileWorker.on("message", (msg) => {
      switch (msg.type) {
        case "progress":
          event.sender.send("filter:progress", msg.percent);
          break;
        case "done":
          event.sender.send("filter:done");
          break;

        case "parserReady":
          event.sender.send("parser:ready");
          break;
        case "analyzeDone":
          event.sender.send("parser:analyzeDone", msg.result);
          break;

        case "saveDone":
          event.sender.send("save:done");
          break;

        case "rangeProgress":
          event.sender.send("parser:rangeProgress", msg.data);
          break;
        case "rangeDone":
          event.sender.send("parser:rangeDone", msg.data);
          break;

        case "rowProcessed":
          event.sender.send("filter:rowProcessed", msg);
          break;

        case "stopped":
          event.sender.send("worker:stopped", msg.index);
          break;

        case "error":
          event.sender.send("worker:error", msg.error);
          break;
        default:
          event.sender.send("worker:message", msg);
      }
    });

    fileWorker.on("error", (err) =>
      event.sender.send("worker:error", err.message),
    );
    fileWorker.on("exit", (code) =>
      console.log("Worker exited with code", code),
    );
  }
}

ipcMain.handle("worker:sendTask", (event, task) => {
  initWorker(event);
  fileWorker.postMessage(task);
  return true;
});

ipcMain.handle("worker:restart", async (event) => {
  if (fileWorker) {
    await fileWorker.terminate();
    fileWorker = null;
  }

  fileWorker = initWorker(event);
  return true;
});

ipcMain.handle("worker:pause", () => fileWorker?.postMessage("pause"));
ipcMain.handle("worker:resume", () => fileWorker?.postMessage("resume"));
ipcMain.handle("worker:stop", () => fileWorker?.postMessage("stop"));
