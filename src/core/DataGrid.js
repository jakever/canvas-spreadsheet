/**
 * 程序入口
 */
import { h } from './element.js'
import Paint from './Paint.js'
import Body from './Body.js'
import Header from './Header.js'
import Editor from './Editor.js'
import Scroller from './Scroller.js'
import Events from './Events.js'
import Tooltip from './Tooltip.js'
import Clipboard from './Clipboard.js'
import { dpr } from './config.js'
import { 
    CSS_PREFIX, 
    MIN_CELL_WIDTH, 
    ROW_INDEX_WIDTH, 
    CHECK_BOX_WIDTH,
    SCROLLER_TRACK_SIZE,
    HEADER_HEIGHT
} from './constants.js'
// import './index.scss'

class DataGrid {
    constructor(target, options) {
        this.target = target
        this.scrollY = 0;
        this.scrollX = 0;

        this.checkboxWidth = CHECK_BOX_WIDTH
        this.horizontalScrollerSize = SCROLLER_TRACK_SIZE;
        this.verticalScrollerSize = SCROLLER_TRACK_SIZE;

        this.focusCell = null

        this.hashChange = {} // diff changed

        // 选择区域
        this.selector = {
            show: false, // 是否显示
            isSelected: false, // 单击鼠标按下代表即将要开始范围选择
            xArr: [-1, -1], // 选中区域
            yArr: [-1, -1]
        }
        this.editor = {
            show: false,
            xIndex: 0,
            yIndex: 0
        }
        // 自动填充
        this.autofill = {
            enable: false, // 为true代表要开始下拉数据填充
            xIndex: 0, // 数据填充触点的坐标
            yIndex: 0,
            xArr: [-1, -1], // 数据填充的范围
            yArr: [-1, -1]
        }

        // 生成主画笔
        this.painter = new Paint(target)

        this.initConfig(options)

        // this.initTableSize()

        // this.createContainer()

        this.clipboard = new Clipboard(this)

        // Headers 表头对象
        this.header = new Header(this, 0, 0)

        // Body 主体
        this.body = new Body(this, this.data)

        // 滚动条
        this.scroller = new Scroller(this)

        this.setLayoutSize(options) // 设置容器宽高

        this.initTableSize()

        this.tooltip = new Tooltip(this, 0, 0)

        this.events = new Events(this, target)
        
        this.initPaint()
    }
    /**
     * 容器初始化相关
     */
    initConfig(options) {
        Object.assign(this, {
            columns: [],
            data: [],
            color: '#495060',
            borderColor: '#e1e6eb',
            fillColor: '#fff',
            borderWidth: 1,
            fixedLeft: 0,
            fixedRight: 0,
            showCheckbox: true,
            onSelectCell: (cell) => {},
            onMultiSelectCell: (cells) => {},
            onEditCell: (cell) => {},
            onSelectRow: (row) => {},
            onResizeColumn: () => {},
            onResizeRow: () => {}
          }, options);
        this.columnsLength = this.columns.length
        this.range = { // 编辑器边界范围
            minX: 0,
            maxX: this.columns.length - 1,
            minY: 0,
            maxY: this.data.length - 1
        }
        if (!this.showCheckbox) {
            this.checkboxWidth = 0
        }
        this.originFixedWidth = ROW_INDEX_WIDTH + this.checkboxWidth
    }
    setLayoutSize(options = {}) {
        const el = this.target.parentElement
        const {
            width,
            left,
            top
        } = el.getBoundingClientRect()
        this.containerOriginX = left;
        this.containerOriginY = top;
        this.width = options.width || width; // 容器宽
        this.height = options.height || (window.innerHeight - top); // 容器高

        this.target.width = this.width * dpr;
        this.target.height = this.height * dpr;
        this.target.style.width = this.width + "px";
        this.target.style.height = this.height + "px";
        el.style.height = this.height + "px";
        this.painter.scaleCanvas(dpr)
    }
    getTableSize() {
        let fixedLeftWidth = this.originFixedWidth
        let fixedRightWidth = SCROLLER_TRACK_SIZE
        this.header.fixedColumnHeaders.forEach(item => {
            if (item.index < this.fixedLeft) {
                fixedLeftWidth += item.width
            }
            if (item.index > this.columnsLength - 1 - this.fixedRight) {
                fixedRightWidth += item.width
            }
        })
        this.fixedLeftWidth = fixedLeftWidth
        this.fixedRightWidth = fixedRightWidth
        this.tableWidth = this.header.allColumnHeaders.reduce((sum, item) => {
            return sum + item.width
        }, this.originFixedWidth)
        this.tableHeight = this.body.height

        this.scroller.reset()
    }
    initTableSize() {
        this.getTableSize()

        this.fillTableWidth()
    }
    fillTableWidth() { // 列较少时，宽度不够补余
        if (this.tableWidth <= this.width - SCROLLER_TRACK_SIZE) { // 没有横向滚动条
            const fillCellWidth = (this.width - SCROLLER_TRACK_SIZE - this.tableWidth) / this.columnsLength
            fillCellWidth && this.body.resizeAllColumn(fillCellWidth)
            fillCellWidth && this.header.resizeAllColumn(fillCellWidth)
            this.tableWidth = this.width - SCROLLER_TRACK_SIZE
            this.fixedLeftWidth = 0
            this.fixedRightWidth = SCROLLER_TRACK_SIZE
            // this.hasHorizontalScroll = false
        } else {
            // this.fixedLeftWidth = fixedLeftWidth
            // this.fixedRightWidth = fixedRightWidth + SCROLLER_TRACK_SIZE
            // this.hasHorizontalScroll = true
        }
        if (this.tableHeight <= this.height - SCROLLER_TRACK_SIZE) { // 没有纵向滚动条
            // this.hasVerticalScroll = false
            // this.height = this.tableHeight + SCROLLER_TRACK_SIZE
        } else {
            // this.hasVerticalScroll = true
        }
        this.scroller.reset()
    }
    resize() {
        const diffX = this.tableWidth - this.width + this.scrollX
        this.setLayoutSize()
        
        this.fillTableWidth()

        if (this.tableWidth - (this.width - SCROLLER_TRACK_SIZE) + this.scrollX < 0) { // 小屏滚动到最右侧再调大屏幕断开的问题
            this.scrollX = this.width - this.tableWidth + diffX
        }
    }
    createContainer() {
        // 顶层容器
        this.rootEl = h('div', `${CSS_PREFIX}`);

        // this.loadingEl = h('div', `${CSS_PREFIX}-loading`)
        //     .children(
        //         this.loadingDot = h('div', `${CSS_PREFIX}-loading-dot`)
        //     )
        // 画布外层容器
        this.wrapEl = h('div', `${CSS_PREFIX}-main`);
        this.wrapEl.offset({
            width: this.width,
            height: this.height
        })
        this.rootEl.children(
            this.wrapEl
        )
        
        // 画布
        this.tableEl = h('canvas', `${CSS_PREFIX}-table`);
        
        // 编辑器
        this.editor = new Editor(this)
        // this.selector = new Selector()

        // 编辑器、选区容器
        this.overlayerEl = h('div', `${CSS_PREFIX}-overlayer`)
            .children(
                this.editor.el,
                // this.selector.el
            )

        this.wrapEl.children(
            this.tableEl,
            this.overlayerEl
        )

        this.target.appendChild(this.rootEl.el)
    }
    /**
     * 选择、编辑相关
     */
    // mousedown事件 -> 开始拖拽批量选取
    selectCell({ colIndex, rowIndex }) {
        this.clipboard.el.focus()
        this.doneEdit()
        this.clearMultiSelect();
        this.editor.xIndex = colIndex
        this.editor.yIndex = rowIndex
        this.selector.show = true;
        this.selector.isSelected = true
        this.adjustBoundaryPosition()
    }
    // mousemove事件 -> 更新选取范围
    multiSelectCell(x, y) {
        const selector = this.selector
        if(selector.isSelected) {
            const minX = x > this.editor.xIndex ? this.editor.xIndex : x
            const maxX = x > this.editor.xIndex ? x : this.editor.xIndex
            const minY = y > this.editor.yIndex ? this.editor.yIndex : y
            const maxY = y > this.editor.yIndex ? y : this.editor.yIndex
            this.autofill.xIndex = maxX
            this.autofill.yIndex = maxY
            selector.xArr = [minX, maxX]
            selector.yArr = [minY, maxY]
        }
        // 设置autofill填充区域
        if (this.autofill.enable) {
            this.autofill.xArr = selector.xArr.slice()
            this.autofill.yArr = selector.yArr.slice()
            if (y >= selector.yArr[0] && y <= selector.yArr[1]) {
                if (x > selector.xArr[1]) {
                    this.autofill.xArr.splice(1, 1, x)
                } else if (x < selector.xArr[0]) {
                    this.autofill.xArr.splice(0, 1, x)
                }
            } else {
                if (y > selector.yArr[1]) {
                    this.autofill.yArr.splice(1, 1, y)
                } else if (y < selector.yArr[0]) {
                    this.autofill.yArr.splice(0, 1, y)
                }
            }
        }
    }
    // mouseup事件
    endMultiSelect() {
        this.selector.isSelected = false;
        if (this.selector.show && this.autofill.enable) {
            this.body.autofillData()
            this.autofill.enable = false;
        }
    }
    // 清空批量选取
    clearMultiSelect() {
        this.selector.xArr = [-1, -1];
        this.selector.yArr = [-1, -1];
    }
    startAutofill() {
        this.autofill.enable = true
    }
    clearAuaofill() {
        this.selector.xArr.splice(0, 1, this.autofill.xArr[0])
        this.selector.xArr.splice(1, 1, this.autofill.xArr[1])
        this.selector.yArr.splice(0, 1, this.autofill.yArr[0])
        this.selector.yArr.splice(1, 1, this.autofill.yArr[1])
        this.autofill.xIndex = this.selector.xArr[1]
        this.autofill.yIndex = this.selector.yArr[1]
        // 填充完数据清空
        this.autofill.xArr = [-1, -1];
        this.autofill.yArr = [-1, -1];
    }
    // 开始编辑
    startEdit(val) {
        // this.editor.setData(cell.value)
        // if (cell.dataType === 'date' || cell.dataType === 'select') {
        //     this.onEditCell(cell)
        // } else {
        //     this.selector.show = false;
        //     this.editor.fire(cell);
        // }
        const {
            x,
            y,
            width,
            height,
            value,
            fixed,
            dataType,
            options
        } = this.focusCell
        if (this.focusCell && !this.focusCell.readonly) {
            const _x = fixed === 'right' ? 
                this.width - (this.tableWidth - x - width) - width - this.verticalScrollerSize :
                (fixed === 'left' ? x : x + this.scrollX);
            const _y = y + this.scrollY

            val && this.setData(val)
            this.editor.show = true
            this.selector.show = false;
            this.onEditCell({
                value: val || value,
                x: _x,
                y: _y,
                width,
                height,
                dataType,
                options
            })
        }
    }
    // 完成编辑
    doneEdit() {
        if (this.editor.show && this.focusCell) {
            // const cell = this.body.getCell(this.editor.xIndex, this.editor.yIndex)
            // if (cell) {
            //     cell.value = this.editor.value
            //     // this.rePaintRow(this.editor.yIndex)
            // }
            // this.editor.hide();
            this.focusCell.validate()
            this.editor.show = false
            this.selector.show = true; // 编辑完再选中该单元格
            this.onSelectCell(this.focusCell)
            this.clipboard.clear()
        }
    }
    setData(value) {
        this.focusCell && this.focusCell.setData(value)
    }
    /**
     * 调整列宽、行宽
     */
    resizeColumn(colIndex, width) {
        if (width < MIN_CELL_WIDTH) return;

        this.header.resizeColumn(colIndex, width);

        this.body.resizeColumn(colIndex, width)
    
        this.getTableSize()
    }
    resizeRow(rowIndex, height) {
        this.body.resizeRow(rowIndex, height)
        this.getTableSize()
    }
    handleCheckRow(y) {
        this.body.handleCheckRow(y)
    }
    moveFocus(dir) {
        switch(dir) {
            case 'LEFT':
                if (this.editor.xIndex > this.range.minX) {
                    this.editor.xIndex--
                    this.adjustBoundaryPosition()
                }
                break
            case 'TOP':
                if (this.editor.yIndex > this.range.minY) {
                    this.editor.yIndex--
                    this.adjustBoundaryPosition()
                }
                break
            case 'RIGHT':
                if (this.editor.xIndex < this.range.maxX) {
                    this.editor.xIndex++
                    this.adjustBoundaryPosition()
                }
                break
            case 'BOTTOM':
                if (this.editor.yIndex < this.range.maxY) {
                    this.editor.yIndex++
                    this.adjustBoundaryPosition()
                }
                break
            default:
                //
        }
    }
    adjustBoundaryPosition() {
        this.focusCell = this.body.getCell(this.editor.xIndex, this.editor.yIndex)
        
        this.selector.xArr = [this.editor.xIndex, this.editor.xIndex]
        this.selector.yArr = [this.editor.yIndex, this.editor.yIndex]
        this.autofill.xIndex = this.editor.xIndex
        this.autofill.yIndex = this.editor.yIndex

        if (this.focusCell.fixed) return;

        const cellTotalViewWidth = this.focusCell.x + this.focusCell.width + this.scrollX
        const cellTotalViewHeight = this.focusCell.y + this.focusCell.height + this.scrollY
        const viewWidth = this.width - this.fixedRightWidth
        const viewHeight = this.height - this.verticalScrollerSize
        const diffLeft = this.focusCell.x + this.scrollX - this.fixedLeftWidth
        const diffRight = viewWidth - cellTotalViewWidth
        const diffTop = this.focusCell.y + this.scrollY - HEADER_HEIGHT
        const diffBottom = viewHeight - cellTotalViewHeight
        // const fillWidth = this.focusCell.colIndex < this.columnsLength - 1 - this.fixedRight ?
        //     this.focusCell.x + this.scrollX - viewWidth
        //     : 0
        if (diffRight < 0) {
            this.scroller.update(diffRight, 'HORIZONTAL')
        } else if (diffLeft < 0) {
            this.scroller.update(-diffLeft, 'HORIZONTAL')
        }
        if (diffTop < 0) {
            this.scroller.update(-diffTop, 'VERTICAL')
        } else if (diffBottom < 0) {
            this.scroller.update(diffBottom, 'VERTICAL')
        }
    }
    /**
     * 画布绘制相关
     */
    initPaint() {
        this.draw()
        window.requestAnimationFrame(this.initPaint.bind(this));
    }
    drawContainer() {
        this.painter.drawRect(0, 0, this.width, this.height, {
            borderColor: this.borderColor,
            // fillColor: '#fff',
            borderWidth: this.borderWidth
        })
    }
    draw() {
        this.painter.clearCanvas()

        // body
        this.body.draw()
        
        // 数据校验错误提示
        this.tooltip.draw()

        // 绘制表头
        this.header.draw();

        // 绘制滚动条
        this.scroller.draw();

        // 绘制外层容器
        this.drawContainer()
    }
    loadData(data) {
        this.data = data
        this.range.maxY = data.length - 1
        this.body.paint(data)
        this.getTableSize()
    }
    getData() {
        return this.body.getData()
    }
    getCheckedRows() {
        return this.body.getCheckedRows()
    }
    getChangedRows() {
        return this.body.getChangedRows()
    }
}
export default DataGrid