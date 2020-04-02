/**
 * 程序入口
 */
import { h } from './element.js'
import Paint from './Paint.js'
import Body from './Body.js'
import Header from './ColumnHeaderRow.js'
import Editor from './Editor.js'
// import Selector from './Selector.js'
import { CSS_PREFIX, CELL_WIDTH, MIN_CELL_WIDTH, CELL_HEIGHT, HEADER_HEIGHT, ROW_INDEX_WIDTH, CHECK_BOX_WIDTH } from './constants.js'
import './index.scss'

class DataGrid {
    constructor(target, options) {
        this.xxx = 0
        this.yyy = 0
        this.scrollY = 0;
        this.scrollX = 0;

        this.scrollerWidth = 20;
        this.fillCellWidth = 0; // 所有列宽总和若小于视宽，则需要补全
        
        this.color = '#495060'
        this.borderColor = '#dee0e3'
        this.fillColor = '#f8f9fa'
        this.borderWidth = 1

        // 选择区域
        this.selector = {
            show: false, // 是否显示
            isSelected: false, // 单击鼠标按下代表即将要开始范围选择
            selectedXArr: [0,0], // 选中区域
            selectedYArr: [0,0]
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

        this.initConfig(options)
        this.setContainerSize(target, options)
        this.createContainer(target)

        this.tableWidth = this.columns.reduce((sum, item) => {
            return sum + item.width || CELL_WIDTH
        }, ROW_INDEX_WIDTH + CHECK_BOX_WIDTH)

        this.tableHeight = this.data.length * CELL_HEIGHT + HEADER_HEIGHT
        
        // Headers 表头对象
        this.header = new Header(this, 0, 0, this.columns)

        // Body 主体
        this.body = new Body(this, this.columns, this.data)
        
        this.setActualSize() // 设置画布像素的实际宽高

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
    }
    setContainerSize(target, options) {
        const {
            width,
            left,
            top
        } = target.getBoundingClientRect()
        this.containerOriginX = left;
        this.containerOriginY = top;
        this.width = options.width || width; // 容器宽
        this.height = options.height || (window.innerHeight - top); // 容器高
    }
    createContainer(target) {
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

        target.appendChild(this.rootEl.el)
    }
    setActualSize() {
        this.fixedLeftWidth = ROW_INDEX_WIDTH + CHECK_BOX_WIDTH
        this.fixedRightWidth = 0
        this.header.fixedColumnHeaders.forEach(item => {
            if (item.index + this.fixedLeft < this.fixedLeft) {
                this.fixedLeftWidth += item.width
            }
            if (item.index + this.fixedLeft >= this.columns.length - this.fixedRight) {
                this.fixedRightWidth += item.width
            }
        })
        this.tableWidth = this.header.columnHeaders.reduce((sum, item) => {
            return sum + item.width
        }, 0)

        this.tableHeight = this.body.height
    }
    /**
     * 选择、编辑相关
     */
    // mousedown事件 -> 开始拖拽批量选取
    selectCell(x, y) {
        this.finishedEdit()
        this.clearMultiSelect();
        this.selector.show = true;
        this.selector.selectedXArr = [x, x]
        this.selector.selectedYArr = [y, y]
        this.selector.isSelected = true

        this.autofill.autofillXIndex = x
        this.autofill.autofillYIndex = y

        this.editor.editorXIndex = x
        this.editor.editorYIndex = y
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
    startEdit(cell) {
        this.editor.show = true
        this.editor.setData(cell.value)
        if (cell.dateType === 'text' || cell.dateType === 'number') {
            this.selector.show = false;
            this.editor.fire(cell);
        } else {
            this.onEditCell(cell)
        }
    }
    // 结束编辑
    finishedEdit() {
        if (this.editor.show) {
            const cell = this.body.getCell(this.editor.editorXIndex, this.editor.editorYIndex)
            if (cell) {
                cell.value = this.editor.value
                // this.rePaintRow(this.editor.editorYIndex)
            }
            this.editor.hide();
            this.selector.show = true; // 编辑完再选中该单元格
        }
    }
    /**
     * 调整列宽、行宽
     */
    resizeColumn(colIndex, width) {
        if (width < MIN_CELL_WIDTH) return;

        this.header.resizeColumn(colIndex, width);

        this.body.resizeColumn(colIndex, width)
    
        this.setActualSize()
    }
    resizeRow(rowIndex, height) {
        this.body.resizeRow(rowIndex, height)
        this.setActualSize()
    }
    /**
     * 事件相关
     */
    handleCheckRow(y) {
        this.body.handleCheckRow(y)
    }
    handleMouseDown(x, y) {
        if(this.header.isInsideHeader(x, y)) {
            this.header.mouseDown(x, y);
        }
        this.body.mouseDown(x, y);
    }
    handleMouseMove(x, y) {
        document.body.style.cursor = 'default';
        if(this.header.isInsideHeader(x, y)) {
            this.header.mouseMove(x, y);
        }
        this.body.mouseMove(x, y);
    }
    handleMouseUp(x, y) {
        if(this.header.isInsideHeader(x, y)) {
            this.header.mouseUp(x, y);
        }
        this.body.mouseUp(x, y);
    }
    handleClick(x, y) {
        this.body.click(x, y);
    }
    handleDbClick(x, y) {
        this.body.dbClick(x, y);
    }
    handleScroll(e) {
        if (this.editor.show) return;
        const { deltaX, deltaY } = e
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            let maxWidth = 0;
            if (this.fillCellWidth > 0) { // 列总宽小于容器宽
                maxWidth = this.tableWidth
            } else {
                maxWidth = this.tableWidth + this.fixedLeftWidth + this.fixedRightWidth
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
            } else if (this.tableHeight - this.height + this.scrollY < deltaY) {
                this.scrollY = this.height - this.tableHeight
            } else {
                e.preventDefault()
                e.returnValue = false
                this.scrollY -= 2 * deltaY;
            }
        }
        // if (this.editor.show) {
        //     this.editor.setoffset() // 编辑器跟着滚动
        // }
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
            fillColor: '#fff',
            borderWidth: this.borderWidth
        })
    }
    // drawSelector() {
    //     if (this.selector.show) {
    //         const minX = this.selector.selectedXArr[0]
    //         const maxX = this.selector.selectedXArr[1]
    //         const minY = this.selector.selectedYArr[0]
    //         const maxY = this.selector.selectedYArr[1]
    //         const minRow = this.body.getRow(minY)
    //         const x = minRow.cells[minX].x + this.scrollX
    //         const y = minRow.y + this.scrollY

    //         let width = 0;
    //         let height = 0;
    //         for (let i = minX; i <= maxX; i++) {
    //             width += minRow.cells[i].width
    //         }
    //         for (let i = minY; i <= maxY; i++) {
    //             height += this.body.rows[i].height
    //         }

    //         this.painter.drawRect(x, y, width, height, {
    //             borderColor: this.selectBorderColor,
    //             borderWidth: 2
    //         })
    //     }
    // }
    // drawAutofill() {
    //     if (this.selector.show) {
    //         const cell = this.body.getCell(this.autofill.autofillXIndex, this.autofill.autofillYIndex)

    //         // -2让触点覆盖于边框之上
    //         this.painter.drawRect(cell.x + cell.width + this.scrollX - 2, cell.y + cell.height + this.scrollY - 2, 6, 6, {
    //             borderColor: '#fff',
    //             borderWidth: 2,
    //             fillColor: this.selectBorderColor
    //         })
    //     }
    // }
    draw() {
        this.painter.clearCanvas()

        // 绘制外层容器
        this.drawContainer()

        // 绘制批量选择边框
        // this.drawSelector()

        // 绘制Autofull触点
        // this.drawAutofill()

        // body
        this.body.draw()

        // 绘制表头
        this.header.draw();
    }
}
export default DataGrid