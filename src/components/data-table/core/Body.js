import { CELL_HEIGHT } from "./constants.js";
import Row from "./Row.js";

class Body {
  constructor(grid, data) {
    this.grid = grid;

    this.paint(data);
  }
  paint(data) {
    this.data = data;
    this.rows = [];
    const len = data.length;
    let everyOffsetY = this.grid.tableHeaderHeight;
    for (let i = 0; i < len; i++) {
      const rowData = data[i];
      
      this.rows.push(
        new Row(this.grid, i, 0, everyOffsetY, CELL_HEIGHT, rowData)
      );
      everyOffsetY += CELL_HEIGHT;
    }

    this.height = this.rows.reduce((sum, item) => {
      return sum + item.height;
    }, this.grid.tableHeaderHeight);
    data.length > 0 && this.grid.onLoad()
  }
  resizeColumn(colIndex, width) {
    for (let i = 0; i < this.rows.length; i++) {
      this.rows[i].resizeColumn(colIndex, width);
    }
  }
  resizeAllColumn(width) {
    for (let row of this.rows) {
      let everyOffsetX = this.grid.originFixedWidth;
      for (let i = 0; i < row.allCells.length; i++) {
        const cell = row.allCells[i];
        cell.width += width;
        cell.x = everyOffsetX;
        everyOffsetX += cell.width;
      }
    }
  }
  resizeRow(rowIndex, height) {
    if (height < MIN_CELL_HEIGHT) return;

    for (let i = 0; i < this.rows.length; i++) {
      this.rows[i].resizeRow(rowIndex, height);
    }
  }
  // 表头勾选发生改变，body勾选需要改变
  // handleCheckRow(y) {
  //   if (typeof y === "number") {
  //     this.rows[y].handleCheck();
  //   } else {
  //     const isChecked = this.grid.header.checked
  //     for (let row of this.rows) {
  //       row.handleCheck(isChecked);
  //     }
  //   }
  // }
  // body勾选发生改变，表头勾选需要改变
  // handleCheckHeader() {
  //   const totalChecked = this.rows.reduce((sum, item) => {
  //     const num = +item.checked
  //     return sum + num
  //   }, 0)
  //   const checked = !!totalChecked
  //   const indeterminate = totalChecked && totalChecked < this.grid.data.length
  //   this.grid.header.handleCheck({ checked, indeterminate })
  // }
  mouseMove(x, y) {
    for (let i = 0; i < this.rows.length; i++) {
      this.rows[i].handleBlur();
      if (this.rows[i].isInsideVerticaTableBoundary(x, y)) {
        this.rows[i].mouseMove(x, y);
      }
    }
  }
  click(x, y) {
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i]
      if (row.isInsideVerticaBodyBoundary(x, y)) {
        row.click(x, y);
        break;
      }
    }
  }
  draw() {
    const len = this.data.length;
    for (let i = 0; i < len; i++) {
      const row = this.rows[i];

      if (row.isVerticalVisibleOnBody()) {
        row.draw();
      }
    }
  }
  getCheckedRows() {
    return this.rows
      .filter(item => item.checked)
      .map(row => {
        const cells = row.allCells;
        let _o = {};
        cells.forEach(cell => {
          _o[cell.property] = cell.value;
        });
        _o = Object.assign({}, row.data, _o)
        return _o;
      });
  }
  getRow(y) {
    return this.rows[y];
  }
  getRowData(y) {
    const row = this.getRow(y);
    let _o = {};
    row.allCells.forEach(cell => {
      _o[cell.key] = cell.value;
      if (cell.labelKey) {
        _o[cell.labelKey] = cell.label;
      }
    });
    return Object.assign({}, row.data, _o)
  }
  getCellData(x, y) {
    const cell = this.getCell(x, y)
    return {
      title: cell.title,
      key: cell.key,
      value: cell.value
    }
  }
}

export default Body;
