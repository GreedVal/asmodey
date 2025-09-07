import Filter from "../../shared/utils/Filter.js";

export class FilterProcessorService {
  /**
   * Обработка одной строки по конфигу
   * @param {string[]} row
   * @param {Array<{key: string, filters: {type: string, name: string}[], columnIndex: number}>} config
   * @param {number} columnCount
   * @returns {{valid: boolean, processed: Record<string, string>, errors: string[]}}
   */
  static processRow(row, config, columnCount) {
    const processedRow = {};
    const errors = [];
    let isValid = true;

    for (const colConfig of config) {
      const idx = colConfig.columnIndex - 1;
      const value = row[idx];

      if (value === undefined) {
        errors.push(
          `Отсутствует значение для колонки '${colConfig.key}' (index ${colConfig.columnIndex})`,
        );
        isValid = false;
        break;
      }

      let newValue = value;

      // Применяем действия
      for (const f of colConfig.filters.filter((f) => f.type === "action")) {
        newValue = Filter.pipeline(newValue).do(f.name).value();
      }

      // Применяем валидации
      for (const f of colConfig.filters.filter((f) => f.type === "validator")) {
        const ok = Filter.pipeline(newValue).check(f.name);
        if (!ok) {
          errors.push(
            `Не прошла валидация '${f.name}' для колонки '${colConfig.key}'`,
          );
          isValid = false;
          break;
        }
      }

      if (!isValid) break;

      // Сохраняем только те столбцы, которые указаны в конфиге
      processedRow[colConfig.key] = newValue;
    }

    return { valid: isValid, processed: processedRow, errors };
  }

  /**
   * Обработка массива строк
   * @param {string[][]} rows
   * @param {Array<{key: string, filters: {type: string, name: string}[], columnIndex: number}>} config
   * @param {number} columnCount
   * @returns {{valid: Record<string, string>[], invalid: Array<{row: string[], errors: string[]}>}}
   */
  static processRows(rows, config, columnCount) {
    const valid = [];
    const invalid = [];

    for (const row of rows) {
      // Обрезаем строку до максимального columnIndex в конфиге
      const maxIndex = Math.max(...config.map((c) => c.columnIndex));
      const trimmedRow = row.slice(0, maxIndex);

      const {
        valid: isValid,
        processed,
        errors,
      } = this.processRow(trimmedRow, config, columnCount);

      if (isValid) valid.push(processed);
      else invalid.push({ row, errors });
    }

    return { valid, invalid };
  }
}
