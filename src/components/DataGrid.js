/**
 * 程序入口
 */
import { h } from './element.js'
import Paint from './Paint.js'
import Row from './Row.js'
import ColumnHeaderRow from './ColumnHeaderRow.js'
import Editor from './Editor.js'
import Selector from './Selector.js'
import { CSS_PREFIX, CELL_WIDTH, MIN_CELL_WIDTH, MIN_CELL_HEIGHT, CELL_HEIGHT, HEADER_HEIGHT, ROW_HEADER_WIDTH, CHECK_BOX_WIDTH } from './constants.js'
import './index.scss'

class DataGrid {
    constructor(target, options) {
        this.data = options.data
        this.columns = options.columns

        this.scrollY = 0;
        this.scrollX = 0;
        this.width = 1200; // 容器宽
        this.height = 800; // 容器高

        this.scrollerWidth = 20;
        this.fixedWidth = 0;
        this.fillCellWidth = 0; // 所有列宽总和若小于视宽，则需要补全

        // 选择区域
        this.selectorControl = {
            show: false, // 是否显示
            isSelected: false, // 单击鼠标按下代表即将要开始范围选择
            selectedXArea: [0,0], // 选中区域
            selectedYArea: [0,0]
        }
        // 编辑器
        this.editorControl = {
            show: false, // 是否编辑模式
            type: 'text', // 数据类型
            value: null, // 当前编辑器所在单元格的值
            oldValue: null,
            isFixed: false, // 当前选中单元格是否属于冻结列
            selectOptions: [], // 下拉数据源
            editorXIndex: 0, // 编辑器所在x,y轴坐标
            editorYIndex: 0
        }
        // 自动填充
        this.autofill = {
            enable: false, // 为true代表要开始下拉数据填充
            autofillXIndex: 0, // 数据填充触点的坐标
            autofillYIndex: 0,
            autofillXArr: [], // 数据填充的范围
            autofillYArr: []
        }
        this.range = {}; // 编辑器边界范围

        Object.assign(this, options)

        this.createDom(target)

        // 生成主画笔
        this.painter = new Paint(this.tableEl.el, {
            width: this.width,
            height: this.height,
            onMouseDown: this.handleMouseDown.bind(this),
            onMouseMove: this.handleMouseMove.bind(this),
            onMouseUp: this.handleMouseUp.bind(this),
            onClick: this.handleClick.bind(this),
            onDbClick: this.handleDbClick.bind(this),
            onScroll: this.handleScroll.bind(this),
        })

        this.actualTableWidth = this.columns.reduce((sum, item) => {
            return sum + item.width || CELL_WIDTH
        }, ROW_HEADER_WIDTH + CHECK_BOX_WIDTH)

        this.actualTableHeight = this.data.length * CELL_HEIGHT + HEADER_HEIGHT
        
        // Headers 表头对象
        this.columnHeaderRow = new ColumnHeaderRow(this, 0, 0, this.columns)

        // Rows 所有的行对象集合
        this.rows = [];
        const len = this.data.length
        let everyOffsetY = HEADER_HEIGHT;
        for(let i = 0; i < len; i++) {
            const rowData = this.data[i]
            
            let textWrap = null
            let rowHeight = CELL_HEIGHT
            for(let j = 0; j < this.columns.length; j++) {
                const column = this.columns[j]
                const value = rowData[column.key]
                if (value || value === 0) {
                    textWrap = this.painter.getTextWrapping(value, column.width)
                    let textWrapCount = 0
                    if (textWrap) {
                        textWrapCount = textWrap.length
                    }
                    if (textWrapCount > 1) {
                        if (rowHeight < CELL_HEIGHT + ((textWrapCount - 1) * 18)) {
                            rowHeight = CELL_HEIGHT + ((textWrapCount - 1) * 18)
                        }
                    }
                }
            }

            this.rows.push(new Row(this, i, 0, everyOffsetY, rowHeight, this.columns, rowData));
            everyOffsetY += rowHeight;
        }
        
        this.setActualSize() // 设置画布像素的实际宽高
        
        this.initPaint()
    }
    rePaintRow(rowIndex) {
        // 计算该行中所有单元格内容的最大宽度
        // const rowData = this.data[rowIndex]
        const row = this.rows[rowIndex];
        const len = row.cells.length
        let textWrap = null
        let rowHeight = CELL_HEIGHT
        for (let i = 0; i < len; i++) {
            const { value, width } = row.cells[i]
            if (value || value === 0) {
                textWrap = this.painter.getTextWrapping(value, width)
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
    createDom(target) {
        // 顶层容器
        this.rootEl = h('div', `${CSS_PREFIX}`);

        // 画布外层容器
        this.wrapEl = h('div', `${CSS_PREFIX}-main`);

        this.rootEl.children(
            this.wrapEl
        )
        
        // 画布
        this.tableEl = h('canvas', `${CSS_PREFIX}-table`);
        
        // 编辑器
        this.editor = new Editor(this)
        this.selector = new Selector()

        // 编辑器、选区容器
        this.overlayerEl = h('div', `${CSS_PREFIX}-overlayer`)
            .children(
                this.editor.el,
                this.selector.el
            )

        this.wrapEl.children(
            this.tableEl,
            this.overlayerEl
        )

        target.appendChild(this.rootEl.el)
    }
    initPaint() {
        this.draw()
        window.requestAnimationFrame(this.initPaint.bind(this));
    }
    setActualSize() {
        this.fixedLeftWdith = this.columnHeaderRow.fixedLeftColumnHeaders.reduce((sum, col) => {
            return sum + col.width
        }, 0)
        this.fixedRightWdith = this.columnHeaderRow.fixedRightColumnHeaders.reduce((sum, col) => {
            return sum + col.width
        }, 0)
        this.actualTableWidth = this.columnHeaderRow.columnHeaders.reduce((sum, item) => {
            return sum + item.width
        }, ROW_HEADER_WIDTH + CHECK_BOX_WIDTH)

        this.actualTableHeight = this.rows.reduce((sum, item) => {
            return sum + item.height
        }, CELL_HEIGHT)
    }
    // 取消选取所有单元格
    deselectAllCells() {
        for(let i = 0; i < this.rows.length; i++) {
            this.rows[i].deselectAllCells();
        }
    }
    // mousedown事件 -> 开始拖拽批量选取
    selectCell(x, y) {
        this.finishedEdit()
        this.clearMultiSelect();
        this.selectorControl.show = true;
        this.selectorControl.selectedXArr = [x, x]
        this.selectorControl.selectedYArr = [y, y]
        this.selectorControl.isSelected = true

        this.autofill.autofillXIndex = x
        this.autofill.autofillYIndex = y

        this.editorControl.show = false
        this.editorControl.editorXIndex = x
        this.editorControl.editorYIndex = y
    }
    // mouseup事件 -> 结束批量选取
    endMultiSelect() {
        this.selectorControl.isSelected = false;
    }
    // 清空批量选取
    clearMultiSelect() {
        this.selectorControl.show = false;
        this.selectorControl.selectedXArea = [0,0];
        this.selectorControl.selectedYArea = [0,0];
    }
    // mousemove事件 -> 更新选取范围
    updateSelection(x, y) {
        if(this.selectorControl.isSelected) {
            const minX = x > this.editorControl.editorXIndex ? this.editorControl.editorXIndex : x
            const maxX = x > this.editorControl.editorXIndex ? x : this.editorControl.editorXIndex
            const minY = y > this.editorControl.editorYIndex ? this.editorControl.editorYIndex : y
            const maxY = y > this.editorControl.editorYIndex ? y : this.editorControl.editorYIndex
            this.autofill.autofillXIndex = maxX
            this.autofill.autofillYIndex = maxY
            this.selectorControl.selectedXArea = [minX, maxX]
            this.selectorControl.selectedYArea = [minY, maxY]

            this.deselectAllCells();

            for(let i = this.selectorControl.selectedYArea[0]; i <= this.selectorControl.selectedYArea[1]; i++) {
                this.rows[i].updateSelection(this.selectorControl.selectedXArea[0], this.selectorControl.selectedXArea[1]);
            }
        }
    }
    // 开始编辑
    startEdit(cell) {
        this.selectorControl.show = false;
        this.editor.fire(cell);
    }
    // 结束编辑
    finishedEdit() {
        if (this.editor.show) {
            const cell = this.getSelectedCell(this.editorControl.editorXIndex, this.editorControl.editorYIndex)
            if (cell) {
                cell.value = this.editor.value
                this.rePaintRow(this.editorControl.editorYIndex, this.editor.value)
            }
            this.editor.clear();
            this.selectorControl.show = true; // 编辑完再选中该单元格
        }
    }
    // 根据坐标获取cell对象，后面封装在Rows类中
    getSelectedCell(x, y) {
        let cell = null
        for (let rowIdx = 0; rowIdx < this.rows.length; rowIdx++) {
            if (rowIdx === y) {
                const cells = this.rows[rowIdx].cells
                for (let colIdx = 0; colIdx < cells.length; colIdx++) {
                    if (colIdx === x) {
                        cell = cells[colIdx]
                        break
                    }
                }
            }
        }
        return cell
    }
    handleCheckRow(y) {
        this.rows[y].handleCheck()
    }
    resizeColumn(colIndex, width) {
        if (width < MIN_CELL_WIDTH) return;

        this.columnHeaderRow.resizeColumn(colIndex, width);

        for(let i = 0; i < this.rows.length; i++) {
            this.rows[i].resizeColumn(colIndex, width);
        }
        this.setActualSize()
    }
    resizeRow(rowIndex, height) {
        if (height < MIN_CELL_HEIGHT) return;


        for(let i = 0; i < this.rows.length; i++) {
            this.rows[i].resizeRow(rowIndex, height);
        }
        this.setActualSize()
    }
    handleMouseDown(x, y) {
        if(this.columnHeaderRow.isInsideBoundary(x, y)) {
            this.columnHeaderRow.mouseDown(x, y);
        }
        for(let i = 0; i < this.rows.length; i++) {
            if(this.rows[i].isInsideBoundary(x, y)) {
                this.rows[i].mouseDown(x, y);
            }
        }
    }
    handleMouseMove(x, y) {
        document.body.style.cursor = 'default';

        if(this.columnHeaderRow.isInsideBoundary(x, y)) {
            this.columnHeaderRow.mouseMove(x, y);
        }
        for(let i = 0; i < this.rows.length; i++) {
            if(this.rows[i].isInsideBoundary(x, y)) {
                this.rows[i].mouseMove(x, y);
            }
        }
    }
    handleMouseUp(x, y) {
        if(this.columnHeaderRow.isInsideBoundary(x, y)) {
            this.columnHeaderRow.mouseUp(x, y);
        }
        for(let i = 0; i < this.rows.length; i++) {
            if(this.rows[i].isInsideBoundary(x, y)) {
                this.rows[i].mouseUp(x, y);
            }
        }
    }
    handleClick(x, y) {
        for(let i = 0; i < this.rows.length; i++) {
            if(this.rows[i].isInsideBoundary(x, y)) {
                this.rows[i].click(x, y);
            }
        }
    }
    handleDbClick(x, y) {
        for(let i = 0; i < this.rows.length; i++) {
            if(this.rows[i].isInsideBoundary(x, y)) {
                this.rows[i].dbClick(x, y);
            }
        }
    }
    handleScroll(e) {
        const { deltaX, deltaY } = e
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            let maxWidth = 0;
            if (this.fillCellWidth > 0) { // 列总宽小于容器宽
                maxWidth = this.actualTableWidth
            } else {
                maxWidth = this.actualTableWidth + this.fixedLeftWdith + this.fixedRightWdith
            }
            if (this.scrollX - deltaX > 0) {
                this.scrollX = 0
            } else if (maxWidth - this.width + this.scrollX < deltaX) {
                this.scrollX = this.width - maxWidth
            } else {
                e.preventDefault()
                e.returnValue = false
                this.scrollX -= 2 * deltaX;
            }
        } else {
            if (this.scrollY - deltaY > 0) {
                this.scrollY = 0
            } else if (this.actualTableHeight - this.height + this.scrollY < deltaY) {
                this.scrollY = this.height - this.actualTableHeight
            } else {
                e.preventDefault()
                e.returnValue = false
                this.scrollY -= 2 * deltaY;
            }
        }
        if (this.editor.show) {
            this.editor.setoffset()
        }
    }
    draw() {
        this.painter.clearCanvas()

        // 绘制外层容器
        this.painter.drawRect(0, 0, this.width, this.height, {
            borderColor: '#d4d4d4',
            borderWidth: 1,
            fillColor: '#f8f8f9'
        })

        /**
         * 先绘制body部分，后绘制表头部分，因为表头部分不随scroll事件滚动，
         * 而后绘制的像素会覆盖先绘制的像素，从而达到冻结列的效果
         */

        // rows
        const len = this.data.length
        for(let i = 0; i < len; i++) {
            const row = this.rows[i];
            
            if(row.isVisibleOnScreen()) {
                row.draw();
            }
        }

        // 绘制批量选择边框
        if (this.selectorControl.show) {
            const minX = this.selectorControl.selectedXArea[0]
            const maxX = this.selectorControl.selectedXArea[1]
            const minY = this.selectorControl.selectedYArea[0]
            const maxY = this.selectorControl.selectedYArea[1]
            const minRow = this.rows[minY]
            const x = minRow.cells[minX].x + this.scrollX
            const y = minRow.y + this.scrollY

            let width = 0;
            let height = 0;
            for (let i = minX; i <= maxX; i++) {
                width += minRow.cells[i].width
            }
            for (let i = minY; i <= maxY; i++) {
                height += this.rows[i].height
            }

            this.painter.drawRect(x, y, width, height, {
                borderColor: '#5292f7',
                borderWidth: 2
            })
        }

        
        // 绘制Autofull触点
        if (this.selectorControl.show) {
            let x = ROW_HEADER_WIDTH + CHECK_BOX_WIDTH + this.fixedLeftWdith + this.scrollX - 2; // -2让触点覆盖于边框之上
            let y = HEADER_HEIGHT + this.scrollY - 2;
            const cells = this.rows[0].cells
            for (let i = 0; i <= this.autofill.autofillXIndex; i++) {
                x += cells[i].width
            }
            for (let i = 0; i <= this.autofill.autofillYIndex; i++) {
                y += this.rows[i].height
            }
            this.painter.drawRect(x, y, 6, 6, {
                borderColor: '#fff',
                borderWidth: 2,
                fillColor: '#5292f7'
            })
        }

        // 绘制表头
        this.columnHeaderRow.draw();
    }
}
export default DataGrid