import fs from "fs";
import readline from "readline";
import { BaseParser } from "./BaseParser.js";

export class CSVParser extends BaseParser {
  constructor(filePath, delimiter = ",") {
    super(filePath);
    this.delimiter = delimiter;
  }

  async init() {
    this.isInitialized = true;
  }

  // Потоковая генерация строк
  async *iterateLines() {
    this._ensureInitialized();
    const stream = fs.createReadStream(this.filePath, { encoding: "utf8" });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    for await (const line of rl) {
      yield line.split(this.delimiter);
    }
  }

  // Получаем количество строк (асинхронно)
  async getLineCount() {
    this._ensureInitialized();
    let count = 0;
    for await (const _ of this.iterateLines()) count++;
    return count;
  }

  // Получаем конкретную строку
  async getLine(index) {
    this._validateIndex(index);
    let current = 0;
    for await (const row of this.iterateLines()) {
      if (current === index) return row.join(this.delimiter);
      current++;
    }
    return null; // если индекс больше числа строк
  }

  // Получаем элементы конкретной строки
  async getElementsInLine(index) {
    this._validateIndex(index);
    let current = 0;
    for await (const row of this.iterateLines()) {
      if (current === index) return row;
      current++;
    }
    return [];
  }

  // Количество элементов в строке
  async getElementCountInLine(index) {
    const elements = await this.getElementsInLine(index);
    return elements.length;
  }

  // Анализ CSV
  async analyze() {
    this._ensureInitialized();
    const analysis = {
      emptyCellRows: [],
      maxColumnCount: 0,
      lineCount: 0,
      elementCountInFirstLine: 0,
      firstLine: [],
    };

    let rowIndex = 0;
    for await (const elements of this.iterateLines()) {
      if (rowIndex === 0) {
        analysis.firstLine = elements;
        analysis.elementCountInFirstLine = elements.length;
      }

      if (elements.some((e) => e.trim() === ""))
        analysis.emptyCellRows.push(rowIndex);
      if (elements.length > analysis.maxColumnCount)
        analysis.maxColumnCount = elements.length;

      rowIndex++;
    }

    analysis.lineCount = rowIndex;
    return analysis;
  }
}
