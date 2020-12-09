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
    this.checkedIds = []
    this.checkedData = []

    this.checkboxWidth = CHECK_BOX_WIDTH;
    this.horizontalScrollerSize = SCROLLER_TRACK_SIZE;
    this.verticalScrollerSize = SCROLLER_TRACK_SIZE;

    // 生成主画笔
    this.painter = new Paint(target);

    this.initConfig(options);

    // Headers 表头对象
    this.header = new Header(this, 0, 0);

    // Body 主体
    this.body = new Body(this, this.data);

    // 滚动条
    this.scroller = new Scroller(this);

    this.setLayoutSize(); // 设置容器宽高

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
        colorPromary: "#0bb27a",
        hoverColor: "",
        borderColor: "#e1e6eb",
        dividerColor: "#f0f2f4",
        fillColor: "#fff",
        borderWidth: 1,
        fixedLeft: 0,
        fixedRight: 0,
        showCheckbox: true,
        headerHeight: HEADER_HEIGHT,
        beforeCheckRow: () => {},
        afterCheckRow: () => {},
        beforeRenderRow: () => {},
        showDropdown: () => {},
        showPoptip: () => {},
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
  setLayoutSize() {
    const el = this.target.parentElement;
    const rootEl = el.parentElement;
    const wHeight = window.innerHeight // 视窗高度
    const { width, left, top } = rootEl.getBoundingClientRect();
    this.containerOriginX = left;
    this.containerOriginY = top;
    this.width = this.gridWidth || width; // 容器宽
    this.height = this.gridHeight || wHeight - top; // 容器高
    
    let realH = 484 + this.horizontalScrollerSize
    if (this.showSummary) {
        const footerHeight = 44
        realH += footerHeight // 兼容有合计行时只有10条数据会出现横向滚动条
    }
    if (this.data.length <= 10) {
      this.height = realH
    } else {
      const marginBottom = 24 // 24为table和翻页组件的上下间距
      const paginationHeight = 32 // 分页器高度
      this.height = Math.max(wHeight - top - marginBottom - paginationHeight - this.footerPadding, realH)
    }

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
    let fixedRightWidth = this.verticalScrollerSize;
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
    if (this.tableWidth <= this.width - this.verticalScrollerSize) { // 没有横向滚动条
      const fillCellWidth =
        (this.width - this.verticalScrollerSize - this.tableWidth) /
        this.columnsLength;
      fillCellWidth && this.body.resizeAllColumn(fillCellWidth);
      fillCellWidth && this.header.resizeAllColumn(fillCellWidth);
      this.tableWidth = this.width - this.verticalScrollerSize;
      this.fixedLeftWidth = 0;
      this.fixedRightWidth = this.verticalScrollerSize;
    }
    
    this.scroller.reset();
  }
  resize() {
    const diffX = this.tableWidth - this.width + this.scrollX;

    this.setLayoutSize();
    this.fillTableWidth();

    if (
      this.tableWidth - (this.width - this.verticalScrollerSize) + this.scrollX <
      0
    ) {
      // 小屏滚动到最右侧再调大屏幕断开的问题
      this.scrollX = this.width - this.tableWidth + diffX;
    }
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
  // handleCheckRow(y) {
  //   this.body.handleCheckRow(y);
  // }
  // handleCheckHeader() {
  //   this.body.handleCheckHeader();
  // }
  handleSelectChange(rows, value) {
    if (value) {
      this.checkedData = this.checkedData.concat(rows.filter(row => !this.checkedData.includes(row[this.rowKey])))
    } else {
      const ids = rows.map(item => item[this.rowKey])
      // 删除元素
      this.checkedData = this.checkedData.filter(row => !ids.includes(row[this.rowKey]))
    }
    this.checkedIds = this.checkedData.map(item => item[this.rowKey])

    this.afterCheckRow(this.checkedData)
  }
  handleSelectAll() {
    this.handleSelectChange(this.data, this.header.checked)
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
      // borderColor: this.borderColor,
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
  updateSetting(options) {
    Object.assign(this, options)
  }
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
}
export default DataGrid;
