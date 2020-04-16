import { CELL_WIDTH, CELL_HEIGHT, SELECT_BORDER_COLOR } from './constants.js'
import Context from './Context.js'

class ColumnHeader extends Context {
    constructor(grid, index, x, y, column, options) {
        const width = column.width || CELL_WIDTH
        super(grid, x, y, width, CELL_HEIGHT)

        this.fixed = column.fixed
        this.index = index - grid.fixedLeft;
        this.text = column.title

        Object.assign(this, options);
    }
    // 表头是否超过了右侧可视区的边界
    isVisibleOnScreen() {
        return !(this.x + this.width - this.grid.fixedLeftWidth + this.grid.scrollX < 0 || 
            this.x + this.grid.scrollX > this.grid.width - this.grid.fixedRightWidth);
    }
    draw() {
        // 绘制表头每个单元格框
        const x = this.fixed === 'right' ? 
            this.grid.width - (this.grid.tableWidth - this.x - this.width) - this.width - this.grid.scrollerTrackSize :
                (this.fixed === 'left' ? this.x : this.x + this.grid.scrollX);
        const editor = this.grid.editor
        const selector = this.grid.selector
        this.grid.painter.drawRect(x, this.y, this.width, this.height, {
            fillColor: this.fillColor,
            borderColor: this.borderColor,
            borderWidth: this.borderWidth
        });

        /**
         * 焦点高亮
         */
        if (selector.show || editor.show) {
            const minX = selector.selectedXArr[0]
            const maxX = selector.selectedXArr[1]

            if (this.index >= minX && this.index <= maxX) {
                const points = [
                    [x + 1, this.y + this.height - 1],
                    [x + 1 + this.width, this.y + this.height - 1]
                ]
                this.grid.painter.drawLine(points, {
                    borderColor: SELECT_BORDER_COLOR,
                    borderWidth: 2
                })
            }
        }

        // 绘制表头每个单元格文本
        this.grid.painter.drawText(this.text, x + this.width / 2, this.y + this.height / 2, {
            color: this.color
        });
    }
}

export default ColumnHeader