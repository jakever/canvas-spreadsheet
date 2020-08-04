import {
  SELECT_BORDER_COLOR,
  SELECT_BG_COLOR
} from "./constants.js";
import Context from "./Context.js";

class ColumnHeader extends Context {
  constructor(grid, index, x, y, width, height, column, options) {
    super(grid, x, y, width, height);

    this.fixed = column.fixed;
    this.level = column.level
    this.text = column.title;
    this.colspan = column.colspan
    this.rowspan = column.rowspan
    this.index = index;

    Object.assign(this, options);
  }
  // 表头是否超过了右侧可视区的边界
  isVisibleOnScreen() {
    return !(
      this.x + this.width - this.grid.fixedLeftWidth + this.grid.scrollX <= 0 ||
      this.x + this.grid.scrollX >= this.grid.width - this.grid.fixedRightWidth
    );
  }
  draw() {
    // 绘制表头每个单元格框
    const x =
      this.fixed === "right"
        ? this.grid.width -
          (this.grid.tableWidth - this.x - this.width) -
          this.width -
          this.grid.verticalScrollerSize
        : this.fixed === "left"
        ? this.x
        : this.x + this.grid.scrollX;
    const editor = this.grid.editor;
    const selector = this.grid.selector;
    this.grid.painter.drawRect(x, this.y, this.width, this.height, {
      fillColor: this.fillColor,
      borderColor: this.borderColor,
      borderWidth: this.borderWidth
    });

    /**
     * 焦点高亮
     */
    if (selector.show || editor.show) {
      const minX = selector.xArr[0];
      const maxX = selector.xArr[1];

      // 背景
      if (this.index >= minX && this.index <= maxX) {
        this.grid.painter.drawRect(x, this.y, this.width, this.height, {
          fillColor: SELECT_BG_COLOR
        });
      }

      // 线
      if (this.index >= minX && this.index <= maxX) {
        const points = [
          [x, this.y + this.height],
          [x + this.width, this.y + this.height]
        ];
        this.grid.painter.drawLine(points, {
          borderColor: SELECT_BORDER_COLOR,
          borderWidth: 2
        });
      }
      // if (this.index - 1 === maxX) {
      //   const points = [
      //     [x - 1, this.y + this.height],
      //     [x, this.y + this.height]
      //   ];
      //   this.grid.painter.drawLine(points, {
      //     borderColor: SELECT_BORDER_COLOR,
      //     borderWidth: 2
      //   });
      // }
    }

    // 绘制表头每个单元格文本
    this.grid.painter.drawText(
      this.text,
      x + this.width / 2,
      this.y + this.height / 2,
      {
        color: this.color
      }
    );
  }
}

export default ColumnHeader;
