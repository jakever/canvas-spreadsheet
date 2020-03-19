import ColumnHeader from './ColumnHeader.js'
import { CELL_WIDTH, HEADER_HEIGHT, ROW_HEADER_WIDTH, CHECK_BOX_WIDTH } from './constants.js'

const oncheck = new Image()
const offcheck = new Image()
oncheck.src = require('./images/oncheck.png')
offcheck.src = require('./images/offcheck.png')

class ColumnHeaderRow {
    constructor(grid, x, y, columns) {
        this.grid = grid;
        this.x = x;
        this.y = y;
        this.height = HEADER_HEIGHT;

        this.fixedLeftColumnHeaders = [];
        this.fixedRightColumnHeaders = [];
        this.columnHeaders = [];

        const len = columns.length
        let everyOffsetX = ROW_HEADER_WIDTH + CHECK_BOX_WIDTH;

        for(let i = 0; i < len; i++) {
            const column = columns[i]
            const style = {
                color: '#495060',
                bgColor: '#f8f8f9',
                borderColor: '#d4d4d4',
                borderWidth: 1
            }
            if (i < grid.fixedLeft) {
                column.fixed = 'left'
            } else if (i > len - 1 - grid.fixedRight) {
                column.fixed = 'right'
            }
            if (column.fixed === 'left') {
                this.fixedLeftColumnHeaders.push(new ColumnHeader(grid, i, everyOffsetX, y, column, style));
            } else if (column.fixed === 'right') {
                this.fixedRightColumnHeaders.push(new ColumnHeader(grid, i, everyOffsetX, y, column, style));
            } else {
                this.columnHeaders.push(new ColumnHeader(grid, i, everyOffsetX, y, column,style));
            }

            everyOffsetX += column.width || CELL_WIDTH;
        }
    }
    isInsideBoundary(mouseX, mouseY) {
        return mouseX > this.x + this.grid.scrollX &&
            mouseX < this.x + this.grid.scrollX + this.grid.actualTableWidth &&
            mouseY > this.y + this.grid.scrollY &&
            mouseY < this.y + this.grid.scrollY + this.height;
    }
    mouseDown(x, y) {
        if (this.resizeTarget) {
            this.resizeOriginalX = x;
            this.resizeOriginalWdith = this.resizeTarget.width;
            this.isResizing = true;
        }
    }
    mouseMove(x, y) {
        if (this.isResizing) {
            const resizeDiffWidth = x - this.resizeOriginalX
            this.grid.resizeColumn(this.resizeTarget.index, this.resizeOriginalWdith + resizeDiffWidth) 
        } else { // 鼠标移动中 -> 寻找需要调整列宽的列目标
            for(let i = 0; i < this.columnHeaders.length; i++) {
                let columnHeader = this.columnHeaders[i];
        
                if(x > columnHeader.x + this.grid.scrollX + columnHeader.width - 4 && x < columnHeader.x + this.grid.scrollX + columnHeader.width + 4) {
                    document.body.style.cursor = 'col-resize';
                    this.resizeTarget = columnHeader;
                }
            }
        }
    }
    mouseUp() {
        this.resizeTarget = null;
        this.isResizing = false;
    }
    resizeColumn(colIndex, width) {
        let columnHeader = this.columnHeaders[colIndex];
        let oldWidth = columnHeader.width;

        columnHeader.width = width;

        // 该列之后的所有列的x轴位移需要更新
        for(let i = colIndex + 1; i < this.columnHeaders.length; i++) {
            this.columnHeaders[i].x += (width - oldWidth);
        }
    }
    draw() {
        // 绘制表头
        for(let i = 0; i < this.columnHeaders.length; i++) {
            const columnHeader = this.columnHeaders[i];
            if(columnHeader.isVisibleOnScreen()) {
                columnHeader.draw();
            }
        }
        for(let i = 0; i < this.fixedLeftColumnHeaders.length; i++) {
            const columnHeader = this.fixedLeftColumnHeaders[i];
            columnHeader.draw();
        }
        for(let i = 0; i < this.fixedRightColumnHeaders.length; i++) {
            const columnHeader = this.fixedRightColumnHeaders[i];
            columnHeader.draw();
        }

        // 绘制checkbox
        this.grid.painter.drawRect(ROW_HEADER_WIDTH, 0, CHECK_BOX_WIDTH, HEADER_HEIGHT, {
            borderColor: '#d4d4d4',
            borderWidth: 1,
            fillColor: '#f8f8f9'
        })
        this.grid.painter.drawImage(offcheck, ROW_HEADER_WIDTH + (CHECK_BOX_WIDTH - 20) / 2, (HEADER_HEIGHT - 20) / 2, 20, 20)
        
        this.grid.painter.drawRect(0, 0, ROW_HEADER_WIDTH, HEADER_HEIGHT, {
            borderColor: '#d4d4d4',
            borderWidth: 1,
            fillColor: '#f8f8f9'
        })
    }
}
export default ColumnHeaderRow