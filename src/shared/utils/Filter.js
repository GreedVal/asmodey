// Filter.js
export default class Filter {
  // Обёртка для валидаторов, разрешающая пустые строки
  static allowEmpty(validator) {
    return (str) => {
      str = String(str).trim();
      if (!str) return true; // пустая строка = валидно
      return validator(str);
    };
  }

  static validators = {
    isEmail: Filter.allowEmpty((str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)),
    isNumeric: Filter.allowEmpty((str) => /^\d+$/.test(str)),
    isCyrillic: Filter.allowEmpty((str) => /^[А-ЯЁа-яё]+$/.test(str)),
    isDate: Filter.allowEmpty(
      (str) =>
        /^\d{4}-\d{2}-\d{2}$/.test(str) || /^\d{2}\.\d{2}\.\d{4}$/.test(str),
    ),
    isURL: Filter.allowEmpty((str) => {
      try {
        new URL(str);
        return true;
      } catch {
        return false;
      }
    }),
    isPhone: Filter.allowEmpty((str) => /^\+?\d{10,15}$/.test(str)),
    isLatin: Filter.allowEmpty((str) => /^[A-Za-z]+$/.test(str)),
    isAlphanumeric: Filter.allowEmpty((str) => /^[A-Za-z0-9]+$/.test(str)),
    isEmpty: (str) => !String(str).trim().length,
    isJSON: Filter.allowEmpty((str) => {
      try {
        JSON.parse(str);
        return true;
      } catch {
        return false;
      }
    }),
    isUUID: Filter.allowEmpty((str) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        str,
      ),
    ),
    isStrongPassword: Filter.allowEmpty((str) =>
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(str),
    ),
  };

  static actions = {
    replaceFirst8With7: (str) =>
      str && str.startsWith("8") ? "7" + str.slice(1) : str,
    cleanSpaces: (str) => String(str).trim().replace(/\s+/g, " "),
    toLowerCase: (str) => String(str).toLowerCase(),
    toUpperCase: (str) => String(str).toUpperCase(),
    removeSpecialChars: (str) => String(str).replace(/[^\wа-яА-ЯёЁ\s]/gi, ""),
    removeDigits: (str) => String(str).replace(/\d+/g, ""),
    removeLetters: (str) => String(str).replace(/[A-Za-zА-Яа-яЁё]+/g, ""),
    onlyDigits: (str) => String(str).replace(/\D+/g, ""),
    onlyLetters: (str) => String(str).replace(/[^A-Za-zА-Яа-яЁё]+/g, ""),
    normalizePhone: (str) => String(str).replace(/\D+/g, "").replace(/^8/, "7"),
    trimStart: (str) => String(str).replace(/^\s+/, ""),
    trimEnd: (str) => String(str).replace(/\s+$/, ""),
    capitalize: (str) =>
      String(str).charAt(0).toUpperCase() + String(str).slice(1),
    titleCase: (str) =>
      String(str)
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    maskEmail: (str) => {
      const [user, domain] = str.split("@");
      if (!domain) return str;
      return user[0] + "***" + user.slice(-1) + "@" + domain;
    },
    maskPhone: (str) => String(str).replace(/(\d{3})\d{4}(\d{2,})/, "$1****$2"),
  };

  static pipeline(initialValue) {
    return new Pipeline(initialValue);
  }
}

class Pipeline {
  constructor(value) {
    this.valueInternal = value;
  }

  do(action) {
    if (typeof action === "function")
      this.valueInternal = action(this.valueInternal);
    else if (typeof action === "string" && Filter.actions[action])
      this.valueInternal = Filter.actions[action](this.valueInternal);
    return this;
  }

  check(validator) {
    if (typeof validator === "function") return validator(this.valueInternal);
    else if (typeof validator === "string" && Filter.validators[validator])
      return Filter.validators[validator](this.valueInternal);
    return false;
  }

  value() {
    return this.valueInternal;
  }
}
