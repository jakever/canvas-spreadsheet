import Context from "./Context.js";
import { HEADER_BG_COLOR } from './constants'

class ColumnHeader extends Context {
  constructor(grid, index, x, y, width, height, column) {
    super(grid, x, y, width, height);

    this.fixed = column.fixed;
    this.level = column.level
    this.text = column.label;
    this.colspan = column.colspan
    this.rowspan = column.rowspan
    this.textAlign = column.align || "left";
    this.textBaseline = column.baseline || "middle";
    this.required = column.rule ? column.rule.required : null
    this.index = index;
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
    const {
      width,
      tableWidth,
      verticalScrollerSize,
      scrollX,
      painter,
      fillColor,
      borderColor,
      borderWidth
    } = this.grid
    const x =
      this.fixed === "right"
        ? width -
          (tableWidth - this.x - this.width) -
          this.width -
          verticalScrollerSize
        : this.fixed === "left"
        ? this.x
        : this.x + scrollX;
    /**
     * 绘制表头
     */
    painter.ctx.save()
    painter.drawRect(x, this.y, this.width, this.height, {
      // borderColor,
      fillColor: HEADER_BG_COLOR,
      borderWidth
    });
    painter.ctx.clip()
    painter.drawTBBorder(x, this.y, this.width, this.height, {
      borderColor,
      borderWidth
    })

    // 绘制表头每个单元格文本
    this.grid.painter.drawCellText(
      this.text,
      x,
      this.y,
      this.width,
      this.height,
      10,
      {
        color: this.grid.color,
        align: this.textAlign,
        baseLine: this.textBaseline
      }
    );
  }
}

export default ColumnHeader;
