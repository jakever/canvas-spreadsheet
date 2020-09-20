const rules = {
  number: /^(-?\d{1,11}(\.\d*)?)$/,
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
    /**
     * type: month|date|datetime|number|phone|email|select 数据格式类型
     * required 是否必填
     * validator: RegExp|Function 校验器
     * message 校验失败提示文案
     * validateKey 单元格key
     * validateTitle 单元格title
     * options 数据格式为type时的枚举数据
     */
    this.validateKey = column.key;
    this.validateTitle = column.title;
    this.type = column.type;
    this.options = column.options;
    Object.assign(this, column.rule);
  }
  async validate(v, row) {
    const self = this
    const { required, validator, operator, options, type, descriptor } = this;

    // 必填校验不通过，不再进行后续的校验
    let requiredValid = typeof v === 'string' ? !!v.trim() : !!v || v === 0
    if (required && !requiredValid) {
      return getValidation.call(this, false, "required");
    }
    // 空值不参与下面的校验
    if (!requiredValid) return { flag: true };

    if (rules[type] && !rules[type].test(v)) {
      return getValidation.call(this, false, "notMatch");
    }
    // 下拉校验值必须存在于枚举中
    if (type === "select") {
      const flag = options.map(item => item.value).includes(v);
      if (!flag) return getValidation.call(this, flag, "notMatch");
    }
    if (type === "month" || type === "date" || type === "datetime") {
      const flag = isNaN(v) && !isNaN(Date.parse(v));
      if (!flag) return getValidation.call(this, flag, "notMatch");
    }

    if (validator instanceof RegExp) {
      const pattern = new RegExp(validator);
      return getValidation.call(this, pattern.test(v), "notIn");
    } else if (typeof validator === "function") {
      let flag = true
      // 这里处理异步校验函数
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
