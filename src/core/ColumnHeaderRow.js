import Context from './Context.js'
import ColumnHeader from './ColumnHeader.js'
import { CELL_WIDTH, HEADER_HEIGHT, ROW_INDEX_WIDTH, CHECK_BOX_WIDTH } from './constants.js'

const oncheck = new Image()
const offcheck = new Image()
oncheck.src = require('./images/oncheck.png')
offcheck.src = require('./images/offcheck.png')

class ColumnHeaderRow extends Context {
    constructor(grid, x, y, columns) {
        super(grid, x, y, grid.actualTableWidth, HEADER_HEIGHT)

        this.fixedColumnHeaders = []
        this.columnHeaders = [];

        const len = columns.length
        let everyOffsetX = ROW_INDEX_WIDTH + CHECK_BOX_WIDTH;

        for(let i = 0; i < len; i++) {
            const column = columns[i]
            const style = {
                color: this.grid.color,
                fillColor: this.grid.fillColor,
                borderColor: this.grid.borderColor,
                borderWidth: this.grid.borderWidth
            }
            if (i < grid.fixedLeft) {
                column.fixed = 'left'
            } else if (i > len - 1 - grid.fixedRight) {
                column.fixed = 'right'
            }
            if (column.fixed) {
                this.fixedColumnHeaders.push(new ColumnHeader(grid, i, everyOffsetX, y, column, style));
            } else {
                this.columnHeaders.push(new ColumnHeader(grid, i, everyOffsetX, y, column,style));
            }

            everyOffsetX += column.width || CELL_WIDTH;
        }
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
        // 滚动表头
        for(let i = 0; i < this.columnHeaders.length; i++) {
            const columnHeader = this.columnHeaders[i];
            if(columnHeader.isVisibleOnScreen()) {
                columnHeader.draw();
            }
        }
        // 冻结表头
        for(let i = 0; i < this.fixedColumnHeaders.length; i++) {
            const columnHeader = this.fixedColumnHeaders[i];
            columnHeader.draw();
        }

        // 绘制checkbox
        const style = {
            borderColor: this.grid.borderColor,
            borderWidth: this.grid.borderWidth,
            fillColor: this.grid.fillColor
        }
        this.grid.painter.drawRect(ROW_INDEX_WIDTH, 0, CHECK_BOX_WIDTH, HEADER_HEIGHT, style)
        this.grid.painter.drawImage(offcheck, ROW_INDEX_WIDTH + (CHECK_BOX_WIDTH - 20) / 2, (HEADER_HEIGHT - 20) / 2, 20, 20)
        
        // 最左上角方格
        this.grid.painter.drawRect(0, 0, ROW_INDEX_WIDTH, HEADER_HEIGHT, style)
    }
}
export default ColumnHeaderRow