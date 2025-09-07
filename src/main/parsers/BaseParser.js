import { existsSync } from "fs";

/**
 * Abstract base class for file parsers
 * @abstract
 */
/**
 * Abstract base class for file parsers
 * @abstract
 */
export class BaseParser {
  /**
   * @param {string} filePath - Path to the file to parse
   * @throws {Error} If trying to instantiate BaseParser directly or if file doesn't exist
   */
  constructor(filePath) {
    if (new.target === BaseParser) {
      throw new Error("Cannot instantiate abstract BaseParser");
    }

    if (!filePath || typeof filePath !== "string") {
      throw new Error("File path must be a non-empty string");
    }

    if (!existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    this.filePath = filePath;
    this.isInitialized = false;
  }

  /**
   * Initialize the parser
   * @abstract
   * @returns {Promise<void>}
   */
  async init() {
    throw new Error("init() must be implemented by subclass");
  }

  /**
   * Get a specific line by index
   * @abstract
   * @param {number} index - Zero-based line index
   * @returns {Promise<any>} The line data
   */
  async getLine(index) {
    this._validateIndex(index);
    throw new Error("getLine() must be implemented by subclass");
  }

  /**
   * Get total number of lines/records
   * @abstract
   * @returns {Promise<number>}
   */
  async getLineCount() {
    throw new Error("getLineCount() must be implemented by subclass");
  }

  /**
   * Get number of elements in a specific line
   * @abstract
   * @param {number} index - Zero-based line index
   * @returns {Promise<number>}
   */
  async getElementCountInLine(index) {
    this._validateIndex(index);
    throw new Error("getElementCountInLine() must be implemented by subclass");
  }

  /**
   * Get elements from a specific line
   * @abstract
   * @param {number} index - Zero-based line index
   * @returns {Promise<Array>}
   */
  async getElementsInLine(index) {
    this._validateIndex(index);
    throw new Error("getElementsInLine() must be implemented by subclass");
  }

  /**
   * Analyze the file structure
   * @abstract
   * @returns {Promise<Object>}
   */
  async analyze() {
    throw new Error("analyze() must be implemented by subclass");
  }

  /**
   * Reset parser state
   */
  reset() {
    this.isInitialized = false;
  }

  /**
   * Check if parser is initialized
   * @returns {boolean}
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Validate index parameter
   * @private
   * @param {number} index
   * @throws {Error} If index is invalid
   */
  _validateIndex(index) {
    if (!this.isInitialized) {
      throw new Error("Parser must be initialized before use");
    }
    if (typeof index !== "number" || index < 0 || !Number.isInteger(index)) {
      throw new Error("Index must be a non-negative integer");
    }
  }

  /**
   * Validate that parser is ready for operations
   * @protected
   * @throws {Error} If parser is not initialized
   */
  _ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error("Parser must be initialized before use");
    }
  }
}
