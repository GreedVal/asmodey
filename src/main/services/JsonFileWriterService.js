import fs from "fs";
import path from "path";

export class JsonFileWriterService {
  static getFilePath(folderPath, filename) {
    if (!folderPath) throw new Error("Folder path is required");
    if (!filename) throw new Error("Filename is required");
    folderPath = path.resolve(folderPath);
    return path.join(folderPath, filename);
  }

  // Append-only JSONL
  static async saveArrayToJsonL(folderPath, filename, newItems = []) {
    const filePath = this.getFilePath(folderPath, filename);
    const dirPath = path.dirname(filePath);

    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    const lines = newItems.map((r) => JSON.stringify(r)).join("\n") + "\n";
    await fs.promises.appendFile(filePath, lines, "utf8");
  }
}
