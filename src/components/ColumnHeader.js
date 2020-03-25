import { CELL_WIDTH, CELL_HEIGHT } from './constants.js'
import Context from './Context.js'

class ColumnHeader extends Context {
    constructor(grid, index, x, y, column, options) {
        const width = column.width || CELL_WIDTH
        const realX = column.fixed === 'right' ? 
            grid.width - (grid.actualTableWidth - x - width) - width : x;
        super(grid, realX, y, width, CELL_HEIGHT)

        this.index = index - grid.fixedLeft;;
        this.fixed = column.fixed
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
        const style = {
            fillColor: this.fillColor,
            borderColor: this.borderColor,
            borderWidth: this.borderWidth
        }
        // if (this.fixed) {
        //     style.shadowBlur = 10;
        //     style.shadowColor = 'rgba(0,0,0,0.2)';
        //     style.shadowOffsetX = 3;
        // }
        this.grid.painter.drawRect(x, this.y, this.width, this.height, style);
        // 绘制表头每个单元格文本
        this.grid.painter.drawText(this.text, x + this.width / 2, this.y + this.height / 2, {
            color: this.color
        });
    }
}

export default ColumnHeader