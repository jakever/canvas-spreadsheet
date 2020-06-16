const rules = {
  number: /^[0-9]+\.?[0-9]*$/,
  phone: /^[1-9]\d{10}$/,
  email: /w+([-+.]w+)*@w+([-.]w+)*.w+([-.]w+)*/
};
function parseValue(v) {
  const { type } = this;
  if (type === "date") {
    return new Date(v);
  }
  if (type === "number") {
    return Number(v);
  }
  return v;
}
function getValidation(flag, key) {
  if (this.message) {
    return { flag, message: this.message };
  }
  let message = "";
  if (!flag) {
    switch (key) {
      case "required":
        message = `${this.validateTitle}字段必填哦！`;
        break;
      case "notMatch":
        message = `${this.validateTitle}字段不符合预期格式哦！`;
        break;
      case "notIn":
        message = `${this.validateTitle}字段是无效值哦！`;
        break;
      default:
        message = `${this.validateTitle}字段是无效值哦！`;
    }
  }
  return { flag, message };
}

class Validator {
  constructor(column) {
    this.validateKey = column.key;
    this.validateTitle = column.title;

    // type: month|date|datetime|number|phone|email|select
    // required
    // validator: RegExp|Function
    // message
    this.type = column.type;
    this.options = column.options;
    Object.assign(this, column.rule);
  }
  async validate(v, row) {
    const self = this
    const { required, validator, operator, options, type, descriptor } = this;

    if (required && !v) {
      return getValidation.call(this, false, "required");
    }

    if (validator instanceof RegExp) {
      const pattern = new RegExp(validator);
      return getValidation.call(this, pattern.test(v), "notIn");
    } else if (typeof validator === "function") {
      let flag = true
      await validator(v, row, (res) => {
        if (typeof res === 'string') {
          self.message = res
          flag = !res
        } else if (res === false) {
          flag = false
        }
      })
      return getValidation.call(this, flag, "notIn");
    }
    if (!v) return { flag: true };

    if (rules[type] && !rules[type].test(v)) {
      return getValidation.call(this, false, "notMatch");
    }
    if (type === "select") {
      const flag = options.map(item => item.value).includes(v);
      return getValidation.call(this, flag, "notMatch");
    }
    if (type === "month" || type === "date" || type === "datetime") {
      const flag = isNaN(v) && !isNaN(Date.parse(v));
      return getValidation.call(this, flag, "notMatch");
    }
    // if (operator) {
    //     const v1 = parseValue.call(this, v);
    //     if (operator === 'be') {
    //         const [min, max] = value;
    //         return getValidation.call(this,
    //             v1 >= parseValue.call(this, min) && v1 <= parseValue.call(this, max),
    //             'between',
    //             min,
    //             max,
    //         );
    //     }
    //     if (operator === 'nbe') {
    //         const [min, max] = value;
    //         return getValidation.call(this,
    //             v1 < parseValue.call(this, min) || v1 > parseValue.call(this, max),
    //             'notBetween',
    //             min,
    //             max,
    //         );
    //     }
    //     if (operator === 'eq') {
    //         return getValidation.call(this,
    //             v1 === parseValue.call(this, value),
    //             'equal',
    //             value,
    //         );
    //     }
    //     if (operator === 'neq') {
    //         return getValidation.call(this,
    //             v1 !== parseValue.call(this, value),
    //             'notEqual',
    //             value,
    //         );
    //     }
    //     if (operator === 'lt') {
    //         return getValidation.call(this,
    //             v1 < parseValue.call(this, value),
    //             'lessThan',
    //             value,
    //         );
    //     }
    //     if (operator === 'lte') {
    //         return getValidation.call(this,
    //             v1 <= parseValue.call(this, value),
    //             'lessThanEqual',
    //             value,
    //         );
    //     }
    //     if (operator === 'gt') {
    //         return getValidation.call(this,
    //             v1 > parseValue.call(this, value),
    //             'greaterThan',
    //             value,
    //         );
    //     }
    //     if (operator === 'gte') {
    //         return getValidation.call(this,
    //             v1 >= parseValue.call(this, value),
    //             'greaterThanEqual',
    //             value,
    //         );
    //     }
    // }
    return { flag: true };
  }
}

export default Validator;
