import RowHeader from "./RowHeader.js";
import Cell from "./Cell.js";
import Context from "./Context.js";
import { 
  ROW_INDEX_WIDTH,
  SIZE_MAP
} from "./constants";

class Row extends Context {
  constructor(grid, rowIndex, x, y, height, data) {
    super(grid, x, y, null, height);

    this.data = data;
    this.rowIndex = rowIndex;
    this.checked = false;

    this.allCells = [];
    this.fixedCells = [];
    this.cells = [];

    const style = {
      color: this.grid.color,
      fillColor: this.grid.fillColor,
      borderColor: this.grid.borderColor,
      borderWidth: this.grid.borderWidth
    };
    this.rowHeader = new RowHeader(
      grid,
      rowIndex,
      x,
      y,
      ROW_INDEX_WIDTH,
      height,
      style
    );

    // cells对象集合
    let everyOffsetX = grid.originFixedWidth;

    for (let i = 0; i < this.grid.columnsLength; i++) {
      const column = this.grid.columns[i];
      const width = SIZE_MAP[column.size || "mini"];
      let fixed = "";
      
      if (i < this.grid.fixedLeft) {
        fixed = "left";
      } else if (i > this.grid.columnsLength - 1 - this.grid.fixedRight) {
        fixed = "right";
      }
      column.fixed = fixed

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
        data,
        style
      );

      this.allCells.push(cell);
      if (fixed) {
        this.fixedCells.push(cell);
      } else {
        this.cells.push(cell);
      }

      everyOffsetX += width;
    }
  }
  // 鼠标枞坐标是否位于焦点单元格所在的autofill触点范围内
  isInVerticalAutofill(mouseX, mouseY) {
    return (
      this.grid.autofill.yIndex === this.rowIndex &&
      mouseY > this.y + this.grid.scrollY + this.height - 3 &&
      mouseY < this.y + this.height + this.grid.scrollY + 3
    );
  }
  handleCheck(checked) {
    this.checked = typeof checked === 'boolean' ? checked : !this.checked;
    this.rowHeader.handleCheck(this.checked);
  }
  // 选中单个单元格
  mouseDown(x, y) {
    // 如果位于autofill触点上则不执行发选择单元格
    const cell = this.allCells[this.grid.autofill.xIndex];
    if (cell && (
      cell.isInHorizontalAutofill(x, y) ||
      cell.isInsideFixedHorizontalAutofill(x, y)
    )) {
      return
    }

    for (let i = 0; i < this.allCells.length; i++) {
      const cell = this.allCells[i];
      if (
        cell.isInsideHorizontalBodyBoundary(x, y) ||
        cell.isInsideFixedHorizontalBodyBoundary(x, y)
      ) {
        this.grid.selectCell(cell);
      }
    }
  }
  // 批量选中单元格时移动批量选取
  mouseMove(mouseX, mouseY) {
    for (let i = 0; i < this.allCells.length; i++) {
      const cell = this.allCells[i];
      if (
        cell.isInsideHorizontalTableBoundary(mouseX, mouseY) ||
        cell.isInsideFixedHorizontalBodyBoundary(mouseX, mouseY)
      ) {
        const { colIndex, rowIndex, x, y, width, height, valid, message, fixed } = cell;
        this.grid.multiSelectCell(colIndex, rowIndex, mouseX, mouseY);

        // 显示单元格tooltip提示
        this.grid.tooltip.update({
          valid,
          message,
          x,
          y,
          colWidth: width,
          colHeight: height,
          fixed
        });
      }
    }
  }
  // 寻找autofill触点
  handleAutofill(x, y) {
    const cell = this.allCells[this.grid.autofill.xIndex];
    if (!cell) return;
    if (
      cell.isInHorizontalAutofill(x, y) ||
      cell.isInsideFixedHorizontalAutofill(x, y)
    ) {
      this.grid.target.style.cursor = "crosshair";
    }
  }
  // 单击autofill触点开始拖拽
  handleStartAutofill(x, y) {
    const cell = this.allCells[this.grid.autofill.xIndex];
    if (!cell) return;
    if (
      cell.isInHorizontalAutofill(x, y) ||
      cell.isInsideFixedHorizontalAutofill(x, y)
    ) {
      this.grid.startAutofill();
    }
  }
  click(x, y) {
    if (this.rowHeader.isInsideCheckboxBoundary(x, y)) {
      this.handleCheck();
    }
  }
  dbClick(x, y) {
    for (let i = 0; i < this.allCells.length; i++) {
      const cell = this.allCells[i];
      if (
        cell.isInsideHorizontalBodyBoundary(x, y) ||
        cell.isInsideFixedHorizontalBodyBoundary(x, y)
      ) {
        this.grid.startEdit();
      }
    }
  }
  resizeColumn(colIndex, width) {
    const scrollRightBoundry =
      this.grid.width -
        this.grid.tableWidth -
        this.grid.verticalScrollerSize ===
      this.grid.scrollX;
    const cell = this.allCells[colIndex];
    const oldWidth = cell.width;
    cell.width = width;
    if (scrollRightBoundry && width < oldWidth) {
      this.allCells[colIndex + 1].width += oldWidth - width;
      this.allCells[colIndex + 1].x += width - oldWidth;
    } else {
      for (let i = colIndex + 1; i < this.grid.columnsLength; i++) {
        this.allCells[i].x += width - oldWidth;
      }
    }
  }
  rePaint() {
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      cell.height = this.height;
      cell.y = this.y;
    }
    for (let i = 0; i < this.fixedCells.length; i++) {
      const cell = this.fixedCells[i];
      cell.height = this.height;
      cell.y = this.y;
    }

    this.rowHeader.height = this.height;
    this.rowHeader.y = this.y;
  }
  draw() {
    // 绘制主体body部分
    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      if (cell.isHorizontalVisibleOnBody()) {
        cell.draw();
      }
    }
    // 固定列阴影
    if (this.grid.scrollX !== 0) {
      this.grid.painter.drawRect(
        this.x + this.grid.originFixedWidth,
        this.y + this.grid.scrollY,
        this.grid.fixedLeftWidth - this.grid.originFixedWidth,
        this.height,
        {
          fillColor: "#f9f9f9",
          shadowBlur: 6,
          shadowColor: "rgba(28,36,56,0.2)",
          shadowOffsetX: 2,
          shadowOffsetY: 2
        }
      );
    }
    if (
      this.grid.tableWidth +
        this.grid.verticalScrollerSize -
        this.grid.width +
        this.grid.scrollX >
      0
    ) {
      this.grid.painter.drawRect(
        this.grid.width - this.grid.fixedRightWidth,
        this.y + this.grid.scrollY,
        this.grid.fixedRightWidth - this.grid.verticalScrollerSize,
        this.height,
        {
          fillColor: "#f9f9f9",
          shadowBlur: 6,
          shadowColor: "rgba(28,36,56,0.2)",
          shadowOffsetX: -2,
          shadowOffsetY: 2
        }
      );
    }

    // 左右冻结列
    for (let i = 0; i < this.fixedCells.length; i++) {
      const cell = this.fixedCells[i];
      cell.draw();
    }

    // 绘制每行索引及勾选框
    this.rowHeader.draw();
  }
}

export default Row;
