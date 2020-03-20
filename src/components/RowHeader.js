import { ROW_HEADER_WIDTH, CHECK_BOX_WIDTH } from './constants.js'

const oncheck = new Image()
const offcheck = new Image()
oncheck.src = require('./images/oncheck.png')
offcheck.src = require('./images/offcheck.png')

class RowHeader {
    constructor(grid, rowIndex, x, y, width, height, options) {
        this.grid = grid;
        this.rowIndex = rowIndex;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = rowIndex + 1
        this.checked = false
        
        Object.assign(this, options);
    }
    isInsideBoundary(mouseX, mouseY) {
        return mouseX > this.x + this.width + this.grid.scrollX &&
            mouseX < this.x + this.width + CHECK_BOX_WIDTH + this.grid.scrollX &&
            mouseY > this.y + this.grid.scrollY &&
            mouseY < this.y + this.grid.scrollY + this.height;
    }
    click() {
        this.grid.handleCheckRow(this.rowIndex)
    }
    handleCheck() {
        this.checked = !this.checked
    }
    draw() {
        // 绘制checkbox
        const checkEl = this.checked ? oncheck : offcheck
        this.grid.painter.drawRect(ROW_HEADER_WIDTH, this.grid.scrollY + this.y, CHECK_BOX_WIDTH, this.height, {
            borderColor: this.borderColor,
            fillColor: this.bgColor,
            borderWidth: this.borderWidth
        })
        this.grid.painter.drawImage(checkEl, ROW_HEADER_WIDTH + (CHECK_BOX_WIDTH - 20) / 2, this.grid.scrollY + this.y + (this.height - 20) / 2, 20, 20)

        // 绘制每行的索引的边框
        this.grid.painter.drawRect(this.x, this.grid.scrollY + this.y, this.width, this.height, {
            fillColor: this.bgColor,
            borderColor: this.borderColor,
            borderWidth: this.borderWidth
        });
        // 绘制每行的索引
        this.grid.painter.drawText(this.text, this.x + this.width / 2, this.y + this.grid.scrollY + this.height / 2, {
            color: this.color
        });
    }
}

export default RowHeader