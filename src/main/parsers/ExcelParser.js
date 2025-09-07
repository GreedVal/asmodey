import ExcelJS from "exceljs";
import { BaseParser } from "./BaseParser.js";

export class ExcelParser extends BaseParser {
  constructor(filePath) {
    super(filePath);
    this.rowCache = new Map();
  }

  async init() {
    this.isInitialized = true;
  }

  async getLine(index) {
    const workbook = new ExcelJS.stream.xlsx.WorkbookReader(this.filePath);
    let current = 0;

    for await (const worksheet of workbook) {
      for await (const row of worksheet) {
        if (current === index) {
          return row.values.slice(1);
        }
        current++;
      }
    }

    return null;
  }

  async getElementsInLine(index) {
    const row = await this.getLine(index);
    return row || [];
  }

  async getLineCount() {
    const workbook = new ExcelJS.stream.xlsx.WorkbookReader(this.filePath);
    let count = 0;

    for await (const worksheet of workbook) {
      for await (const _ of worksheet) {
        count++;
      }
    }

    return count;
  }

  async getElementCountInLine(index) {
    const row = await this.getLine(index);
    return row ? row.length : 0;
  }

  async *iterateLines() {
    const workbook = new ExcelJS.stream.xlsx.WorkbookReader(this.filePath);

    for await (const worksheet of workbook) {
      for await (const row of worksheet) {
        yield row.values.slice(1);
      }
    }
  }

  async analyze() {
    const analysis = {
      emptyCellRows: [],
      maxColumnCount: 0,
      lineCount: 0,
      elementCountInFirstLine: 0,
      firstLine: [],
    };

    let rowIndex = 0;

    for await (const row of this.iterateLines()) {
      if (rowIndex === 0) {
        analysis.firstLine = row;
        analysis.elementCountInFirstLine = row.length;
      }

      if (
        row.some((e) => e === null || e === undefined || `${e}`.trim() === "")
      ) {
        analysis.emptyCellRows.push(rowIndex);
      }

      if (row.length > analysis.maxColumnCount) {
        analysis.maxColumnCount = row.length;
      }

      rowIndex++;
    }

    analysis.lineCount = rowIndex;
    return analysis;
  }

  reset() {
    super.reset();
    this.delimiter = null;
  }
}
