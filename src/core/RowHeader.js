import { 
    CHECK_BOX_WIDTH, 
    SELECT_BORDER_COLOR,
    SELECT_BG_COLOR
 } from './constants.js'
import Context from './Context.js'

const oncheck = new Image()
const offcheck = new Image()
oncheck.src = require('./images/oncheck.png')
offcheck.src = require('./images/offcheck.png')

class RowHeader extends Context {
    constructor(grid, rowIndex, x, y, width, height, options) {
        super(grid, x, y, width, height)

        this.rowIndex = rowIndex;
        this.text = rowIndex + 1
        this.checked = false
        
        Object.assign(this, options);
    }
    handleCheck(val) {
        this.checked = val
    }
    draw() {
        const y = this.y + this.grid.scrollY
        const editor = this.grid.editor
        const selector = this.grid.selector

        // 绘制checkbox
        if (this.grid.showCheckbox) {
            const checkEl = this.checked ? oncheck : offcheck
            this.grid.painter.drawRect(this.width, y, CHECK_BOX_WIDTH, this.height, {
                borderColor: this.borderColor,
                fillColor: this.fillColor,
                borderWidth: this.borderWidth
            })
            this.grid.painter.drawImage(checkEl, this.width + (CHECK_BOX_WIDTH - 20) / 2, y + (this.height - 20) / 2, 20, 20)
        }

        // 绘制每行的索引的边框
        this.grid.painter.drawRect(this.x, y, this.width, this.height, {
            fillColor: this.fillColor,
            // borderColor: this.borderColor,
            borderWidth: this.borderWidth
        });
        // 绘制每行的索引
        this.grid.painter.drawText(this.text, this.x + this.width / 2, y + this.height / 2, {
            color: this.color
        });

        /**
         * 焦点高亮
         */
        if (selector.show || editor.show) {
            const minY = selector.yArr[0]
            const maxY = selector.yArr[1]

            if (this.rowIndex >= minY && this.rowIndex <= maxY) {
                this.grid.painter.drawRect(this.x, y, this.width + this.grid.checkboxWidth, this.height, {
                    fillColor: SELECT_BG_COLOR
                });
            }

            if (this.rowIndex >= minY && this.rowIndex <= maxY) {
                const points = [
                    [this.width + this.grid.checkboxWidth, y ],
                    [this.width + this.grid.checkboxWidth, y + this.height]
                ]
                this.grid.painter.drawLine(points, {
                    borderColor: SELECT_BORDER_COLOR,
                    borderWidth: 2
                })
            }
        }
    }
}

export default RowHeader