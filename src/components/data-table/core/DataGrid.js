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
    this.focusRowIndex = -1

    this.checkboxWidth = CHECK_BOX_WIDTH;
    this.horizontalScrollerSize = SCROLLER_TRACK_SIZE;
    this.verticalScrollerSize = SCROLLER_TRACK_SIZE;

    // 生成主画笔
    this.painter = new Paint(target);

    this.initConfig(options);

    // this.createContainer()

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
        beforeRenderRow: () => {},
        showDropdown: () => {},
        onLoad: () => {} // 表格加载完成
      },
      options
    );

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
  }
  loadColumns(columns) {
    this.updateColumns(columns)
    
    this.header.paint()
    this.getTableSize()
  }
  loadData(data) {
    this.data = data;
    this.body.paint(data);
    this.initTableSize();
  }
  getCheckedRows() {
    return this.body.getCheckedRows();
  }
  handScopeSlots(data) {
    this.beforeRenderRow(data)
  }
  showMore(cell) {
    this.showDropdown(cell)
  }
}
export default DataGrid;
