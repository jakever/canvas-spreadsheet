import RowHeader from "./RowHeader.js";
import Cell from "./Cell.js";
import { CELL_WIDTH, ROW_HEADER_WIDTH, CHECK_BOX_WIDTH } from "./constants";

class Row {
  constructor(grid, rowIndex, x, y, height, columns, data, options) {
    this.grid = grid;
    this.data = data;
    this.rowIndex = rowIndex;
    this.x = x;
    this.y = y;
    this.height = height;
    this.checked = false;

    this.fixedLeftCells = [];
    this.fixedRightCells = [];
    this.cells = [];
    this.rowHeader = new RowHeader(
      grid,
      rowIndex,
      x,
      y,
      ROW_HEADER_WIDTH,
      height,
      {
        color: "#495060",
        bgColor: "#f8f8f9",
        borderColor: "#d4d4d4",
        borderWidth: 1
      }
    );

    // cells对象集合
    const len = columns.length;
    let everyOffsetX = ROW_HEADER_WIDTH + CHECK_BOX_WIDTH;

    for (let i = 0; i < len; i++) {
      const column = columns[i];
      const width = column.width || CELL_WIDTH;
      const cell = new Cell(
        data[column.key],
        grid,
        i,
        rowIndex,
        everyOffsetX,
        y,
        width,
        this.height,
        column,
        options
      );

      if (column.fixed === "left") {
        this.fixedLeftCells.push(cell);
      } else if (column.fixed === "right") {
        this.fixedRightCells.push(cell);
      } else {
        this.cells.push(cell);
      }

      everyOffsetX += width;
    }
  }
  // 表头行是否超过了画布底部可视区的边界
  isVisibleOnScreen() {
    return !(
      this.x + this.grid.scrollX + this.grid.actualTableWidth < 0 ||
      this.x + this.grid.scrollX > this.grid.width ||
      this.y + this.grid.scrollY + this.height < 0 ||
      this.y + this.grid.scrollY > this.grid.height
    );
  }
  // 判断行是否和否鼠标所在位置有交集
  isInsideBoundary(mouseX, mouseY) {
    return (
      mouseX > this.x + this.grid.scrollX &&
      mouseX < this.x + this.grid.scrollX + this.grid.actualTableWidth &&
      mouseY > this.y + this.grid.scrollY &&
      mouseY < this.y + this.grid.scrollY + this.height
    );
  }
  handleCheck() {
    this.rowHeader.handleCheck();
  }
  mouseDown(x, y) {
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].isInsideBoundary(x, y)) {
        this.cells[i].mouseDown(x, y);
      }
    }
  }
  mouseMove(x, y) {
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].isInsideBoundary(x, y)) {
        this.cells[i].mouseMove(x, y);
      }
    }
  }
  mouseUp(x, y) {
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].isInsideBoundary(x, y)) {
        this.cells[i].mouseUp(x, y);
      }
    }
  }
  click(x, y) {
    if (this.rowHeader.isInsideBoundary(x, y)) {
      this.rowHeader.click();
    }
  }
  dbClick(x, y) {
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].isInsideBoundary(x, y)) {
        this.cells[i].dbClick(x, y);
      }
    }
  }
  // getCell(colIndex, rowIndex) {
  //     const row = this.get(rowIndex);
  //     if (row !== undefined && this.cells !== undefined && this.cells[colIndex] !== undefined) {
  //         return this.cells[colIndex];
  //     }
  //     return null;
  // }
  deselectAllCells() {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].deselect();
    }
  }
  updateSelection(minColIndex, maxColIndex) {
    for (let i = minColIndex; i <= maxColIndex; i++) {
      this.cells[i].isSelected = true;
    }
  }
  resizeColumn(colIndex, width) {
    let cell = this.cells[colIndex];
    let oldWidth = cell.width;

    cell.width = width;

    for (let i = colIndex + 1; i < this.cells.length; i++) {
      this.cells[i].x += width - oldWidth;
    }
  }
  rePaint() {
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      cell.height = this.height;
      cell.y = this.y;
    }
    for (let i = 0; i < this.fixedLeftCells.length; i++) {
      const cell = this.fixedLeftCells[i];
      cell.height = this.height;
      cell.y = this.y;
    }
    for (let i = 0; i < this.fixedRightCells.length; i++) {
      const cell = this.fixedRightCells[i];
      cell.height = this.height;
      cell.y = this.y;
    }

    this.rowHeader.height = this.height;
    this.rowHeader.y = this.y;
  }
  draw() {
    // 绘制每行数据单元格
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      if (cell.isVisibleOnScreen()) {
        cell.draw();
      }
    }
    for (let i = 0; i < this.fixedLeftCells.length; i++) {
      const cell = this.fixedLeftCells[i];
      cell.draw();
    }
    for (let i = 0; i < this.fixedRightCells.length; i++) {
      const cell = this.fixedRightCells[i];
      cell.draw();
    }

    // 绘制每行索引
    this.rowHeader.draw();
  }
}

export default Row;
