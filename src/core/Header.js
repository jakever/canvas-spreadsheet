function getLeafColumnsWidth(arr) {
  const _arr = toLeaf(arr)
  const width = _arr.reduce((sum, item) => {
    return sum + SIZE_MAP[item.size || "mini"]
  }, 0)

  return width
}
/**
 * 根据列的索引获取列的宽度
 * @param {Number} index 
 */
function getColWidthByIndex(index) {
  let width
  for (let col of this.allColumnHeaders) {
    if (col.index === index && col.colspan <= 1) {
      width = col.width
      break
    }
  }
  return width
}

import Context from "./Context.js";
import ColumnHeader from "./ColumnHeader.js";
import {
  toLeaf,
} from './util.js'
import {
  ROW_INDEX_WIDTH,
  MIN_CELL_WIDTH,
  CHECK_BOX_WIDTH,
  SIZE_MAP
} from "./constants.js";

const oncheck = new Image();
const offcheck = new Image();
const indeterminate = new Image();
oncheck.src = require("./images/oncheck.png");
offcheck.src = require("./images/offcheck.png");
indeterminate.src = require("./images/indeterminate.png");

class Header extends Context {
  constructor(grid, x, y) {
    super(grid, x, y);
    this.checked = false;
    this.indeterminate = false
    this.paint()
  }
  paint() {
    this.allColumnHeaders = []; // 所有列
    this.fixedColumnHeaders = []; // 冻结列
    this.columnHeaders = []; // 非冻结列

    let columnIndex = 0
    const renderHeader = (arr, parent, originX) => {
      const len = arr.length
      let everyOffsetX = originX
      
      for (let i = 0; i < len; i++) {
        const item = arr[i];
        const height = this.grid.headerHeight * (item.rowspan || 1)
        const y = this.grid.headerHeight * item.level
        let width = SIZE_MAP[item.size || "mini"]; // 读取映射宽度
        let fixed = ''
        
        if (item.children) {
          // 父级表头的宽度是叶子节点表头的宽度总和
          width = getLeafColumnsWidth(item.children)
        }
        if (parent) {
          fixed = parent.fixed
        } else if (i < this.grid.fixedLeft) {
          fixed = "left";
        } else if (i > len - 1 - this.grid.fixedRight) {
          fixed = "right";
        }
        item.fixed = fixed;
        
        const columnHeader = new ColumnHeader(
          this.grid,
          columnIndex,
          everyOffsetX,
          y,
          width,
          height,
          item
        );
  
        this.allColumnHeaders.push(columnHeader);
        if (fixed) {
          this.fixedColumnHeaders.push(columnHeader);
        } else {
          this.columnHeaders.push(columnHeader);
        }
        !item.children && columnIndex ++
        item.children && renderHeader(item.children, item, everyOffsetX)
        
        everyOffsetX += width
      }
    }
    renderHeader(this.grid.headers, null, this.grid.originFixedWidth)
  }
  // 开始调整列宽
  mouseDown(x, y) {
    if (this.resizeTarget) {
      this.resizeOriginalX = x;
      this.resizeOriginalWidth = this.resizeTarget.width;
      this.isResizing = true;
    } else {
      for (let col of this.allColumnHeaders) {
        if (
          x > col.x + this.grid.scrollX &&
          x < col.x + this.grid.scrollX + col.width &&
          y > col.y && y < col.y + col.height
        ) {
          this.grid.selectCols(col)
        }
      }
    }
  }
  // 鼠标移动调整中
  resizing(x, y) {
    if (this.isResizing) {
      const index = this.resizeTarget.index;
      const resizeDiffWidth = x - this.resizeOriginalX;
      const newWidth = this.resizeTarget.width + resizeDiffWidth;
      // 滚动列最后一列或者无横向滚动，不允许调小宽度
      if (
        (index === this.grid.columnsLength - this.grid.fixedRight - 1 ||
          this.grid.width === this.grid.tableWidth + this.grid.verticalScrollerSize ||
          newWidth < MIN_CELL_WIDTH) &&
          newWidth <= this.resizeOriginalWidth
      ) {
        return;
      }
      
      this.grid.resizeColumn(index, resizeDiffWidth);
      this.resizeOriginalX = x
    } else {
      // 鼠标移动中 -> 寻找需要调整列宽的列目标
      this.resizeTarget = null;
      for (let col of this.allColumnHeaders) {
        if (
          x > col.x + this.grid.scrollX + col.width - 4 &&
          x < col.x + this.grid.scrollX + col.width + 4 &&
          x < this.grid.width - this.grid.verticalScrollerSize - 4 && // 视窗中最后一列不允许调整宽
          col.colspan <= 1 // 父级表头不触发
        ) {
          this.grid.target.style.cursor = "col-resize";
          this.resizeTarget = col;
        }
      }
    }
  }
  // 结束调整列宽
  endResize() {
    this.resizeTarget = null;
    this.isResizing = false;
  }
  handleCheck(opt) {
    if (opt) {
      this.checked = typeof opt.checked === 'boolean' ? opt.checked : this.checked
      this.indeterminate = typeof opt.indeterminate === 'boolean' ? opt.indeterminate : this.indeterminate
    } else {
      if (this.indeterminate) {
        this.indeterminate = false
      } else {
        this.checked = !this.checked
      }
    }
    
  }
  resizeColumn(colIndex, diffWidth) {
    const scrollDiffWidth =
      this.grid.width -
      this.grid.tableWidth -
      this.grid.verticalScrollerSize -
      this.grid.scrollX;

    for (let col of this.allColumnHeaders) {
      // 避免操作过快是出现断层
      if (scrollDiffWidth <= diffWidth) {
        /**
         * 由于存在复合表头的场景，复合表头的index和其子级表头的第一个列的index是相等的，
         * 更新子表头的宽度时同时也要更新其所有的父表头，所以这里就不能直接取数组的下标，
         * 而是用表头的index字段
         */
        if (colIndex >= col.index && colIndex < col.index + col.colspan) {
          col.width += diffWidth;
        }

        // 该列之后的所有列的x轴位移需要更新
        if (col.index > colIndex && !(scrollDiffWidth === 0 && diffWidth <= 0)) {
          col.x += diffWidth;
        }
      }

      // 滚动到最右侧，调小列宽时只更新目标列宽和相邻下一列的x轴坐标
      if (scrollDiffWidth === 0 && diffWidth <= 0) {
        if (colIndex >= col.index && colIndex < col.index + col.colspan) {
          col.width += diffWidth;
        }
        if (col.index === colIndex + 1) {
          col.width -= diffWidth;
          col.x += diffWidth;
        }
      }
    }
  }
  resizeAllColumn(fellWidth) {
    let parent = { x: this.grid.originFixedWidth, width: 0, level: 0 }
    for (let col of this.allColumnHeaders) {
      col.width += fellWidth * col.colspan;
      if (col.level && col.level !== parent.level) {
        col.x = parent.x;
      } else {
        col.x = parent.x + parent.width;
      }
      parent = col
    }
  }
  draw() {
    // 滚动列阴影
    this.grid.painter.drawRect(this.x, this.y, this.grid.width, this.grid.tableHeaderHeight, {
      fillColor: "#f9f9f9",
      shadowBlur: 6,
      shadowColor: "rgba(28,36,56,0.2)",
      shadowOffsetX: 0,
      shadowOffsetY: 2
    });

    // 滚动表头
    for (let col of this.columnHeaders) {
      if (col.isVisibleOnScreen()) {
        col.draw();
      }
    }

    // 固定列阴影
    if (this.grid.scrollX !== 0) {
      this.grid.painter.drawRect(
        this.x,
        this.y,
        this.grid.fixedLeftWidth,
        this.grid.tableHeaderHeight,
        {
          fillColor: "#f9f9f9",
          shadowBlur: 6,
          shadowColor: "rgba(28,36,56,0.2)",
          shadowOffsetX: 2,
          shadowOffsetY: -2
        }
      );
    }
    if (
      this.grid.tableWidth +
        this.grid.verticalScrollerSize -
        this.grid.width +
        this.grid.scrollX >
      0
    ) {
      this.grid.painter.drawRect(
        this.grid.width - this.grid.fixedRightWidth,
        this.y,
        this.grid.fixedRightWidth - this.grid.verticalScrollerSize,
        this.grid.tableHeaderHeight,
        {
          fillColor: "#f9f9f9",
          shadowBlur: 6,
          shadowColor: "rgba(0,0,0,0.2)",
          shadowOffsetX: -2,
          shadowOffsetY: -2
        }
      );
    }

    // 冻结表头
    for (let col of this.fixedColumnHeaders) {
      col.draw();
    }

    // 绘制checkbox
    const style = {
      borderColor: this.grid.borderColor,
      borderWidth: this.grid.borderWidth,
      fillColor: this.grid.fillColor
    };
    if (this.grid.showCheckbox) {
      const checkEl = this.checked ? 
        (this.indeterminate ? indeterminate : oncheck) 
        : offcheck;
      this.grid.painter.drawRect(
        ROW_INDEX_WIDTH,
        0,
        CHECK_BOX_WIDTH,
        this.grid.tableHeaderHeight,
        style
      );
      this.grid.painter.drawImage(
        checkEl,
        ROW_INDEX_WIDTH + (CHECK_BOX_WIDTH - 20) / 2,
        (this.grid.tableHeaderHeight - 20) / 2,
        20,
        20
      );
    }

    // 最左上角方格
    this.grid.painter.drawRect(0, 0, ROW_INDEX_WIDTH, this.grid.tableHeaderHeight, style);
  }
}
export default Header;
