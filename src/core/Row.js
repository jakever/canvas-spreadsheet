import RowHeader from './RowHeader.js'
import Cell from './Cell.js'
import Context from './Context.js'
import {CELL_WIDTH, ROW_INDEX_WIDTH, CHECK_BOX_WIDTH} from './constants';

class Row extends Context {
    constructor(grid, rowIndex, x, y, height, columns, data) {
        super(grid, x, y, null, height)

        this.data = data;
        this.rowIndex = rowIndex;
        this.checked = false;

        this.fixedCells = [];
        this.cells = [];

        const style = {
            color: this.grid.color,
            fillColor: this.grid.fillColor,
            borderColor: this.grid.borderColor,
            borderWidth: this.grid.borderWidth
        }
        this.rowHeader = new RowHeader(grid, rowIndex, x, y, ROW_INDEX_WIDTH, height, style)

        // cells对象集合
        let everyOffsetX = grid.originFixedWidth;

        for(let i = 0; i < this.grid.columnsLength; i++) {
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
        this.checked = !this.checked
        this.rowHeader.handleCheck(this.checked)
    }
    mouseDown(x, y) {
        for(let i = 0; i < this.cells.length; i++) {
            if(this.cells[i].isInsideHorizontalBodyBoundary(x, y)) {
                this.cells[i].mouseDown(x, y);
            }
        }
    }
    mouseMove(x, y) {
        for(let i = 0; i < this.cells.length; i++) {
            if(this.cells[i].isInsideHorizontalBodyBoundary(x, y)) {
                this.cells[i].mouseMove(x, y);
            }
        }
    }
    mouseUp(x, y) {
        for(let i = 0; i < this.cells.length; i++) {
            if(this.cells[i].isInsideHorizontalBodyBoundary(x, y)) {
                this.cells[i].mouseUp(x, y);
            }
        }
    }
    click(x, y) {
        if(this.rowHeader.isInsideCheckboxBoundary(x, y)) {
            this.rowHeader.click()
        }
    }
    dbClick(x, y) {
        for(let i = 0; i < this.cells.length; i++) {
            if(this.cells[i].isInsideHorizontalBodyBoundary(x, y)) {
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
    resizeColumn(colIndex, width) {
        const scrollRightBoundry = this.grid.width - this.grid.tableWidth === this.grid.scrollX
        const cell = this.cells[colIndex]
        const oldWidth = cell.width;
        if (colIndex + 1 === this.grid.columnsLength - this.grid.fixedLeft - this.grid.fixedRight && width <= oldWidth) {
            return
        }
        cell.width = width;
        if (scrollRightBoundry && width < oldWidth) {
            this.cells[colIndex + 1].width += (oldWidth - width)
            this.cells[colIndex + 1].x += (width - oldWidth)
        } else {
            for(let i = colIndex + 1; i < this.cells.length; i++) {
                this.cells[i].x += (width - oldWidth);
            }
            for(let i = 0; i < this.fixedCells.length; i++) {
                if (this.fixedCells[i].fixed === 'right') {
                    this.fixedCells[i].x += (width - oldWidth);
                }
            }
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
        // 绘制主体body部分
        for(let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            if(cell.isHorizontalVisibleOnBody()) {
                cell.draw();
            }
        }
        // 固定列阴影
        // if (this.grid.scrollX !== 0) {
        //     this.grid.painter.drawRect(this.x, this.y + this.grid.scrollY, this.grid.originFixedWidth + this.grid.fixedLeftWidth, this.height, {
        //         fillColor: '#f9f9f9',
        //         shadowBlur: 10,
        //         shadowColor: 'rgba(0,0,0,0.2)',
        //         shadowOffsetX: 3,
        //         shadowOffsetY: 3
        //     })
        // }

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