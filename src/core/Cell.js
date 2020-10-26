import Context from "./Context.js";
import Validator from "./Validator.js";
import {
  SELECT_BORDER_COLOR,
  SELECT_AREA_COLOR,
  READONLY_COLOR,
  READONLY_TEXT_COLOR,
  ERROR_TIP_COLOR
} from "./constants.js";
const dateIcon = new Image();
const timeIcon = new Image();
dateIcon.src = require("./images/date.png");
timeIcon.src = require("./images/time.png");

class Cell extends Context {
  constructor(
    value,
    grid,
    colIndex,
    rowIndex,
    x,
    y,
    width,
    height,
    column,
    rowData,
    options
  ) {
    super(grid, x, y, width, height, column.fixed);
    this.colIndex = colIndex;
    this.rowIndex = rowIndex;
    this.rowData = rowData

    this.title = column.title;
    this.key = column.key;
    this.fixed = column.fixed;
    this.readonly = column.readonly;
    this.textAlign = column.align || "left";
    this.textBaseline = column.baseline || "middle";
    this.dataType = column.type || "text";
    this.options = column.options;
    this.render = column.render;

    this.value = value === null || value === undefined ? "" : value;
    this.originalValue = value;

    this.validator = new Validator(column);
    this.valid = true;
    this.message = null;

    Object.assign(this, options);
    this.setLabel(this.value);
    if (column.rule && column.rule.immediate === false) return; // 编辑器初始化不需要校验
    this.validate();
  }
  // 鼠标横坐标是否位于【焦点单元格】所在的autofill触点范围内
  isInHorizontalAutofill(mouseX, mouseY) {
    return (
      mouseX > this.x + this.grid.scrollX + this.width - 4 &&
      mouseX < this.x + this.grid.scrollX + this.width + 4 &&
      mouseX > this.grid.fixedLeftWidth &&
      mouseX < this.grid.width - this.grid.fixedRightWidth + 4 // 兼容最右侧autofill触点由于是渲染在scroller上会导致无效
    );
  }
  // 鼠标横坐标是否位于处于【冻结列中焦点单元格】所在的autofill触点范围内
  isInsideFixedHorizontalAutofill(mouseX, mouseY) {
    const x =
      this.grid.width -
      (this.grid.tableWidth - this.x - this.width) -
      this.width -
      this.grid.verticalScrollerSize;
    return (
      (mouseX >= x + this.width - 4 &&
        mouseX < x + this.width + 4 &&
        this.fixed === "right") ||
      (mouseX > this.x + this.width - 4 &&
        mouseX < this.x + this.width + 4 &&
        this.fixed === "left")
    );
  }
  async validate(data) {
    const { flag, message } = await this.validator.validate(this.value, data || this.rowData);
    this.valid = flag;
    this.message = message;
  }
  resetValidate(flag = true, message = null) {
    this.valid = flag;
    this.message = message;
  }
  handleNumber(val) {
    if (val === 0 || (val && !isNaN(Number(val)))) {
      return Number(val)
    } else {
      return val || null // number类型的空字符串处理为null
    }
  }
  /**
   * @param {String|Number} val 需要设置的值
   * @param {Boolean} ignore 是否忽略readonly属性可以修改
   */
  setData(val, ignore) {
    if (!ignore && this.readonly) return;
    let v = val
    if (typeof v === 'string') {
      v = val.trim()
    }
    if (this.dataType === 'number') {
      v = this.handleNumber(v)
    }
    if (this.grid.clipboard.isPaste || this.grid.autofill.enable) {
      const value = this.getMapValue(v)
      this.value = value
    } else {
      this.value = v;
    }
    this.setLabel(v);
    
    const rowData = this.grid.body.getRowData(this.rowIndex)
    this.validate(rowData)

    // changed diff
    if (this.value !== this.originalValue) {
      this.grid.hashChange[`${this.colIndex}-${this.rowIndex}`] = true;
    } else {
      delete this.grid.hashChange[`${this.colIndex}-${this.rowIndex}`];
    }
  }
  setLabel(val) {
    let label;
    if (typeof this.render === "function") {
      label = this.render(val);
    } else {
      label = this.getMapLabel(val);
    }
    this.label = label ?? "";
  }
  // 对于下拉类型的数据，对外展示的是label，实际存的是value，所以在更新这类数据的时候需要做一个转换
  getMapValue(label) { // label => value
    let value = label;
    if (this.dataType === "select" && Array.isArray(this.options)) {
      for (let item of this.options) {
        if (label === item.label) {
          value = item.value;
          break;
        }
      }
    }
    return value;
  }
  getMapLabel(value) { // value => label
    let label = value;
    if (this.dataType === "select" && Array.isArray(this.options)) {
      for (let item of this.options) {
        if (value === item.value) {
          label = item.label;
          break;
        }
      }
    }
    return label;
  }
  draw() {
    const {
      painter,
      editor,
      selector,
      autofill,
      clipboard,
      width,
      tableWidth,
      verticalScrollerSize,
      scrollX,
      scrollY,
      range,
      fillColor
    } = this.grid;
    const x =
      this.fixed === "right"
        ? width -
          (tableWidth - this.x - this.width) -
          this.width -
          verticalScrollerSize
        : this.fixed === "left"
        ? this.x
        : this.x + scrollX;
    const y = this.y + scrollY;
    const fillLineSty = {
      borderColor: SELECT_BORDER_COLOR,
      borderWidth: 1,
      lineDash: [4, 4]
    }

    /**
     * 绘制单元格边框
     */
    painter.ctx.save()
    painter.drawRect(x, y, this.width, this.height, {
      fillColor: this.readonly ? READONLY_COLOR : fillColor,
      borderColor: this.borderColor,
      borderWidth: 1
    });
    painter.ctx.clip()

    /**
     * 绘制单元格内容
     */
    // const iconEl = this.dataType === 'datetime' ? timeIcon : (['month', 'date'].includes(this.dataType) ? dateIcon : null)
    painter.drawCellText(this.label, x, y, this.width, this.height, 10, {
      color: this.readonly ? READONLY_TEXT_COLOR : this.color,
      align: this.textAlign,
      baseLine: this.textBaseline,
      // icon: iconEl,
      iconOffsetX: 12,
      iconOffsetY: 1,
      iconWidth: 12,
      iconHeight: 12
    });
    if (this.dataType === 'select') {
      painter.drawCellAffixIcon('arrow', x, y, this.width, this.height-2, {
        color: '#bbbec4',
        fillColor: this.readonly ? READONLY_COLOR : fillColor
      })
    }

    /**
     * 绘制错误提示
     */
    if (!this.valid) {
      const points = [
        [x + this.width - 8, y],
        [x + this.width, y],
        [x + this.width, y + 8]
      ];
      painter.drawLine(points, {
        fillColor: ERROR_TIP_COLOR
      });
    }

    /**
     * 绘制选区
     */
    if (selector.show) {
      const minX = selector.xArr[0];
      const maxX = selector.xArr[1];
      const minY = selector.yArr[0];
      const maxY = selector.yArr[1];

      // background color
      if (
        this.colIndex >= minX &&
        this.colIndex <= maxX &&
        this.rowIndex >= minY &&
        this.rowIndex <= maxY
      ) {
        painter.drawRect(x, y, this.width, this.height, {
          fillColor: SELECT_AREA_COLOR
        });
      }
      // top／bottom border
      if (this.colIndex >= minX &&
        this.colIndex <= maxX &&
        this.rowIndex + 1 === minY) {
          const points = [
            [x, y + this.height - 1],
            [x + this.width, y + this.height - 1]
          ];
          painter.drawLine(points, {
            borderColor: SELECT_BORDER_COLOR,
            borderWidth: 1
          });
      }
      if (this.colIndex >= minX &&
        this.colIndex <= maxX &&
        this.rowIndex === maxY) {
          if (this.rowIndex === range.maxY) {
            const points = [
              [x, y + this.height],
              [x + this.width, y + this.height]
            ];
            painter.drawLine(points, {
              borderColor: SELECT_BORDER_COLOR,
              borderWidth: 2
            });
          } else {
            const points = [
              [x, y + this.height - 1],
              [x + this.width, y + this.height - 1]
            ];
            painter.drawLine(points, {
              borderColor: SELECT_BORDER_COLOR,
              borderWidth: 1
            });
          }
      }
      if (
        (this.colIndex >= minX &&
          this.colIndex <= maxX &&
          this.rowIndex === minY) ||
        (this.colIndex >= minX &&
          this.colIndex <= maxX &&
          this.rowIndex - 1 === maxY)
      ) {
        const points = [
          [x, y],
          [x + this.width, y]
        ];
        painter.drawLine(points, {
          borderColor: SELECT_BORDER_COLOR,
          borderWidth: 1
        });
      }
      // left／right border
      if (
        (this.colIndex === minX &&
          this.rowIndex >= minY &&
          this.rowIndex <= maxY) ||
        (this.colIndex - 1 === maxX &&
          this.rowIndex >= minY &&
          this.rowIndex <= maxY)
      ) {
        const points = [
          [x, y],
          [x, y + this.height]
        ];
        painter.drawLine(points, {
          borderColor: SELECT_BORDER_COLOR,
          borderWidth: 2
        });
      }
      if (
        (this.colIndex + 1 === minX &&
          this.rowIndex >= minY &&
          this.rowIndex <= maxY) ||
        (this.colIndex === maxX &&
          this.rowIndex >= minY &&
          this.rowIndex <= maxY)
      ) {
        const points = [
          [x + this.width, y],
          [x + this.width, y + this.height]
        ];
        painter.drawLine(points, {
          borderColor: SELECT_BORDER_COLOR,
          borderWidth: 2
        });
      }
      // autofill
      // autofill触点
      if (!editor.show) {
        const autofill_width = 6;
        const autofillSty = {
          borderColor: "#fff",
          borderWidth: 2,
          fillColor: SELECT_BORDER_COLOR
        }
        // left-top
        if (
          this.colIndex === autofill.xIndex &&
          this.rowIndex === autofill.yIndex
        ) {
          // -3让触点覆盖于边框之上
          painter.drawRect(
            x + this.width - 3,
            y + this.height - 3,
            autofill_width,
            autofill_width,
            autofillSty
          );
        }
        // right-top
        if (
          this.colIndex === autofill.xIndex &&
          this.rowIndex - 1 === autofill.yIndex
        ) {
          painter.drawRect(
            x + this.width - 3,
            y - 3,
            autofill_width,
            autofill_width,
            autofillSty
          );
        }
        // left-bottom
        if (
          this.colIndex - 1 === autofill.xIndex &&
          this.rowIndex === autofill.yIndex
        ) {
          painter.drawRect(
            x - 3,
            y + this.height - 3,
            autofill_width,
            autofill_width,
            autofillSty
          );
        }
        // right-bottom
        if (
          this.colIndex - 1 === autofill.xIndex &&
          this.rowIndex - 1 === autofill.yIndex &&
          this.colIndex !== this.grid.fixedLeft
        ) {
          painter.drawRect(
            x - 3, 
            y - 3, 
            autofill_width, 
            autofill_width, 
            autofillSty
          );
        }
      }
      // autofill选区
      if (autofill.enable) {
        const minX = autofill.xArr[0];
        const maxX = autofill.xArr[1];
        const minY = autofill.yArr[0];
        const maxY = autofill.yArr[1];

        // top／bottom border
        if (
          this.colIndex >= minX &&
          this.colIndex <= maxX &&
          this.rowIndex === minY
        ) {
          const points = [
            [x, y + 1],
            [x + this.width, y + 1]
          ];
          painter.drawLine(points, fillLineSty);
        }
        if (
          this.colIndex >= minX &&
          this.colIndex <= maxX &&
          this.rowIndex === maxY
        ) {
          const points = [
            [x, y + this.height - 1],
            [x + this.width, y + this.height - 1]
          ];
          painter.drawLine(points, fillLineSty);
        }
        // left／right border
        if (
          this.colIndex === minX &&
          this.rowIndex >= minY &&
          this.rowIndex <= maxY
        ) {
          const points = [
            [x + 1, y],
            [x + 1, y + this.height]
          ];
          painter.drawLine(points, fillLineSty);
        }
        if (
          this.colIndex === maxX &&
          this.rowIndex >= minY &&
          this.rowIndex <= maxY
        ) {
          const points = [
            [x + this.width - 1, y],
            [x + this.width - 1, y + this.height]
          ];
          painter.drawLine(points, fillLineSty);
        }
      }
    }
    // copy line
    if (clipboard.show) {
      const minX = clipboard.xArr[0];
      const maxX = clipboard.xArr[1];
      const minY = clipboard.yArr[0];
      const maxY = clipboard.yArr[1];
      // top／bottom border
      if (
        this.colIndex >= minX &&
        this.colIndex <= maxX &&
        this.rowIndex === minY
      ) {
        const points = [
          [x, y + 1],
          [x + this.width, y + 1]
        ];
        painter.drawLine(points, fillLineSty);
      }
      if (
        this.colIndex >= minX &&
        this.colIndex <= maxX &&
        this.rowIndex === maxY
      ) {
        const points = [
          [x, y + this.height - 2],
          [x + this.width, y + this.height - 2]
        ];
        painter.drawLine(points, fillLineSty);
      }
      // left／right border
      if (
        this.colIndex === minX &&
        this.rowIndex >= minY &&
        this.rowIndex <= maxY
      ) {
        const points = [
          [x + 1, y],
          [x + 1, y + this.height]
        ];
        painter.drawLine(points, fillLineSty);
      }
      if (
        this.colIndex === maxX &&
        this.rowIndex >= minY &&
        this.rowIndex <= maxY
      ) {
        const points = [
          [x + this.width - 1, y],
          [x + this.width - 1, y + this.height]
        ];
        painter.drawLine(points, fillLineSty);
      }
    }
  }
}

export default Cell;
