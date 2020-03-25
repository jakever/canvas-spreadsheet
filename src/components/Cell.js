import Context from './Context.js'

class Cell extends Context{
    constructor(value, grid, colIndex, rowIndex, x, y, width, height, column, options) {
        const realX = column.fixed === 'right' ? 
            grid.width - (grid.actualTableWidth - x - width) - width : x;
        super(grid, realX, y, width, height)

        this.fixed = column.fixed;
        this.textAlign = column.textAlign
        this.textBaseline = column.textBaseline
        this.colIndex = colIndex - grid.fixedLeft;
        this.rowIndex = rowIndex;
        this.isSelected = false
        this.value = value;

        Object.assign(this, options, {
            fillColor: '#fff'
        });
    }
    mouseDown() {
        this.grid.selectCell(this.colIndex, this.rowIndex);
        this.grid.updateSelection(this.colIndex, this.rowIndex);
    }
    setData(val) {
        this.value = val
    }
    mouseMove() {
        this.grid.updateSelection(this.colIndex, this.rowIndex);
    }
    mouseUp() {
        this.grid.endMultiSelect();
    }
    dbClick() {
        this.grid.startEdit(this)
    }
    deselect() {
        this.isSelected = false;
    }
    draw() {
        const x = this.fixed ? this.x : this.x + this.grid.scrollX
        const startOffset = this.grid.painter.calucateTextAlign(this.value, this.width)
        this.grid.painter.drawRect(x, this.grid.scrollY + this.y, this.width, this.height, {
            fillColor: this.isSelected ? this.grid.selectAreaColor : this.fillColor,
            borderColor: this.borderColor,
            borderWidth: 1
        });
        // const textArr = this.grid.painter.getTextWrapping(this.value, this.width)
        let height = this.grid.scrollY + this.y + this.height / 2
        // // 如果文本超出列宽，则不再已列高／2垂直剧中
        // if (textArr && textArr.length > 1) {
        //     height = this.grid.scrollY + this.y + 10
        // }
        // for (let i = 0; i < textArr.length; i++) {
        //     this.grid.painter.drawText(textArr[i], x + this.width / 2, height + i * 18, {
        //         color: this.color
        //     });
        // }
        this.grid.painter.drawText(this.value, x + startOffset, height, {
            color: this.color,
            align: this.textAlign,
            baseLine: this.textBaseline
        });
        
    }
}

export default Cell