import { SELECT_BORDER_COLOR, SELECT_AREA_COLOR, SELECT_BG_COLOR, READONLY_COLOR } from './constants.js'
import Context from './Context.js'

function filterValue () {
    let label = this.value
    if (this.dateType === 'select' && Array.isArray(this.options)) {
        for (let item of this.options) {
            if (this.value === item.value) {
                label = item.label
                break
            }
        }
    }
    return label
}

class Cell extends Context{
    constructor(value, grid, colIndex, rowIndex, x, y, width, height, column, options) {
        const realX = column.fixed === 'right' ? 
            grid.width - (grid.actualTableWidth - x - width) - width : x;
        super(grid, realX, y, width, height)

        this.fixed = column.fixed;
        this.readonly = column.readonly;
        this.textAlign = column.align
        this.textBaseline = column.baseline
        this.colIndex = colIndex - grid.fixedLeft;
        this.rowIndex = rowIndex;
        this.dateType = column.type || 'text'
        this.options = column.options
        this.value = value
        this.label = filterValue.call(this);

        Object.assign(this, options, {
            fillColor: '#fff'
        });
    }
    mouseDown() {
        this.grid.selectCell(this.colIndex, this.rowIndex);
    }
    setData(val) {
        this.value = val
        this.label = filterValue.call(this);
    }
    mouseMove() {
        this.grid.multiSelectCell(this.colIndex, this.rowIndex);
    }
    mouseUp() {
        this.grid.endMultiSelect();
    }
    dbClick() {
        if (this.readonly) return;
        this.grid.startEdit(this)
    }
    draw() {
        const x = this.fixed ? this.x : this.x + this.grid.scrollX
        const y = this.y + this.grid.scrollY
        const startOffset = this.grid.painter.calucateTextAlign(this.label, this.width)
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
        let height = y + this.height / 2
        // // 如果文本超出列宽，则不再已列高／2垂直剧中
        // if (textArr && textArr.length > 1) {
        //     height = y + 10
        // }
        // for (let i = 0; i < textArr.length; i++) {
        //     this.grid.painter.drawText(textArr[i], x + this.width / 2, height + i * 18, {
        //         color: this.color
        //     });
        // }


        this.grid.painter.drawText(this.label, x + startOffset, height, {
            color: this.color,
            align: this.textAlign,
            baseLine: this.textBaseline
        });
        
    }
}

export default Cell