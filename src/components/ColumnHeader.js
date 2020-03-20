import { CELL_WIDTH, CELL_HEIGHT } from './constants.js'

class ColumnHeader {
    constructor(grid, index, x, y, column, options) {
        this.grid = grid
        this.index = index - grid.fixedLeft;;
        this.fixed = column.fixed
        this.width = column.width || CELL_WIDTH;
        this.height = CELL_HEIGHT;
        this.x = this.fixed === 'right' ? 
            grid.width - (grid.actualTableWidth - x - this.width) - this.width
            : x;
        this.y = y;
        this.text = column.title

        Object.assign(this, options);
    }
    // 表头是否超过了右侧可视区的边界
    isVisibleOnScreen() {
        return !(this.x + this.grid.scrollX + this.width < 0 || this.x + this.grid.scrollX > this.grid.width ||
            this.y + this.height < 0 || this.y  > this.grid.height);
    }
    draw() {
        // 绘制表头每个单元格框
        const x = this.fixed ? this.x : this.x + this.grid.scrollX
        this.grid.painter.drawRect(x, this.y, this.width, this.height, {
            fillColor: this.bgColor,
            borderColor: this.borderColor,
            borderWidth: this.borderWidth
        });
        // 绘制表头每个单元格文本
        this.grid.painter.drawText(this.text, x + this.width / 2, this.y + this.height / 2, {
            color: this.color
        });
    }
}

export default ColumnHeader