import fs from "fs";
import { BaseParser } from "./BaseParser.js";
import parserPkg from "stream-json/Parser.js";
import streamArrayPkg from "stream-json/streamers/StreamArray.js";

const { parser } = parserPkg;
const { streamArray } = streamArrayPkg;

/**
 * JSON file parser with streaming support
 * @extends BaseParser
 */
export class JSONParser extends BaseParser {
  /**
   * @param {string} filePath - Path to JSON file
   */
  constructor(filePath) {
    super(filePath);
    this._cache = new Map();
    this._lineCount = null;
  }

  /**
   * Initialize the parser
   * @returns {Promise<void>}
   */
  async init() {
    try {
      // Validate JSON format by attempting to parse first few bytes
      const buffer = await fs.promises.readFile(this.filePath, {
        encoding: "utf8",
        flag: "r",
      });
      const firstChar = buffer.trim()[0];
      if (firstChar !== "[" && firstChar !== "{") {
        throw new Error("Invalid JSON format: must start with [ or {");
      }
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize JSON parser: ${error.message}`);
    }

    this.isInitialized = true;
  }

  /**
   * Iterate through JSON array items
   * @private
   * @returns {AsyncGenerator<any>}
   */
  async *iterateLines() {
    try {
      const pipeline = fs
        .createReadStream(this.filePath)
        .pipe(parser())
        .pipe(streamArray());

      for await (const { value } of pipeline) {
        yield value;
      }
    } catch (error) {
      throw new Error(`Error reading JSON file: ${error.message}`);
    }
  }

  /**
   * Get a specific line/record by index
   * @param {number} index - Zero-based index
   * @returns {Promise<any>}
   */
  async getLine(index) {
    this._ensureInitialized();
    this._validateIndex(index);

    // Check cache first
    if (this._cache.has(index)) {
      return this._cache.get(index);
    }

    let current = 0;
    try {
      for await (const item of this.iterateLines()) {
        if (current === index) {
          this._cache.set(index, item);
          return item;
        }
        current++;
      }
    } catch (error) {
      throw new Error(`Error getting line ${index}: ${error.message}`);
    }

    return null;
  }

  /**
   * Get total number of records
   * @returns {Promise<number>}
   */
  async getLineCount() {
    this._ensureInitialized();

    if (this._lineCount !== null) {
      return this._lineCount;
    }

    let count = 0;
    try {
      for await (const _ of this.iterateLines()) {
        count++;
      }
      this._lineCount = count;
      return count;
    } catch (error) {
      throw new Error(`Error counting lines: ${error.message}`);
    }
  }

  /**
   * Get number of properties in a specific record
   * @param {number} index - Zero-based index
   * @returns {Promise<number>}
   */
  async getElementCountInLine(index) {
    const line = await this.getLine(index);
    if (!line || typeof line !== "object") return 0;
    return Object.keys(line).length;
  }

  /**
   * Get property values from a specific record
   * @param {number} index - Zero-based index
   * @returns {Promise<Array>}
   */
  async getElementsInLine(index) {
    const line = await this.getLine(index);
    if (!line || typeof line !== "object") return [];
    return Object.values(line);
  }

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

    for await (const item of this.iterateLines()) {
      let values = [];

      if (!item || typeof item !== "object") {
        analysis.emptyCellRows.push(rowIndex);
      } else {
        values = Object.values(item);
        if (values.some((v) => v === null || v === "" || v === undefined)) {
          analysis.emptyCellRows.push(rowIndex);
        }
      }

      if (rowIndex === 0) {
        analysis.firstLine = values;
        analysis.elementCountInFirstLine = values.length;
      }

      if (values.length > analysis.maxColumnCount) {
        analysis.maxColumnCount = values.length;
      }

      rowIndex++;
    }

    analysis.lineCount = rowIndex;
    return analysis;
  }

  /**
   * Reset parser state and clear cache
   */
  reset() {
    super.reset();
    this._cache.clear();
    this._lineCount = null;
  }
}
