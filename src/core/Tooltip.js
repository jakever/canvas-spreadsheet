import { ERROR_TIP_COLOR } from './constants.js'

class Tooltip {
    constructor(grid, x, y, message, type) {
        this.grid = grid
        this.x = x
        this.y = y
        this.width = 200
        this.height = 90
        this.valid = true
        this.message = message
    }
    update(value) {
        Object.assign(this, value)
    }
    draw() {
        if (!this.valid && !this.grid.selector.isSelected) {
            const x = this.x + this.grid.scrollX
            const y = this.y + this.grid.scrollY
            this.grid.painter.drawRect(x + 1, y, this.width, this.height, {
                shadowBlur: 6,
                shadowColor: 'rgba(0,0,0,0.2)',
                shadowOffsetX: 1,
                shadowOffsetY: 1,
                fillColor: '#fff',
                borderWidth: 1
            });
            this.grid.painter.drawLine([
                [x + 1, y],
                [x + this.width, y]
            ], {
                borderColor: ERROR_TIP_COLOR,
                borderWidth: 2
            })

            const textArr = this.grid.painter.getTextWrapping(this.message, this.width, 20)
            let _y = y + 35
            for (let i = 0; i < textArr.length; i++) {
                this.grid.painter.drawCellText(textArr[i], x, _y + i * 18, this.width, 20, {
                    color: this.grid.color,
                    align: 'left'
                });
            }

            this.grid.painter.drawCellText('错误提示', x, y + 15, this.width, 20, {
                font: 'bold normal 12px PingFang SC',
                color: ERROR_TIP_COLOR,
                align: 'left'
            });
        }
    }
}

export default Tooltip