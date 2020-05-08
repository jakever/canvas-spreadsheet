import Context from "./Context.js";
import ColumnHeader from "./ColumnHeader.js";
import {
  HEADER_HEIGHT,
  ROW_INDEX_WIDTH,
  CHECK_BOX_WIDTH,
  SIZE_MAP
} from "./constants.js";

const oncheck = new Image();
const offcheck = new Image();
oncheck.src = require("./images/oncheck.png");
offcheck.src = require("./images/offcheck.png");

class Header extends Context {
  constructor(grid, x, y) {
    super(grid, x, y, null, HEADER_HEIGHT);

    this.checked = false;

    this.allColumnHeaders = [];
    this.fixedColumnHeaders = [];
    this.columnHeaders = [];

    const len = this.grid.columnsLength;
    let everyOffsetX = this.grid.originFixedWidth;

    for (let i = 0; i < len; i++) {
      const column = this.grid.columns[i];
      const style = {
        color: this.grid.color,
        fillColor: this.grid.fillColor,
        borderColor: this.grid.borderColor,
        borderWidth: this.grid.borderWidth
      };
      column.width = SIZE_MAP[column.size || "mini"]; // 读取映射宽度

      if (i < grid.fixedLeft) {
        column.fixed = "left";
      } else if (i > len - 1 - grid.fixedRight) {
        column.fixed = "right";
      }
      const columnHeader = new ColumnHeader(
        grid,
        i,
        everyOffsetX,
        y,
        column,
        style
      );

      this.allColumnHeaders.push(columnHeader);
      if (column.fixed) {
        this.fixedColumnHeaders.push(columnHeader);
      } else {
        this.columnHeaders.push(columnHeader);
      }

      everyOffsetX += column.width;
    }
  }
  mouseDown(x, y) {
    if (this.resizeTarget) {
      this.resizeOriginalX = x;
      this.resizeOriginalWidth = this.resizeTarget.width;
      this.isResizing = true;
    }
  }
  mouseMove(x, y) {
    if (this.isResizing) {
      const index = this.resizeTarget.index;
      const resizeDiffWidth = x - this.resizeOriginalX;
      const oldWidth = this.allColumnHeaders[index].width;
      const newWidth = this.resizeOriginalWidth + resizeDiffWidth;
      // 滚动列最后一列不允许调小宽度
      if (
        (index === this.grid.columnsLength - this.grid.fixedRight - 1 ||
          this.grid.width ===
            this.grid.tableWidth + this.grid.verticalScrollerSize) &&
        newWidth <= oldWidth
      ) {
        return;
      }
      this.grid.resizeColumn(index, newWidth);
    } else {
      // 鼠标移动中 -> 寻找需要调整列宽的列目标
      for (let i = 0; i < this.grid.columnsLength; i++) {
        let columnHeader = this.allColumnHeaders[i];

        if (
          x > columnHeader.x + this.grid.scrollX + columnHeader.width - 4 &&
          x < columnHeader.x + this.grid.scrollX + columnHeader.width + 4
        ) {
          this.grid.target.style.cursor = "col-resize";
          this.resizeTarget = columnHeader;
        }
      }
    }
  }
  mouseUp() {
    this.resizeTarget = null;
    this.isResizing = false;
  }
  click() {
    this.checked = !this.checked;
  }
  resizeColumn(colIndex, width) {
    const scrollRightBoundry =
      this.grid.width -
        this.grid.tableWidth -
        this.grid.verticalScrollerSize ===
      this.grid.scrollX;
    const columnHeader = this.allColumnHeaders[colIndex];
    const oldWidth = columnHeader.width;
    columnHeader.width = width;
    if (scrollRightBoundry && width < oldWidth) {
      this.allColumnHeaders[colIndex + 1].width += oldWidth - width;
      this.allColumnHeaders[colIndex + 1].x += width - oldWidth;
    } else {
      // 该列之后的所有列的x轴位移需要更新
      for (let i = colIndex + 1; i < this.grid.columnsLength; i++) {
        this.allColumnHeaders[i].x += width - oldWidth;
      }
    }
  }
  resizeAllColumn(width) {
    let everyOffsetX = this.grid.originFixedWidth;
    for (let i = 0; i < this.allColumnHeaders.length; i++) {
      const columnHeader = this.allColumnHeaders[i];
      columnHeader.width += width;
      columnHeader.x = everyOffsetX;
      everyOffsetX += columnHeader.width;
    }
  }
  draw() {
    // if (this.grid.scrollY !== 0) {
    this.grid.painter.drawRect(this.x, this.y, this.grid.width, this.height, {
      fillColor: "#f9f9f9",
      shadowBlur: 6,
      shadowColor: "rgba(28,36,56,0.2)",
      shadowOffsetX: 0,
      shadowOffsetY: 2
    });
    // }

    // 滚动表头
    for (let i = 0; i < this.columnHeaders.length; i++) {
      const columnHeader = this.columnHeaders[i];
      if (columnHeader.isVisibleOnScreen()) {
        columnHeader.draw();
      }
    }

    // 固定列阴影
    if (this.grid.scrollX !== 0) {
      this.grid.painter.drawRect(
        this.x,
        this.y,
        this.grid.fixedLeftWidth,
        this.height,
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
        this.grid.fixedRightWidth,
        this.height,
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
    for (let i = 0; i < this.fixedColumnHeaders.length; i++) {
      const columnHeader = this.fixedColumnHeaders[i];
      columnHeader.draw();
    }

    // 绘制checkbox
    const style = {
      borderColor: this.grid.borderColor,
      borderWidth: this.grid.borderWidth,
      fillColor: this.grid.fillColor
    };
    if (this.grid.showCheckbox) {
      const checkEl = this.checked ? oncheck : offcheck;
      this.grid.painter.drawRect(
        ROW_INDEX_WIDTH,
        0,
        CHECK_BOX_WIDTH,
        HEADER_HEIGHT,
        style
      );
      this.grid.painter.drawImage(
        checkEl,
        ROW_INDEX_WIDTH + (CHECK_BOX_WIDTH - 20) / 2,
        (HEADER_HEIGHT - 20) / 2,
        20,
        20
      );
    }

    // 最左上角方格
    this.grid.painter.drawRect(0, 0, ROW_INDEX_WIDTH, HEADER_HEIGHT, style);
  }
}
export default Header;
