import RowHeader from './RowHeader.js'
import Cell from './Cell.js'
import Context from './Context.js'
import {CELL_WIDTH, ROW_INDEX_WIDTH, CHECK_BOX_WIDTH} from './constants';

class Row extends Context {
    constructor(grid, rowIndex, x, y, height, columns, data) {
        super(grid, x, y, grid.actualTableWidth, height)

        this.data = data;
        this.rowIndex = rowIndex;
        this.checked = false;

        this.fixedCells = [];
        this.cells = [];

        const style = {
            color: this.grid.color,
            fillColor: this.grid.fillColor,
            borderColor: this.grid.borderColor,
            borderWidth: this.grid.borderWidth,
            selectBorderColor: this.grid.selectBorderColor
        }
        this.rowHeader = new RowHeader(grid, rowIndex, x, y, ROW_INDEX_WIDTH, height, style)

        // cells对象集合
        const len = columns.length
        let everyOffsetX = ROW_INDEX_WIDTH + CHECK_BOX_WIDTH;

        for(let i = 0; i < len; i++) {
            const column = columns[i]
            const width = column.width || CELL_WIDTH
            const cell = new Cell(data[column.key], grid, i, rowIndex, everyOffsetX, y, width, this.height, column, style)
            
            if (column.fixed) {
                this.fixedCells.push(cell);
            } else {
                this.cells.push(cell);
            }
            
            everyOffsetX += width;
        }
    }
    handleCheck() {
        this.rowHeader.handleCheck()
    }
    mouseDown(x, y) {
        for(let i = 0; i < this.cells.length; i++) {
            if(this.cells[i].isInsideBoundary(x, y)) {
                this.cells[i].mouseDown(x, y);
            }
        }
    }
    mouseMove(x, y) {
        for(let i = 0; i < this.cells.length; i++) {
            if(this.cells[i].isInsideBoundary(x, y)) {
                this.cells[i].mouseMove(x, y);
            }
        }
    }
    mouseUp(x, y) {
        for(let i = 0; i < this.cells.length; i++) {
            if(this.cells[i].isInsideBoundary(x, y)) {
                this.cells[i].mouseUp(x, y);
            }
        }
    }
    click(x, y) {
        if(this.rowHeader.isInsideBoundary(x, y)) {
            this.rowHeader.click()
        }
    }
    dbClick(x, y) {
        for(let i = 0; i < this.cells.length; i++) {
            if(this.cells[i].isInsideBoundary(x, y)) {
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
        for(let i = 0; i < this.cells.length; i++) {
            this.cells[i].deselect();
        }
    }
    updateSelection(minColIndex, maxColIndex) {
        for(let i = minColIndex; i <= maxColIndex; i++) {
            this.cells[i].isSelected = true;
        }
    }
    resizeColumn(colIndex, width) {
        let cell = this.cells[colIndex]
        let oldWidth = cell.width;

        cell.width = width;

        for(let i = colIndex + 1; i < this.cells.length; i++) {
            this.cells[i].x += (width - oldWidth);
        }
    }
    rePaint() {
        for(let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            cell.height = this.height
            cell.y = this.y
        }
        for(let i = 0; i < this.fixedCells.length; i++) {
            const cell = this.fixedCells[i];
            cell.height = this.height
            cell.y = this.y
        }

        this.rowHeader.height = this.height
        this.rowHeader.y = this.y
    }
    draw() {
        // 绘制每行数据单元格
        for(let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if(cell.isVisibleOnScreen()) {
                cell.draw();
            }
        }
        // 左右冻结列
        for(let i = 0; i < this.fixedCells.length; i++) {
            const cell = this.fixedCells[i];
            cell.draw();
        }

        // 绘制每行索引及勾选框
        this.rowHeader.draw();
    }
}

export default Row