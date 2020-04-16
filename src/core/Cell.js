import { 
    SELECT_BORDER_COLOR, 
    SELECT_AREA_COLOR, 
    SELECT_BG_COLOR, 
    READONLY_COLOR, 
    ERROR_TIP_COLOR
} from './constants.js'
import Context from './Context.js'
import Validator from './Validator.js'

class Cell extends Context{
    constructor(value, grid, colIndex, rowIndex, x, y, width, height, column, options) {
        super(grid, x, y, width, height)

        this.fixed = column.fixed;
        this.readonly = column.readonly;
        this.textAlign = column.align
        this.textBaseline = column.baseline
        this.colIndex = colIndex - grid.fixedLeft;
        this.rowIndex = rowIndex;
        this.dateType = column.type || 'text'
        this.options = column.options
        this.value = value
        this.originalValue = value

        this.validator = new Validator(column)
        this.label = this.validator.filterValue(value);
        this.valid = true;
        this.message = null;

        Object.assign(this, options, {
            fillColor: '#fff'
        });
        this.validate()
    }
    validate() {
        const { 
            flag,
            message
        } = this.validator.validate(this.value)
        this.valid = flag
        this.message = message
    }
    mouseDown() {
        this.grid.selectCell(this);
    }
    setData(val) {
        this.value = val
        this.label = this.validator.filterValue(val);
        if (this.value !== this.originalValue) {
            this.grid.hashChange[`${this.colIndex}-${this.rowIndex}`] = true
        } else {
            delete this.grid.hashChange[`${this.colIndex}-${this.rowIndex}`]
        }
    }
    mouseMove() {
        this.grid.multiSelectCell(this.colIndex, this.rowIndex);
        this.grid.updateTooltip(this)
    }
    mouseUp() {
        this.grid.endMultiSelect();
    }
    dbClick() {
        this.grid.startEdit()
    }
    draw() {
        const x = this.fixed === 'right' ? 
            this.grid.width - (this.grid.tableWidth - this.x - this.width) - this.width - this.grid.scrollerTrackSize :
                (this.fixed === 'left' ? this.x : this.x + this.grid.scrollX);
        const y = this.y + this.grid.scrollY
        const editor = this.grid.editor
        const selector = this.grid.selector
        const autofill = this.grid.autofill
        
        this.grid.painter.drawRect(x, y, this.width, this.height, {
            fillColor: this.readonly ? READONLY_COLOR : this.fillColor,
            borderColor: this.borderColor,
            borderWidth: 1
        });

        /**
         * 选中当前焦点行、列
         */
        if (selector.show || editor.show) {
            if (this.rowIndex === editor.editorYIndex) {
                this.grid.painter.drawRect(x, y, this.width, this.height, {
                    fillColor: SELECT_BG_COLOR
                });
            }
            if (this.colIndex === editor.editorXIndex) {
                this.grid.painter.drawRect(x, y, this.width, this.height, {
                    fillColor: SELECT_BG_COLOR
                });
            }
        }

        /**
         * 绘制错误提示
         */
        if (!this.valid) {
            const points = [
                [x + this.width - 8, y],
                [x + this.width, y],
                [x + this.width, y + 8]
            ]
            this.grid.painter.drawLine(points, {
                fillColor: ERROR_TIP_COLOR
            })
        }
        
        /**
         * 绘制选区
         */
        if (selector.show) {
            const minX = selector.selectedXArr[0]
            const maxX = selector.selectedXArr[1]
            const minY = selector.selectedYArr[0]
            const maxY = selector.selectedYArr[1]

            // background color
            if (this.colIndex >= minX && this.colIndex <= maxX && this.rowIndex >= minY && this.rowIndex <= maxY) {
                this.grid.painter.drawRect(x, y, this.width, this.height, {
                    fillColor: SELECT_AREA_COLOR
                });
            }
            // // top／bottom border
            if (this.colIndex >= minX && this.colIndex <= maxX && this.rowIndex + 1 === minY
                || (this.colIndex >= minX && this.colIndex <= maxX && this.rowIndex === maxY)) {
                const points = [
                    [x, y + this.height - 1],
                    [x + this.width, y + this.height - 1]
                ]
                this.grid.painter.drawLine(points, {
                    borderColor: SELECT_BORDER_COLOR,
                    borderWidth: 1
                })
            }
            if (this.colIndex >= minX && this.colIndex <= maxX && this.rowIndex === minY
                || (this.colIndex >= minX && this.colIndex <= maxX && this.rowIndex -1 === maxY)) {
                const points = [
                    [x, y],
                    [x + this.width, y]
                ]
                this.grid.painter.drawLine(points, {
                    borderColor: SELECT_BORDER_COLOR,
                    borderWidth: 1
                })
            } 
            // left／right border
            if (this.colIndex === minX && this.rowIndex >= minY && this.rowIndex <= maxY) {
                const points = [
                    [x, y],
                    [x, y + this.height]
                ]
                this.grid.painter.drawLine(points, {
                    borderColor: SELECT_BORDER_COLOR,
                    borderWidth: 2
                })
            }
            if (this.colIndex - 1 === maxX && this.rowIndex >= minY && this.rowIndex <= maxY) {
                const points = [
                    [x, y],
                    [x, y + this.height]
                ]
                this.grid.painter.drawLine(points, {
                    borderColor: SELECT_BORDER_COLOR,
                    borderWidth: 2
                })
            }
            // autofill
            if (!editor.show) {
                if (this.colIndex - 1 === autofill.autofillXIndex && this.rowIndex - 1 === autofill.autofillYIndex) {
                    // -2让触点覆盖于边框之上
                    this.grid.painter.drawRect(x - 2, y - 2, 6, 6, {
                        borderColor: '#fff',
                        borderWidth: 2,
                        fillColor: SELECT_BORDER_COLOR
                    })
                }
            }
        }

        // const textArr = this.grid.painter.getTextWrapping(this.value, this.width)
        let _y = y + this.height / 2
        // // 如果文本超出列宽，则不再已列高／2垂直剧中
        // if (textArr && textArr.length > 1) {
        //     _y = y + 10
        // }
        // for (let i = 0; i < textArr.length; i++) {
        //     this.grid.painter.drawText(textArr[i], x + this.width / 2, _y + i * 18, {
        //         color: this.color
        //     });
        // }


        this.grid.painter.drawCellText(this.label, x, _y, this.width, 10, {
            color: this.color,
            align: this.textAlign,
            baseLine: this.textBaseline
        });
        
    }
}

export default Cell