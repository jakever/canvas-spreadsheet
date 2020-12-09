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
    this.id = data[grid.rowKey]
    this.checked = false;

    this.allCells = [];
    this.fixedCells = [];
    this.cells = [];

    this.rowHeader = new RowHeader(
      this.id,
      grid,
      rowIndex,
      x,
      y,
      ROW_INDEX_WIDTH,
      height
    );

    // cells对象集合
    let everyOffsetX = grid.originFixedWidth;

    for (let i = 0; i < this.grid.columnsLength; i++) {
      const column = this.grid.columns[i];
      const width = column.width || SIZE_MAP[column.size || "small"];
      let fixed = "";
      
      if (i < this.grid.fixedLeft) {
        fixed = "left";
      } else if (i > this.grid.columnsLength - 1 - this.grid.fixedRight) {
        fixed = "right";
      }
      column.fixed = fixed

      const cell = new Cell(
        data[column.property],
        grid,
        i,
        rowIndex,
        everyOffsetX,
        y,
        width,
        this.height,
        column,
        data
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
      mouseY > this.y + this.grid.scrollY + this.height - 4 &&
      mouseY < this.y + this.height + this.grid.scrollY + 4
    );
  }
  handleCheck(checked) {
    this.checked = typeof checked === 'boolean' ? checked : !this.checked;
    this.rowHeader.handleCheck(this.checked);
  }
  handleBlur() {
    for (const cell of this.allCells) {
      cell.hoverColor = ''
    }
  }
  mouseMove(mouseX, mouseY) {
    const {
      width,
      tableWidth,
      verticalScrollerSize,
      scrollX,
      scrollY,
    } = this.grid;
    this.grid.focusRowIndex = this.rowIndex
    for (const cell of this.allCells) {
      if (
        cell.isInsideHorizontalBodyBoundary(mouseX, mouseY) ||
        cell.isInsideFixedHorizontalBodyBoundary(mouseX, mouseY)
      ) {
        const x =
          cell.fixed === "right"
            ? width -
              (tableWidth - cell.x - cell.width) -
              cell.width -
              verticalScrollerSize
            : cell.fixed === "left"
            ? cell.x
            : cell.x + scrollX;
        const y = cell.y + scrollY;
        if (cell.dropdown && cell.isInsideDropdownBoundary(mouseX, mouseY)) {
          this.grid.target.style.cursor = "pointer";
          this.grid.showDropdown({ 
            x: width - x - cell.dropdown.x - cell.dropdown.width, 
            y: y + cell.dropdown.y + cell.dropdown.height
          }, {
            row: this.data,
            rowIndex: this.rowIndex
          })
        } else {
          this.grid.showDropdown({ x: 0, y: -9999 })
        }
        if (cell.links && cell.links.length) {
          const link = cell.getLinkAtCoord(mouseX, mouseY)
          if (link) {
            this.grid.target.style.cursor = "pointer";
            if (cell.type === 'link') {
              cell.hoverColor = this.grid.colorPromary
              link.cardRender({ x: x + link.realX + link.width + 6, y: y + cell.height / 2 - 6 }, {
                row: this.data,
                rowIndex: this.rowIndex
              })
            }
          } else {
            this.grid.showPoptip({ x: -9999, y: -9999 })
          }
        } else {
          this.grid.showPoptip({ x: -9999, y: -9999 })
        }
        break;

        // 显示单元格tooltip校验失败提示文案
        // this.grid.tooltip.update({
        //   valid,
        //   message,
        //   x,
        //   y,
        //   colWidth: width,
        //   colHeight: height,
        //   fixed
        // });
      }
    }
  }
  click(mouseX, mouseY) {
    if (this.rowHeader.isInsideCheckboxBoundary(mouseX, mouseY)) {
      this.handleCheck();
      // body部分勾选状态发生变化，需要影响到表头的indeterminate状态
      // this.grid.handleCheckHeader()
      this.grid.handleSelectChange([this.data], this.checked)
    } else {
      // 点击按钮触发事件
      for (const cell of this.allCells) {
        if (
          cell.isInsideHorizontalBodyBoundary(mouseX, mouseY) ||
          cell.isInsideFixedHorizontalBodyBoundary(mouseX, mouseY)
        ) {
          if (cell.links && cell.links.length) {
            const link = cell.getLinkAtCoord(mouseX, mouseY)
            if (link) {
              link.handler({ row: this.data, rowIndex: this.rowIndex })
            }
          }
          break;
        }
      }
    }
  }
  resizeColumn(colIndex, diffWidth) {
    const scrollDiffWidth =
      this.grid.width -
      this.grid.tableWidth -
      this.grid.verticalScrollerSize -
      this.grid.scrollX;

    const cell = this.allCells[colIndex];
    if (scrollDiffWidth <= diffWidth) {
      cell.width += diffWidth;

      // 避免操作过快是出现断层
      for (let i = colIndex + 1; i < this.grid.columnsLength; i++) {
        this.allCells[i].x += diffWidth;
      }
    }
    
    // 滚动到最右侧，调小列宽时只更新目标列宽和相邻下一列的x轴坐标
    if (scrollDiffWidth === 0 && diffWidth <= 0) {
      cell.width += diffWidth;
      this.allCells[colIndex + 1].width -= diffWidth;
      this.allCells[colIndex + 1].x += diffWidth;
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
    this.checked = this.grid.checkedIds.includes(this.id)
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
          shadowBlur: 4,
          shadowColor: "rgba(143, 140, 140, 0.22)",
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
          shadowBlur: 4,
          shadowColor: "rgba(143, 140, 140, 0.22)",
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
