import {
  SELECT_BORDER_COLOR,
  SELECT_AREA_COLOR,
  SELECT_BG_COLOR,
  READONLY_COLOR,
  READONLY_TEXT_COLOR,
  ERROR_TIP_COLOR,
  VALIDATOR_TYPES
} from "./constants.js";
import Context from "./Context.js";
import Validator from "./Validator.js";

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
    options
  ) {
    super(grid, x, y, width, height, column.fixed);
    this.colIndex = colIndex;
    this.rowIndex = rowIndex;

    this.title = column.title;
    this.key = column.key;
    this.fixed = column.fixed;
    this.readonly = column.readonly;
    this.textAlign = column.align || "left";
    this.textBaseline = column.baseline || "middle";
    this.dataType = column.type || "text";
    this.options = column.options;
    this.render = column.render;

    this.value = value;
    this.originalValue = value;

    this.validator = new Validator(column);
    this.valid = true;
    this.message = null;

    Object.assign(this, options, {
      fillColor: "#fff"
    });
    this.setLabel(value);
    if (column.rule && column.rule.immediate !== false) { // 编辑器初始化不需要校验
      this.validate();
    } else if (VALIDATOR_TYPES.includes(column.type)) {
      this.validate();
    }
  }
  isInHorizontalAutofill(mouseX, mouseY) {
    return (
      mouseX > this.x + this.grid.scrollX + this.width - 3 &&
      mouseX < this.x + this.grid.scrollX + this.width + 3 &&
      mouseX > this.grid.fixedLeftWidth &&
      mouseX < this.grid.width - this.grid.fixedRightWidth
    );
  }
  isInsideFixedHorizontalAutofill(mouseX, mouseY) {
    const x =
      this.grid.width -
      (this.grid.tableWidth - this.x - this.width) -
      this.width -
      this.grid.verticalScrollerSize;
    return (
      (mouseX >= x + this.width - 3 &&
        mouseX < x + this.width + 3 &&
        this.fixed === "right") ||
      (mouseX > this.x + this.width - 3 &&
        mouseX < this.x + this.width + 3 &&
        this.fixed === "left")
    );
  }
  validate() {
    const { flag, message } = this.validator.validate(this.value);
    this.valid = flag;
    this.message = message;
  }
  setData(val) {
    if (this.readonly) return;
    this.value = val;
    this.setLabel(val);
    this.validate()

    // changed diff
    if (this.value !== this.originalValue) {
      this.grid.hashChange[`${this.colIndex}-${this.rowIndex}`] = true;
    } else {
      delete this.grid.hashChange[`${this.colIndex}-${this.rowIndex}`];
    }
  }
  setLabel(val) {
    let label = val;
    if (typeof this.render === "function") {
      label = this.render(val);
    } else {
      label = this.validator.filterValue(val);
    }
    this.label = label === null || label === undefined ? "" : label;
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
      range
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

    painter.drawRect(x, y, this.width, this.height, {
      fillColor: this.readonly ? READONLY_COLOR : this.fillColor,
      borderColor: this.borderColor,
      borderWidth: 1
    });

    /**
     * 选中当前焦点行、列
     */
    // if (selector.show || editor.show) {
    //     if (this.rowIndex === editor.yIndex) {
    //         painter.drawRect(x, y, this.width, this.height, {
    //             fillColor: SELECT_BG_COLOR
    //         });
    //     }
    //     if (this.colIndex === editor.xIndex) {
    //         painter.drawRect(x, y, this.width, this.height, {
    //             fillColor: SELECT_BG_COLOR
    //         });
    //     }
    // }

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
      if (!editor.show) {
        const autofill_width = 6;
        if (
          this.colIndex === autofill.xIndex &&
          this.rowIndex === autofill.yIndex
        ) {
          // -2让触点覆盖于边框之上
          painter.drawRect(
            x + this.width - 3,
            y + this.height - 3,
            autofill_width,
            autofill_width,
            {
              borderColor: "#fff",
              borderWidth: 2,
              fillColor: SELECT_BORDER_COLOR
            }
          );
        }
        if (
          this.colIndex === autofill.xIndex &&
          this.rowIndex - 1 === autofill.yIndex
        ) {
          painter.drawRect(
            x + this.width - 3,
            y - 3,
            autofill_width,
            autofill_width,
            {
              borderColor: "#fff",
              borderWidth: 2,
              fillColor: SELECT_BORDER_COLOR
            }
          );
        }
        if (
          this.colIndex - 1 === autofill.xIndex &&
          this.rowIndex === autofill.yIndex
        ) {
          painter.drawRect(
            x - 3,
            y + this.height - 3,
            autofill_width,
            autofill_width,
            {
              borderColor: "#fff",
              borderWidth: 2,
              fillColor: SELECT_BORDER_COLOR
            }
          );
        }
        if (
          this.colIndex - 1 === autofill.xIndex &&
          this.rowIndex - 1 === autofill.yIndex &&
          this.colIndex !== this.grid.fixedLeft
        ) {
          // -2让触点覆盖于边框之上
          painter.drawRect(x - 3, y - 3, autofill_width, autofill_width, {
            borderColor: "#fff",
            borderWidth: 2,
            fillColor: SELECT_BORDER_COLOR
          });
        }
      }
      if (autofill.enable) {
        const lineDash = [4, 4];
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
          painter.drawLine(points, {
            borderColor: SELECT_BORDER_COLOR,
            borderWidth: 1,
            lineDash
          });
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
          painter.drawLine(points, {
            borderColor: SELECT_BORDER_COLOR,
            borderWidth: 1,
            lineDash
          });
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
          painter.drawLine(points, {
            borderColor: SELECT_BORDER_COLOR,
            borderWidth: 1,
            lineDash
          });
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
          painter.drawLine(points, {
            borderColor: SELECT_BORDER_COLOR,
            borderWidth: 1,
            lineDash
          });
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
      const lineDash = [4, 4];
      if (
        this.colIndex >= minX &&
        this.colIndex <= maxX &&
        this.rowIndex === minY
      ) {
        const points = [
          [x, y + 1],
          [x + this.width, y + 1]
        ];
        painter.drawLine(points, {
          borderColor: SELECT_BORDER_COLOR,
          borderWidth: 1,
          lineDash
        });
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
        painter.drawLine(points, {
          borderColor: SELECT_BORDER_COLOR,
          borderWidth: 1,
          lineDash
        });
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
        painter.drawLine(points, {
          borderColor: SELECT_BORDER_COLOR,
          borderWidth: 1,
          lineDash
        });
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
        painter.drawLine(points, {
          borderColor: SELECT_BORDER_COLOR,
          borderWidth: 1,
          lineDash
        });
      }
    }

    // const textArr = painter.getTextWrapping(this.value, this.width)
    let _y = y + this.height / 2;
    // // 如果文本超出列宽，则不再已列高／2垂直剧中
    // if (textArr && textArr.length > 1) {
    //     _y = y + 10
    // }
    // for (let i = 0; i < textArr.length; i++) {
    //     painter.drawText(textArr[i], x + this.width / 2, _y + i * 18, {
    //         color: this.color
    //     });
    // }

    painter.drawCellText(this.label, x, _y, this.width, 10, {
      color: this.readonly ? READONLY_TEXT_COLOR : this.color,
      align: this.textAlign,
      baseLine: this.textBaseline
    });
  }
}

export default Cell;
