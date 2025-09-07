import { CSVParser } from "./CSVParser.js";
import { JSONParser } from "./JSONParser.js";
import { ExcelParser } from "./ExcelParser.js";

export class ParserFactory {
  static async createParser(filePath, format, delimiter = ",") {
    let parser;

    switch (format.toLowerCase()) {
      case "csv":
        parser = new CSVParser(filePath, delimiter);
        break;
      case "json":
        parser = new JSONParser(filePath);
        break;
      case "excel":
      case "xlsx":
        parser = new ExcelParser(filePath);
        break;
      default:
        throw new Error("Неподдерживаемый формат файла");
    }

    return parser;
  }
}
