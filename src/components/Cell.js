import { CELL_WIDTH } from "./constants";

class Cell {
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
    this.grid = grid;
    this.fixed = column.fixed;
    this.colIndex = colIndex - grid.fixedLeft;
    this.rowIndex = rowIndex;
    this.width = width;
    this.height = height;
    this.x =
      this.fixed === "right"
        ? grid.width - (grid.actualTableWidth - x - this.width) - this.width
        : x;
    this.y = y;
    this.isSelected = false;
    this.value = value;

    Object.assign(
      this,
      {
        color: "#495060",
        bgColor: "#fff",
        borderColor: "#d4d4d4",
        borderWidth: 1
      },
      options
    );
  }
  // 判断单元格是否超过了右侧和底部可视区的边界
  isVisibleOnScreen() {
    return !(
      this.x + this.grid.scrollX + this.width < 0 ||
      this.x + this.grid.scrollX > this.grid.width ||
      this.y + this.grid.scrollY + this.height < 0 ||
      this.y + this.grid.scrollY > this.grid.height
    );
  }
  // 判断单元格是否和否鼠标所在位置有交集
  isInsideBoundary(mouseX, mouseY) {
    return (
      mouseX > this.x + this.grid.scrollX &&
      mouseX < this.x + this.grid.scrollX + this.width &&
      mouseY > this.y + this.grid.scrollY &&
      mouseY < this.y + this.grid.scrollY + this.height
    );
  }
  mouseDown() {
    this.grid.selectCell(this.colIndex, this.rowIndex);
    this.grid.updateSelection(this.colIndex, this.rowIndex);
  }
  setData(val) {
    this.value = val;
  }
  mouseMove() {
    this.grid.updateSelection(this.colIndex, this.rowIndex);
  }
  mouseUp() {
    this.grid.endMultiSelect();
  }
  dbClick() {
    this.grid.startEdit(this);
  }
  deselect() {
    this.isSelected = false;
  }
  draw() {
    const x = this.fixed ? this.x : this.x + this.grid.scrollX;
    this.grid.painter.drawRect(
      x,
      this.grid.scrollY + this.y,
      this.width,
      this.height,
      {
        fillColor: this.isSelected ? "#b5d1ff57" : this.bgColor,
        borderColor: this.borderColor,
        borderWidth: this.borderWidth
      }
    );
    const textArr = this.grid.painter.getTextWrapping(this.value, this.width);
    let height = this.grid.scrollY + this.y + this.height / 2;
    if (textArr && textArr.length > 1) {
      height = this.grid.scrollY + this.y + 15;
    }
    for (let i = 0; i < textArr.length; i++) {
      this.grid.painter.drawText(
        textArr[i],
        x + this.width / 2,
        height + i * 18,
        {
          color: this.color
        }
      );
    }
  }
}

export default Cell;
