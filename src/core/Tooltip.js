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
            const x = this.fixed === 'right' ? 
                this.x  - this.width :
                (this.fixed === 'left' ? this.x : this.x + this.grid.scrollX)
            const y = this.y + this.grid.scrollY
            this.grid.painter.drawRoundRect(x, y, this.width, this.height, 4, {
                shadowBlur: 16,
                shadowColor: 'rgba(28,36,56,0.16)',
                shadowOffsetX: 6,
                shadowOffsetY: 6,
                fillColor: '#fff',
                borderWidth: 1
            });
            // this.grid.painter.drawLine([
            //     [x + 1, y],
            //     [x + this.width, y]
            // ], {
            //     borderColor: ERROR_TIP_COLOR,
            //     borderWidth: 2
            // })

            this.grid.painter.drawCellText('数据错误', x, y + 24, this.width, 20, {
                font: 'bold 14px "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
                color: ERROR_TIP_COLOR,
                align: 'left'
            });

            const textArr = this.grid.painter.getTextWrapping(this.message, this.width, 16)
            let _y = y + 50
            for (let i = 0; i < textArr.length; i++) {
                this.grid.painter.drawCellText(textArr[i], x, _y + i * 18, this.width, 16, {
                    color: this.grid.color,
                    align: 'left'
                });
            }   
        }
    }
}

export default Tooltip