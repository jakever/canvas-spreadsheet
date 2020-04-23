import RowHeader from './RowHeader.js'
import Cell from './Cell.js'
import Context from './Context.js'
import { 
    ROW_INDEX_WIDTH 
} from './constants';

class Row extends Context {
    constructor(grid, rowIndex, x, y, height, columns, data) {
        super(grid, x, y, null, height)

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
        }
        this.rowHeader = new RowHeader(grid, rowIndex, x, y, ROW_INDEX_WIDTH, height, style)

        // cells对象集合
        let everyOffsetX = grid.originFixedWidth;

        for(let i = 0; i < this.grid.columnsLength; i++) {
            const column = columns[i]
            const width = column.width
            const cell = new Cell(data[column.key], grid, i, rowIndex, everyOffsetX, y, width, this.height, column, style)
            
            this.allCells.push(cell)
            if (column.fixed) {
                this.fixedCells.push(cell);
            } else {
                this.cells.push(cell);
            }
            
            everyOffsetX += width;
        }
    }
    isInVerticalAutofill(mouseX, mouseY) {
        return this.grid.autofill.yIndex === this.rowIndex &&
            mouseY > this.y + this.grid.scrollY + this.height - 3 &&
            mouseY < this.y + this.height + this.grid.scrollY + 3
    }
    handleCheck() {
        this.checked = !this.checked
        this.rowHeader.handleCheck(this.checked)
    }
    mouseDown(x, y) {
        for(let i = 0; i < this.cells.length; i++) {
            if(this.cells[i].isInsideHorizontalBodyBoundary(x, y)) {
                this.grid.selectCell(this.cells[i]);
            }
        }
    }
    mouseMove(x, y) {
        for(let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i]
            if(cell.isInsideHorizontalBodyBoundary(x, y)) {
                const {
                    colIndex,
                    rowIndex,
                    x,
                    y,
                    width,
                    valid,
                    message
                } = cell
                this.grid.multiSelectCell(colIndex, rowIndex);
                this.grid.tooltip.update({
                    valid, 
                    message, 
                    x: x + width, 
                    y,
                })
            }
        }
    }
    handleAutofill(x, y) {
        for(let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].isInHorizontalAutofill(x, y)) {
                this.grid.target.style.cursor = 'crosshair';
            }
        }
    }
    handleStartAutofill(x, y) {
        for(let i = 0; i < this.cells.length; i++) {
            if (this.cells[i].isInHorizontalAutofill(x, y)) {
                this.grid.startAutofill()
            }
        }
    }
    click(x, y) {
        if(this.rowHeader.isInsideCheckboxBoundary(x, y)) {
            this.grid.handleCheckRow(this.rowIndex)
        }
    }
    dbClick(x, y) {
        for(let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i]
            if(cell.isInsideHorizontalBodyBoundary(x, y)) {
                this.grid.startEdit()
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
        const scrollRightBoundry = this.grid.width - this.grid.tableWidth - this.grid.verticalScrollerSize === this.grid.scrollX
        const cell = this.allCells[colIndex]
        const oldWidth = cell.width;
        cell.width = width;
        if (scrollRightBoundry && width < oldWidth) {
            this.allCells[colIndex + 1].width += (oldWidth - width)
            this.allCells[colIndex + 1].x += (width - oldWidth)
        } else {
            for(let i = colIndex + 1; i < this.grid.columnsLength; i++) {
                this.allCells[i].x += (width - oldWidth);
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
        if (this.grid.scrollX !== 0) {
            this.grid.painter.drawRect(this.x, this.y + this.grid.scrollY, this.grid.fixedLeftWidth, this.height, {
                fillColor: '#f9f9f9',
                shadowBlur: 6,
                shadowColor: 'rgba(28,36,56,0.2)',
                shadowOffsetX: 2,
                shadowOffsetY: 6
            })
        }
        if (this.grid.tableWidth + this.grid.verticalScrollerSize - this.grid.width + this.grid.scrollX > 0) {
            this.grid.painter.drawRect(this.grid.width - this.grid.fixedRightWidth, this.y + this.grid.scrollY, this.grid.fixedRightWidth - this.grid.verticalScrollerSize, this.height, {
                fillColor: '#f9f9f9',
                shadowBlur: 6,
                shadowColor: 'rgba(28,36,56,0.2)',
                shadowOffsetX: -2,
                shadowOffsetY: 6
            })
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