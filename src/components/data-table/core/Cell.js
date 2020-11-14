import Context from "./Context.js";
import { ROW_FOCUS_COLOR } from './constants'
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

    this.label = column.label;
    this.property = column.property;
    this.fixed = column.fixed;
    this.textAlign = column.align || "left";
    this.textBaseline = column.baseline || "middle";
    this.links = column.links
    this.dropdown = column.dropdown
    this.render = column.render;

    this.value = value === null || value === undefined ? "" : value;

    this.message = null;

    Object.assign(this, options);
    this.setLabel(this.value);
    this.initButtons(column)
  }
  setLabel(val) {
    let label = val;
    if (typeof this.render === "function") {
      label = this.render(val);
    }
    this.label = label === null || label === undefined ? "" : label;
  }
  initButtons(column) {
    let textWidth = 0
    if (this.links.length) {
      textWidth = this.grid.painter.ctx.measureText(this.links[0].label).width
    }
    let x = textWidth / 2 + 10
    this.buttons = column.links.map(item => {
      const textW = this.grid.painter.ctx.measureText(this.links[0].label).width
      const config = {
        ...item,
        x,
        y: (this.height - 12) / 2,
        width: textW,
        height: 12
      }
      x += 16 + textW
      return config
    })
    let _x = this.buttons.reduce((total, item) => {
      return total + this.grid.painter.ctx.measureText(item.label).width + 16
    }, 10)
    this.dropdown = {
      ...column.dropdown,
      x: _x,
      y: (this.height - 12) / 2,
      width: 16,
      height: 4
    }
  }
  draw() {
    const {
      painter,
      width,
      tableWidth,
      verticalScrollerSize,
      scrollX,
      scrollY,
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

    /**
     * 绘制单元格边框
     */
    painter.ctx.save()
    painter.drawRect(x, y, this.width, this.height, {
      fillColor: this.grid.focusRowIndex === this.rowIndex ? ROW_FOCUS_COLOR : fillColor,
      // borderColor: this.borderColor,
      borderWidth: this.borderWidth
    });
    
    painter.ctx.clip()
    painter.drawTBBorder(x, y, this.width, this.height, {
      borderColor: this.borderColor,
      borderWidth: this.borderWidth
    })

    /**
     * 绘制单元格内容
     */
    if (this.links.length || this.dropdown.length) {
      this.buttons.forEach((item) => {
        painter.drawText(item.label, x + item.x, y + this.height / 2, {
          color: '#0bb27a',
          align: this.textAlign,
          baseLine: this.textBaseline,
        })
      })
      let _x = this.dropdown.x
      Array.from({length: 3}).forEach(() => {
        painter.drawCircle(x + _x, y + this.height / 2)
        _x += 8
      })
      
    } else {
      painter.drawCellText(this.label, x, y, this.width, this.height, 10, {
        color: this.color,
        align: this.textAlign,
        baseLine: this.textBaseline,
        // icon: iconEl,
        // iconOffsetX: 12,
        // iconOffsetY: 1,
        // iconWidth: 12,
        // iconHeight: 12
      });
    }
  }
}

export default Cell;
