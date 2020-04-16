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
import { dpr } from './config.js'
import { 
    CSS_PREFIX, 
    MIN_CELL_WIDTH, 
    ROW_INDEX_WIDTH, 
    CHECK_BOX_WIDTH,
    SCROLLER_TRACK_SIZE
} from './constants.js'
// import './index.scss'

class DataGrid {
    constructor(target, options) {
        this.target = target
        this.scrollY = 0;
        this.scrollX = 0;

        this.scrollerTrackSize = SCROLLER_TRACK_SIZE;
        this.fillCellWidth = 0; // 所有列宽总和若小于视宽，则需要补全
        this.originFixedWidth = ROW_INDEX_WIDTH + CHECK_BOX_WIDTH
        
        this.color = '#495060'
        this.borderColor = '#dee0e3'
        this.fillColor = '#f8f9fa'
        this.borderWidth = 1

        this.focusCell = null

        this.hashChange = {}

        // 选择区域
        this.selector = {
            show: false, // 是否显示
            isSelected: false, // 单击鼠标按下代表即将要开始范围选择
            selectedXArr: [0,0], // 选中区域
            selectedYArr: [0,0]
        }
        this.editor = {
            show: false,
            editorXIndex: 0,
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

        // 生成主画笔
        this.painter = new Paint(target)

        this.initConfig(options)
        this.initSize(options)
        // this.createContainer()

        // Headers 表头对象
        this.header = new Header(this, 0, 0, this.columns)

        // Body 主体
        this.body = new Body(this, this.columns, this.data)

        this.getTableSize() // 设置画布像素的实际宽高

        // 滚动条
        this.scroller = new Scroller(this)

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
            borderColor: '#dee0e3',
            fillColor: '#f8f9fa',
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
    }
    initSize(options = {}) {
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
    resize() {
        this.initSize()
        this.scroller.init()
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
    getTableSize() {
        this.fixedLeftWidth = this.originFixedWidth
        this.fixedRightWidth = 0
        this.header.fixedColumnHeaders.forEach(item => {
            if (item.index + this.fixedLeft < this.fixedLeft) {
                this.fixedLeftWidth += item.width
            }
            if (item.index + this.fixedLeft >= this.columnsLength - this.fixedRight) {
                this.fixedRightWidth += item.width
            }
        })
        this.tableWidth = this.header.columnHeaders.reduce((sum, item) => {
            return sum + item.width
        }, this.fixedLeftWidth + this.fixedRightWidth)

        this.tableHeight = this.body.height
    }
    /**
     * 选择、编辑相关
     */
    // mousedown事件 -> 开始拖拽批量选取
    selectCell(cell) {
        const { colIndex, rowIndex } = cell
        this.finishedEdit()
        this.focusCell = cell
        this.clearMultiSelect();
        this.selector.show = true;
        this.selector.selectedXArr = [colIndex, colIndex]
        this.selector.selectedYArr = [rowIndex, rowIndex]
        this.selector.isSelected = true

        this.autofill.autofillXIndex = colIndex
        this.autofill.autofillYIndex = rowIndex

        this.editor.editorXIndex = colIndex
        this.editor.editorYIndex = rowIndex
        this.onSelectCell()
    }
    // mousemove事件 -> 更新选取范围
    multiSelectCell(x, y) {
        if(this.selector.isSelected) {
            const minX = x > this.editor.editorXIndex ? this.editor.editorXIndex : x
            const maxX = x > this.editor.editorXIndex ? x : this.editor.editorXIndex
            const minY = y > this.editor.editorYIndex ? this.editor.editorYIndex : y
            const maxY = y > this.editor.editorYIndex ? y : this.editor.editorYIndex
            this.autofill.autofillXIndex = maxX
            this.autofill.autofillYIndex = maxY
            this.selector.selectedXArr = [minX, maxX]
            this.selector.selectedYArr = [minY, maxY]
        }
    }
    updateTooltip({ valid, message, x, y, width }) {
        this.tooltip.update({
            valid, 
            message, 
            x: x + width, 
            y,
        })
    }
    // mouseup事件 -> 结束批量选取
    endMultiSelect() {
        this.selector.isSelected = false;
    }
    // 清空批量选取
    clearMultiSelect() {
        this.selector.show = false;
        this.selector.selectedXArr = [0,0];
        this.selector.selectedYArr = [0,0];
    }
    // 开始编辑
    startEdit(value) {
        // this.editor.setData(cell.value)
        // if (cell.dateType === 'date' || cell.dateType === 'select') {
        //     this.onEditCell(cell)
        // } else {
        //     this.selector.show = false;
        //     this.editor.fire(cell);
        // }
        if (this.focusCell && !this.focusCell.readonly) {
            value && this.setData(value)
            this.editor.show = true
            this.selector.show = false;
            this.onEditCell({
                value: value || this.focusCell.value,
                x: this.focusCell.x,
                y: this.focusCell.y,
                width: this.focusCell.width,
                height: this.focusCell.height,
                dateType: this.focusCell.dateType,
                options: this.focusCell.options,
                scrollX: this.scrollX,
                scrollY: this.scrollY
            })
        }
    }
    // 结束编辑
    finishedEdit() {
        if (this.editor.show && this.focusCell) {
            // const cell = this.body.getCell(this.editor.editorXIndex, this.editor.editorYIndex)
            // if (cell) {
            //     cell.value = this.editor.value
            //     // this.rePaintRow(this.editor.editorYIndex)
            // }
            // this.editor.hide();
            this.focusCell.validate()
            this.focusCell = null
            this.editor.show = false
            this.selector.show = true; // 编辑完再选中该单元格
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
    /**
     * 画布绘制相关
     */
    initPaint() {
        this.draw()
        window.requestAnimationFrame(this.initPaint.bind(this));
    }
    rePaintRow(rowIndex) {
        this.body.rePaintRow(rowIndex)
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
    getCheckedRow() {
        return this.body.getCheckedRow()
    }
    getChangedRow() {
        return this.body.getChangedRow()
    }
}
export default DataGrid