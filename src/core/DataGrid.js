/**
 * 程序入口
 */
import { h } from "./element.js";
import Paint from "./Paint.js";
import Body from "./Body.js";
import Header from "./Header.js";
import Editor from "./Editor.js";
import Scroller from "./Scroller.js";
import Events from "./Events.js";
import Tooltip from "./Tooltip.js";
import Clipboard from "./Clipboard.js";
import Histories from "./History.js";
import { dpr } from "./config.js";
import {
  toLeaf,
  getMaxRow,
  calCrossSpan
} from './util.js'
import {
  CSS_PREFIX,
  ROW_INDEX_WIDTH,
  CHECK_BOX_WIDTH,
  SCROLLER_TRACK_SIZE,
  HEADER_HEIGHT
} from "./constants.js";

class DataGrid {
  constructor(target, options) {
    this.target = target;
    this.scrollY = 0;
    this.scrollX = 0;

    this.checkboxWidth = CHECK_BOX_WIDTH;
    this.horizontalScrollerSize = SCROLLER_TRACK_SIZE;
    this.verticalScrollerSize = SCROLLER_TRACK_SIZE;

    this.tempValue = ''; // 存储用户输入的临时值，当执行doneEdit后才去setData()
    this.focusCell = null; // 当前焦点所在的cell
    this.enterShift = false; // 是否按下shift

    this.hashChange = {}; // diff changed

    // 选择区域
    this.selector = {
      show: false, // 是否显示
      isSelected: false, // 单击鼠标按下代表即将要开始范围选择
      xArr: [-1, -1], // 选中区域
      yArr: [-1, -1]
    };
    this.editor = {
      show: false,
      xIndex: 0,
      yIndex: 0
    };
    // 自动填充
    this.autofill = {
      enable: false, // 为true代表要开始下拉数据填充
      xIndex: 0, // 数据填充触点的坐标
      yIndex: 0,
      xArr: [-1, -1], // 数据填充的范围
      yArr: [-1, -1]
    };

    // 生成主画笔
    this.painter = new Paint(target);

    this.initConfig(options);

    // this.createContainer()

    this.clipboard = new Clipboard(this);

    // Headers 表头对象
    this.header = new Header(this, 0, 0);

    // Body 主体
    this.body = new Body(this, this.data);

    // 滚动条
    this.scroller = new Scroller(this);

    this.setLayoutSize(options); // 设置容器宽高

    this.initTableSize();

    this.tooltip = new Tooltip(this, 0, 0);

    this.events = new Events(this, target);

    this.history = new Histories(this)

    this.initPaint();
  }
  /**
   * 容器初始化相关
   */
  initConfig(options) {
    Object.assign(
      this,
      {
        data: [],
        color: "#495060",
        borderColor: "#e1e6eb",
        fillColor: "#fff",
        borderWidth: 1,
        fixedLeft: 0,
        fixedRight: 0,
        showCheckbox: true,
        headerHeight: HEADER_HEIGHT,
        beforeSelectCell: cell => {}, // 选中单元格之前触发
        afterSelectCell: cell => {},
        beforeMultiSelectCell: cells => {}, // 批量选中单元格之前触发
        afterMultiSelectCell: cells => {},
        beforeEditCell: cell => {}, // 编辑单元格
        afterEditCell: cell => {},
        beforeSelectRow: row => {}, // 选中行触发
        afterSelectRow: row => {},
        beforeResizeColumn: () => {}, // 调整列宽
        afterResizeColumn: () => {},
        beforeResizeRow: () => {}, //调整行高
        afterResizeRow: () => {},
        beforeAutofill: () => {}, // 自动填充
        afterAutofill: () => {},
        beforeCopy: () => {}, // 复制
        afterCopy: () => {},
        beforePaste: () => {}, // 粘贴
        afterPaste: () => {},
        afterClear: () => {}, // 清空数据
        onLoad: () => {} // 表格加载完成
      },
      options
    );

    // 编辑器边界范围
    this.range = {
      minX: 0,
      minY: 0,
      maxY: this.data.length - 1
    };
    this.updateColumns(options.columns)

    if (!this.showCheckbox) {
      this.checkboxWidth = 0;
    }
    this.originFixedWidth = ROW_INDEX_WIDTH + this.checkboxWidth;
  }
  /**
   * 获取容器可是区域宽、高，设置canvas容器样式尺寸、画布尺寸
   */
  setLayoutSize(options = {}) {
    const el = this.target.parentElement;
    const rootEl = el.parentElement;
    const { width, left, top } = rootEl.getBoundingClientRect();
    this.containerOriginX = left;
    this.containerOriginY = top;
    this.width = options.width || width; // 容器宽
    this.height = options.height || window.innerHeight - top; // 容器高

    this.target.width = this.width * dpr;
    this.target.height = this.height * dpr;
    this.target.style.width = this.width + "px";
    this.target.style.height = this.height + "px";
    el.style.width = this.width + "px";
    el.style.height = this.height + "px";
    this.painter.scaleCanvas(dpr);
  }
  /**
   * 获取表格左、右冻结列宽，表格实际的宽、高
   */
  getTableSize() {
    let fixedLeftWidth = this.originFixedWidth;
    let fixedRightWidth = SCROLLER_TRACK_SIZE;
    this.header.fixedColumnHeaders.forEach(item => {
      if (item.index < this.fixedLeft) {
        fixedLeftWidth += item.width;
      }
      if (item.index > this.columnsLength - 1 - this.fixedRight) {
        fixedRightWidth += item.width;
      }
    });
    this.fixedLeftWidth = fixedLeftWidth;
    this.fixedRightWidth = fixedRightWidth;
    this.tableWidth = this.header.allColumnHeaders.filter(item => !item.level).reduce((sum, item) => {
      return sum + item.width;
    }, this.originFixedWidth);
    this.tableHeight = this.body.height;

    this.scroller.reset();
  }
  initTableSize() {
    this.getTableSize();
    this.fillTableWidth();
  }
  /**
   * 列总宽小于可视区域宽度时，需要补余
   */
  fillTableWidth() {
    if (this.tableWidth <= this.width - SCROLLER_TRACK_SIZE) { // 没有横向滚动条
      const fillCellWidth =
        (this.width - SCROLLER_TRACK_SIZE - this.tableWidth) /
        this.columnsLength;
      fillCellWidth && this.body.resizeAllColumn(fillCellWidth);
      fillCellWidth && this.header.resizeAllColumn(fillCellWidth);
      this.tableWidth = this.width - SCROLLER_TRACK_SIZE;
      this.fixedLeftWidth = 0;
      this.fixedRightWidth = SCROLLER_TRACK_SIZE;
    }
    
    this.scroller.reset();
  }
  resize() {
    const diffX = this.tableWidth - this.width + this.scrollX;

    this.setLayoutSize();
    this.fillTableWidth();

    if (
      this.tableWidth - (this.width - SCROLLER_TRACK_SIZE) + this.scrollX <
      0
    ) {
      // 小屏滚动到最右侧再调大屏幕断开的问题
      this.scrollX = this.width - this.tableWidth + diffX;
    }
  }
  createContainer() {
    // 顶层容器
    this.rootEl = h("div", `${CSS_PREFIX}`);

    // this.loadingEl = h('div', `${CSS_PREFIX}-loading`)
    //     .children(
    //         this.loadingDot = h('div', `${CSS_PREFIX}-loading-dot`)
    //     )
    // 画布外层容器
    this.wrapEl = h("div", `${CSS_PREFIX}-main`);
    this.wrapEl.offset({
      width: this.width,
      height: this.height
    });
    this.rootEl.children(this.wrapEl);

    // 画布
    this.tableEl = h("canvas", `${CSS_PREFIX}-table`);

    // 编辑器
    this.editor = new Editor(this);
    // this.selector = new Selector()

    // 编辑器、选区容器
    this.overlayerEl = h("div", `${CSS_PREFIX}-overlayer`).children(
      this.editor.el
      // this.selector.el
    );

    this.wrapEl.children(this.tableEl, this.overlayerEl);

    this.target.appendChild(this.rootEl.el);
  }
  /**
   * 选择、编辑相关----------------------------------------------------->
   */
  getCell(x, y) {
    return this.body.getCell(x, y);
  }
  // mousedown事件 -> 开始拖拽批量选取
  selectCell({ colIndex, rowIndex }) {
    this.clearMultiSelect();
    this.selector.show = true;
    this.selector.isSelected = true;
    
    // shift批量选择
    if (this.enterShift && this.focusCell) {
      const { colIndex: oldX, rowIndex: oldY } = this.focusCell
      
      const minX = Math.min(oldX, colIndex)
      const maxX = Math.max(oldX, colIndex)
      const minY = Math.min(oldY, rowIndex);
      const maxY = Math.max(oldY, rowIndex);
      this.autofill.xIndex = maxX;
      this.autofill.yIndex = maxY;
      this.selector.xArr = [minX, maxX];
      this.selector.yArr = [minY, maxY];
    } else {
      this.editor.xIndex = colIndex;
      this.editor.yIndex = rowIndex;
      this.adjustBoundaryPosition();
    }
    
    this.putCell()
  }
  // 将选区和autofill置为编辑框所在位置
  resetCellPosition() {
    this.selector.xArr = [this.editor.xIndex, this.editor.xIndex];
    this.selector.yArr = [this.editor.yIndex, this.editor.yIndex];
    this.autofill.xIndex = this.editor.xIndex;
    this.autofill.yIndex = this.editor.yIndex;
  }
  /**
   * 将画布单元格中的数据传递到编辑器中
   */
  putCell() {
    const {
      x,
      y,
      width,
      height,
      value,
      fixed,
      dataType,
      options
    } = this.focusCell;
    const _x =
      fixed === "right"
        ? this.width -
          (this.tableWidth - x - width) -
          width -
          SCROLLER_TRACK_SIZE
        : fixed === "left"
        ? x
        : x + this.scrollX;
    const _y = y + this.scrollY;
    this.afterSelectCell({
      value,
      x: _x,
      y: _y,
      width,
      height,
      dataType,
      options
    });
  }
  // mousemove事件 -> 更新选取范围
  multiSelectCell(x, y, mouseX, mouseY) {
    const selector = this.selector;
    if (selector.isSelected) {
      const minX = Math.min(x, this.editor.xIndex);
      const maxX = Math.max(x, this.editor.xIndex);
      const minY = Math.min(y, this.editor.yIndex);
      const maxY = Math.max(y, this.editor.yIndex);
      this.autofill.xIndex = maxX;
      this.autofill.yIndex = maxY;
      selector.xArr = [minX, maxX];
      selector.yArr = [minY, maxY];
      this.adjustPosition(x, y, mouseX, mouseY)
    }
    // 设置autofill填充区域
    if (this.autofill.enable) {
      this.adjustPosition(x, y, mouseX, mouseY)
      this.autofill.xArr = selector.xArr.slice();
      this.autofill.yArr = selector.yArr.slice();
      if (y >= selector.yArr[0] && y <= selector.yArr[1]) {
        if (x > selector.xArr[1]) {
          this.autofill.xArr.splice(1, 1, x);
        } else if (x < selector.xArr[0]) {
          this.autofill.xArr.splice(0, 1, x);
        }
      } else {
        if (y > selector.yArr[1]) {
          this.autofill.yArr.splice(1, 1, y);
        } else if (y < selector.yArr[0]) {
          this.autofill.yArr.splice(0, 1, y);
        }
      }
    }
  }
  // mouseup事件
  endMultiSelect() {
    this.selector.isSelected = false;
    if (this.selector.show && this.autofill.enable) {
      this.body.autofillData();
      this.autofill.enable = false;
    }
  }
  // 清空批量选取
  clearMultiSelect() {
    this.selector.xArr = [-1, -1];
    this.selector.yArr = [-1, -1];
  }
  // 选中整列
  selectCols(col) {
    const { index, colspan } = col
    // 复合表头情况下，需要处理跨级
    const colspanIndx = index + colspan - 1
    this.selector.show = true
    if (this.enterShift && this.focusCell) {
      const { colIndex: oldX } = this.focusCell
      const minX = Math.min(oldX, index)
      const maxX = Math.max(oldX, colspanIndx)
      this.selector.xArr = [minX, maxX];
      this.selector.yArr = [this.range.minY, this.range.maxY];
      this.editor.xIndex = oldX; // 将编辑器坐标置为第一次按下鼠标的位置
      this.editor.yIndex = this.range.minY;
      this.autofill.xIndex = maxX
      this.autofill.yIndex = this.range.maxY
    } else {
      this.selector.xArr = [index, colspanIndx];
      this.selector.yArr = [this.range.minY, this.range.maxY];
      this.editor.xIndex = index;
      this.editor.yIndex = this.range.minY;
      this.autofill.xIndex = colspanIndx
      this.autofill.yIndex = this.range.maxY
    }
    
    this.focusCell = this.body.getCell(this.editor.xIndex, this.editor.yIndex);
    this.putCell()
  }
  // 选中整行
  selectRows({ rowIndex }) {
    this.selector.show = true
    if (this.enterShift && this.focusCell) {
      const { rowIndex: oldY } = this.focusCell
      const minY = Math.min(oldY, rowIndex)
      const maxY = Math.max(oldY, rowIndex)
      this.selector.xArr = [this.range.minX, this.range.maxX];
      this.selector.yArr = [minY, maxY];
      this.editor.xIndex = this.range.minX;
      this.editor.yIndex = oldY;
      this.autofill.xIndex = this.range.maxX
      this.autofill.yIndex = maxY
    } else {
      this.selector.xArr = [this.range.minX, this.range.maxX];
      this.selector.yArr = [rowIndex, rowIndex];
      this.editor.xIndex = this.range.minX;
      this.editor.yIndex = rowIndex;
      this.autofill.xIndex = this.range.maxX
      this.autofill.yIndex = rowIndex
    }
    
    this.focusCell = this.body.getCell(this.editor.xIndex, this.editor.yIndex);
    this.putCell()
  }
  startAutofill() {
    this.autofill.enable = true;
  }
  clearAuaofill() {
    this.selector.xArr.splice(0, 1, this.autofill.xArr[0]);
    this.selector.xArr.splice(1, 1, this.autofill.xArr[1]);
    this.selector.yArr.splice(0, 1, this.autofill.yArr[0]);
    this.selector.yArr.splice(1, 1, this.autofill.yArr[1]);
    this.autofill.xIndex = this.selector.xArr[1];
    this.autofill.yIndex = this.selector.yArr[1];
    // 填充完数据清空
    this.autofill.xArr = [-1, -1];
    this.autofill.yArr = [-1, -1];
  }
  // 开始编辑
  startEdit() {
    if (this.focusCell && !this.focusCell.readonly) {
      this.editor.show = true;
      // this.selector.show = false;
      this.resetCellPosition()
      this.putCell() // BackSpace／delede删除再直接enter进入编辑模式，不会再次更新编辑器的焦点cell
      this.beforeEditCell();
    }
  }
  // 完成编辑
  doneEdit() {
    if (this.editor.show && this.focusCell) {
      this.editor.show = false;
      this.selector.show = true; // 编辑完再选中该单元格
      if (this.focusCell.value !== this.tempValue) {
        // handle history
        this.history.pushState({
          before: {
            colIndex: this.focusCell.colIndex,
            rowIndex: this.focusCell.rowIndex,
            value: this.focusCell.value
          },
          after: {
            colIndex: this.focusCell.colIndex,
            rowIndex: this.focusCell.rowIndex,
            value: this.tempValue
          },
          type: 'single'
        })
        this.focusCell.setData(this.tempValue)
        const rowData = this.body.getRowData(this.focusCell.rowIndex)
        this.afterEditCell(rowData)
      }
      this.putCell()
      this.clipboard.clear();
    }
  }
  /**
   * 单个写入数据
   * @param {Number} colIndex 需要写入数据的单元格X轴坐标 表格最左上角为<0,0>
   * @param {Number} rowIndex 需要写入数据的单元格Y轴坐标
   * @param {*} value 需要写入的数据: 简单数据类型
   */
  setData(value, { colIndex, rowIndex } = this.focusCell) {
    const focusCell = this.body.getCell(colIndex, rowIndex);
    focusCell && focusCell.setData(value);
    this.focusCellByCoord(colIndex, rowIndex)
  }
  /**
   * 批量写入数据
   * @param {Number} colIndex 需要写入数据的单元格范围起始X轴坐标 表格最左上角为<0,0>
   * @param {Number} rowIndex 需要写入数据的单元格范围起始Y轴坐标
   * @param {Array} value 需要写入的数据: 二维数组[<Array><Array>]
   */
  batchSetData({ colIndex, rowIndex, value }) {
    this.body.batchSetData({ colIndex, rowIndex, value })
    this.focusCellByCoord(
      colIndex, 
      rowIndex, 
      colIndex + value[0].length - 1, 
      rowIndex + value.length - 1
    )
  }
  /**
   * 将用户通过编辑器输入的值存储为一个临时变量，执行doneEdit()后再去setData()
   */
  setTempData(value) {
    this.editor.show = true;
    // this.selector.show = false;
    this.tempValue = value
  }
  pasteData(arr) {
    if (arr.length > 0) {
      this.body.pasteData(arr);
      this.clipboard.select(arr)
    }
  }
  clearSelectedData() {
    this.body.clearSelectedData()
  }
  focusCellByCoord(minX, minY, maxX, maxY) {
    this.selector.xArr = [minX, maxX || minX];
    this.selector.yArr = [minY, maxY || minY];
    this.editor.xIndex = minX;
    this.editor.yIndex = minY;
    this.autofill.xIndex = maxX || minX
    this.autofill.yIndex = maxY || minY
    this.focusCell = this.body.getCell(this.editor.xIndex, this.editor.yIndex);
  }
  /**
   * 调整列宽、行宽
   */
  resizeColumn(colIndex, newWidth) {
    this.header.resizeColumn(colIndex, newWidth);

    this.body.resizeColumn(colIndex, newWidth);

    this.getTableSize();
  }
  resizeRow(rowIndex, height) {
    this.body.resizeRow(rowIndex, height);
    this.getTableSize();
  }
  handleCheckRow(y) {
    this.body.handleCheckRow(y);
  }
  handleCheckHeader() {
    this.body.handleCheckHeader();
  }
  // 键盘上下左右切换
  moveFocus(dir) {
    switch (dir) {
      case "LEFT":
        if (this.editor.xIndex > this.range.minX) {
          this.editor.xIndex--;
        }
        break;
      case "TOP":
        if (this.editor.yIndex > this.range.minY) {
          this.editor.yIndex--;
        }
        break;
      case "RIGHT":
        if (this.editor.xIndex < this.range.maxX) {
          this.editor.xIndex++;
        }
        break;
      case "BOTTOM":
        if (this.editor.yIndex < this.range.maxY) {
          this.editor.yIndex++;
        }
        break;
      default:
      //
    }
    this.adjustBoundaryPosition();
    this.putCell()
  }
  adjustPosition(x, y, mouseX, mouseY) {
    const diffX = mouseX - this.width + SCROLLER_TRACK_SIZE
    const diffY = mouseY - this.height + SCROLLER_TRACK_SIZE
    if (diffX > 0) {
      this.scroller.update(-12, "HORIZONTAL");
    }
    if (diffY > 0) {
      this.scroller.update(-12, "VERTICAL");
    }
  }
  // 调整滚动条位置，让焦点单元格始终出现在可视区域内
  adjustBoundaryPosition() {
    this.resetCellPosition()
    this.focusCell = this.body.getCell(this.editor.xIndex, this.editor.yIndex);
    if (this.focusCell.fixed) return;

    const cellTotalViewWidth =
      this.focusCell.x + this.focusCell.width + this.scrollX;
    const cellTotalViewHeight =
      this.focusCell.y + this.focusCell.height + this.scrollY;
    const viewWidth = this.width - this.fixedRightWidth;
    const viewHeight = this.height - SCROLLER_TRACK_SIZE;
    const diffLeft = this.focusCell.x + this.scrollX - this.fixedLeftWidth;
    const diffRight = viewWidth - cellTotalViewWidth;
    const diffTop = this.focusCell.y + this.scrollY - this.tableHeaderHeight;
    const diffBottom = viewHeight - cellTotalViewHeight;
    // const fillWidth = this.focusCell.colIndex < this.columnsLength - 1 - this.fixedRight ?
    //     this.focusCell.x + this.scrollX - viewWidth
    //     : 0
    if (diffRight < 0) {
      this.scroller.update(diffRight, "HORIZONTAL");
    } else if (diffLeft < 0) {
      this.scroller.update(-diffLeft, "HORIZONTAL");
    }
    if (diffTop < 0) {
      this.scroller.update(-diffTop, "VERTICAL");
    } else if (diffBottom < 0) {
      this.scroller.update(diffBottom, "VERTICAL");
    }
  }
  /**
   * 画布绘制相关------------------------------------------------------->
   */
  initPaint() {
    this.draw();
    window.requestAnimationFrame(this.initPaint.bind(this));
  }
  drawContainer() {
    this.painter.drawRect(0, 0, this.width, this.height, {
      borderColor: this.borderColor,
      fillColor: '#fff',
      borderWidth: this.borderWidth
    });
  }
  draw() {
    this.painter.clearCanvas();

    // 绘制外层容器
    this.drawContainer();

    if (!this.columnsLength) return;

    // body
    this.body.draw();

    // 数据校验错误提示
    this.tooltip.draw();

    // 绘制表头
    this.header.draw();

    // 绘制滚动条
    this.scroller.draw();
  }
  /**
   * 事件相关------------------------------------------------------->
   */
  updateColumns(columns) {
    const maxHeaderRow = getMaxRow(columns)
    // 有复合表头的情况下，高度强制改为24
    if (maxHeaderRow > 1) {
      this.headerHeight = 24
    }
    this.tableHeaderHeight = this.headerHeight * maxHeaderRow
    // 计算复合表头的跨行colspan、跨列数rowspan，用作表头渲染
    this.headers = calCrossSpan(columns, maxHeaderRow)
    // 获取叶子节点表头，用作数据渲染
    this.columns = toLeaf(columns)
    this.columnsLength = this.columns.length;
    this.range.maxX = this.columnsLength - 1;
  }
  loadColumns(columns) {
    this.updateColumns(columns)
    
    this.header.paint()
    this.getTableSize()
  }
  loadData(data) {
    this.data = data;
    this.range.maxY = data.length - 1;
    this.body.paint(data);
    this.initTableSize();
  }
  getData() {
    this.doneEdit()
    return this.body.getData();
  }
  getRowData(y) {
    this.doneEdit()
    return this.body.getRowData(y)
  }
  getCheckedRows() {
    this.doneEdit()
    return this.body.getCheckedRows();
  }
  getChangedRows() {
    this.doneEdit()
    return this.body.getChangedRows();
  }
  validate(callback) {
    this.doneEdit()
    return this.body.validate(callback);
  }
  validateChanged(callback) {
    this.doneEdit()
    return this.body.validateChanged(callback);
  }
  validateField(ci, ri) {
    this.doneEdit()
    return this.body.validateField(ci, ri);
  }
  getValidations() {
    this.doneEdit()
    return this.body.getValidations()
  }
  setValidations(errors) {
    return this.body.setValidations(errors)
  }
  clearValidations() {
    return this.body.clearValidations()
  }
  updateData(data) {
    return this.body.updateData(data)
  }
}
export default DataGrid;
