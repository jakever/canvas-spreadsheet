import { CELL_HEIGHT, HEADER_HEIGHT } from './constants.js'
import Row from './Row.js'

class Body {
    constructor(grid, columns, data) {
        this.grid = grid
        this.columns = columns
        this.data = data

        this.rows = [];
        const len = this.data.length
        let everyOffsetY = HEADER_HEIGHT;
        for(let i = 0; i < len; i++) {
            const rowData = this.data[i]
            
            let rowHeight = CELL_HEIGHT
            // 暂时注释text wrapping功能
            // let textWrap = null
            // for(let j = 0; j < this.columns.length; j++) {
            //     const column = this.columns[j]
            //     const value = rowData[column.key]
            //     if (value || value === 0) {
            //         textWrap = this.painter.getTextWrapping(value, column.width)
            //         let textWrapCount = 0
            //         if (textWrap) {
            //             textWrapCount = textWrap.length
            //         }
            //         if (textWrapCount > 1) {
            //             if (rowHeight < CELL_HEIGHT + ((textWrapCount - 1) * 18)) {
            //                 rowHeight = CELL_HEIGHT + ((textWrapCount - 1) * 18)
            //             }
            //         }
            //     }
            // }

            this.rows.push(new Row(grid, i, 0, everyOffsetY, rowHeight, this.columns, rowData));
            everyOffsetY += rowHeight;
        }

        this.height = this.rows.reduce((sum, item) => {
            return sum + item.height
        }, CELL_HEIGHT)
    }
    getRow(y) {
        return this.rows[y]
    }
    // 根据坐标获取cell对象
    getCell(x, y) {
        const row = this.rows[y]
        return row.cells[x]
    }
    resizeColumn(colIndex, width) {
        for(let i = 0; i < this.rows.length; i++) {
            this.rows[i].resizeColumn(colIndex, width);
        }
    }
    resizeRow(rowIndex, height) {
        if (height < MIN_CELL_HEIGHT) return;


        for(let i = 0; i < this.rows.length; i++) {
            this.rows[i].resizeRow(rowIndex, height);
        }
    }
    handleCheckRow(y) {
        this.rows[y].handleCheck()
    }
    mouseDown(x, y) {
        for(let i = 0; i < this.rows.length; i++) {
            if(this.rows[i].isInsideVerticaBodyBoundary(x, y)) {
                this.rows[i].mouseDown(x, y);
            }
        }
    }
    mouseMove(x, y) {
        for(let i = 0; i < this.rows.length; i++) {
            if(this.rows[i].isInsideVerticaBodyBoundary(x, y)) {
                this.rows[i].mouseMove(x, y);
            }
        }
    }
    mouseUp(x, y) {
        for(let i = 0; i < this.rows.length; i++) {
            if(this.rows[i].isInsideVerticaBodyBoundary(x, y)) {
                this.rows[i].mouseUp(x, y);
            }
        }
    }
    click(x, y) {
        for(let i = 0; i < this.rows.length; i++) {
            if(this.rows[i].isInsideCheckboxBoundary(x, y)) {
                this.rows[i].click(x, y);
            }
        }
    }
    dbClick(x, y) {
        for(let i = 0; i < this.rows.length; i++) {
            if(this.rows[i].isInsideVerticaBodyBoundary(x, y)) {
                this.rows[i].dbClick(x, y);
            }
        }
    }
    rePaintRow(rowIndex) {
        // 计算该行中所有单元格内容所需要的最大高度
        // const rowData = this.data[rowIndex]
        const row = this.getRow(rowIndex);
        const len = row.cells.length
        let textWrap = null
        let rowHeight = CELL_HEIGHT
        for (let i = 0; i < len; i++) {
            const { value, width } = row.cells[i]
            if (value || value === 0) {
                textWrap = this.grid.painter.getTextWrapping(value, width)
                let textWrapCount = 0
                if (textWrap) {
                    textWrapCount = textWrap.length
                }
                if (textWrapCount > 1) {
                    if (CELL_HEIGHT + ((textWrapCount - 1) * 18) > rowHeight) {
                        rowHeight = CELL_HEIGHT + ((textWrapCount - 1) * 18)
                    }
                }
            }
        }
        
        row.height = rowHeight
        
        let everyOffsetY = HEADER_HEIGHT;
        for(let j = 0; j < this.rows.length; j++) {
            const row = this.rows[j]
            row.y = everyOffsetY
            everyOffsetY += row.height
            row.rePaint();
        }
    }
    draw() {
        const len = this.data.length
        for(let i = 0; i < len; i++) {
            const row = this.rows[i];
            
            if(row.isVerticalVisibleOnBody()) {
                row.draw();
            }
        }
    }
}

export default Body