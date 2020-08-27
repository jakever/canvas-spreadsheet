import { ERROR_TIP_COLOR } from "./constants.js";

class Tooltip {
  constructor(grid, x, y, message, type) {
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.width = 200;
    this.height = 90;
    this.valid = true;
    this.message = message;
  }
  update(value) {
    Object.assign(this, value);
  }
  draw() {
    const {
      selector,
      scrollX,
      scrollY,
      width,
      height,
      tableWidth,
      verticalScrollerSize,
      color,
      painter
    } = this.grid
    if (!this.valid && !selector.isSelected) {
      const poX = this.x + this.colWidth + 2
      const poY = this.y + 1
      const isBeyondHorizontalView = poX + this.width + scrollX > width // tooltip浮层是否超过水平可视区
      const isBeyondVerticalView = poY + this.height + scrollY > height // tooltip浮层是否超过垂直可视区
      let x = isBeyondHorizontalView
        ? this.fixed === 'right'
          ? width -
            (tableWidth - this.x - this.colWidth) -
            this.colWidth -
            verticalScrollerSize -
            this.width -
            1
          : this.x - this.width - 1
        : poX;
      if (!this.fixed) {
        x += scrollX;
      }
      let y = isBeyondVerticalView
        ? this.y - (this.height - this.colHeight) - 1
        : this.y
      y += scrollY;
      painter.drawRoundRect(x, y, this.width, this.height, 4, {
        shadowBlur: 16,
        shadowColor: "rgba(28,36,56,0.16)",
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        fillColor: "#fff",
        borderWidth: 1
      });

      painter.drawCellText("数据错误", x, y + 24, this.width, this.height, 16, {
        font:
          'bold 14px "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
        color: ERROR_TIP_COLOR,
        align: "left",
        baseLine: "bottom"
      });

      const textArr = painter.getTextWrapping(
        this.message,
        this.width,
        16
      );
      let _y = y + 50;
      for (let i = 0; i < textArr.length; i++) {
        painter.drawCellText(
          textArr[i],
          x,
          _y + i * 18,
          this.width,
          this.height,
          16,
          {
            color,
            align: "left",
            baseLine: "bottom"
          }
        );
      }
    }
  }
}

export default Tooltip;
