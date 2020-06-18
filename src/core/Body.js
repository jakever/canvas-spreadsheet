import { CELL_HEIGHT, HEADER_HEIGHT } from "./constants.js";
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
    let everyOffsetY = HEADER_HEIGHT;
    for (let i = 0; i < len; i++) {
      const rowData = data[i];

      let rowHeight = CELL_HEIGHT;
      // 暂时注释text wrapping功能
      // let textWrap = null
      // for(let j = 0; j < this.columns.length; j++) {
      //     const column = this.columns[j]
      //     const value = rowData[column.key]
      //     if (value || value === 0) {
      //         textWrap = this.painter.getTextWrapping(value, column.width)
      //         let textWrapCount = 0
      //         if (textWrap) {
      //             textWrapCount = textWrap.length
      //         }
      //         if (textWrapCount > 1) {
      //             if (rowHeight < CELL_HEIGHT + ((textWrapCount - 1) * 18)) {
      //                 rowHeight = CELL_HEIGHT + ((textWrapCount - 1) * 18)
      //             }
      //         }
      //     }
      // }

      this.rows.push(
        new Row(this.grid, i, 0, everyOffsetY, rowHeight, rowData)
      );
      everyOffsetY += rowHeight;
    }

    this.height = this.rows.reduce((sum, item) => {
      return sum + item.height;
    }, CELL_HEIGHT);
  }
  updateData(data) {
    const { editor } = this.grid;
    for (let ri = 0; ri <= data.length - 1; ri++) {
      const len = data[ri].length;
      for (let ci = 0; ci <= len - 1; ci++) {
        const cells = this.rows[ri + editor.yIndex].allCells;
        const cell = cells[ci + editor.xIndex];
        cell.setData(data[ri][ci]);
      }
    }
  }
  autofillData() {
    const { value } = this.getSelectedData();
    const xStep = value[0].length;
    const yStep = value.length;
    const { xArr, yArr } = this.grid.autofill;

    if (yArr[1] < 0 || xArr[1] < 0) return;

    for (let ri = 0; ri <= yArr[1] - yArr[0]; ri++) {
      for (let ci = 0; ci <= xArr[1] - xArr[0]; ci++) {
        const colIndex = ci + xArr[0];
        const rowIndex = ri + yArr[0];
        const val = value[ri % yStep][ci % xStep];
        const cell = this.rows[rowIndex].allCells[colIndex];
        cell.setData(val);
      }
    }
    this.grid.clearAuaofill();
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
  handleCheckRow(y) {
    if (typeof y === "number") {
      this.rows[y].handleCheck();
    } else {
      for (let row of this.rows) {
        row.handleCheck();
      }
    }
  }
  mouseMove(x, y) {
    for (let i = 0; i < this.rows.length; i++) {
      if (this.rows[i].isInVerticalAutofill(x, y)) {
        this.rows[i].handleAutofill(x, y);
      } else if (this.rows[i].isInsideVerticaBodyBoundary(x, y)) {
        this.rows[i].mouseMove(x, y);
      }
    }
  }
  mouseDown(x, y) {
    for (let i = 0; i < this.rows.length; i++) {
      if (this.rows[i].isInVerticalAutofill(x, y)) {
        this.rows[i].handleStartAutofill(x, y);
      } else if (this.rows[i].isInsideVerticaBodyBoundary(x, y)) {
        this.rows[i].mouseDown(x, y);
      }
    }
  }
  click(x, y) {
    for (let i = 0; i < this.rows.length; i++) {
      if (this.rows[i].isInsideVerticaBodyBoundary(x, y)) {
        this.rows[i].click(x, y);
      }
    }
  }
  dbClick(x, y) {
    for (let i = 0; i < this.rows.length; i++) {
      if (this.rows[i].isInsideVerticaBodyBoundary(x, y)) {
        this.rows[i].dbClick(x, y);
      }
    }
  }
  rePaintRow(rowIndex) {
    // 计算该行中所有单元格内容所需要的最大高度
    // const rowData = this.data[rowIndex]
    const row = this.getRow(rowIndex);
    const len = row.cells.length;
    let textWrap = null;
    let rowHeight = CELL_HEIGHT;
    for (let i = 0; i < len; i++) {
      const { value, width } = row.cells[i];
      if (value || value === 0) {
        textWrap = this.grid.painter.getTextWrapping(value, width);
        let textWrapCount = 0;
        if (textWrap) {
          textWrapCount = textWrap.length;
        }
        if (textWrapCount > 1) {
          if (CELL_HEIGHT + (textWrapCount - 1) * 18 > rowHeight) {
            rowHeight = CELL_HEIGHT + (textWrapCount - 1) * 18;
          }
        }
      }
    }

    row.height = rowHeight;

    let everyOffsetY = HEADER_HEIGHT;
    for (let j = 0; j < this.rows.length; j++) {
      const row = this.rows[j];
      row.y = everyOffsetY;
      everyOffsetY += row.height;
      row.rePaint();
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
  getRow(y) {
    return this.rows[y];
  }
  // 根据坐标获取cell对象
  getCell(x, y) {
    const row = this.rows[y];
    return row.allCells[x];
  }
  getSelectedData() {
    const { xArr, yArr } = this.grid.selector;
    const rowsData = [];
    let text = "";
    for (let ri = 0; ri <= yArr[1] - yArr[0]; ri++) {
      const cellsData = [];
      for (let ci = 0; ci <= xArr[1] - xArr[0]; ci++) {
        cellsData.push(this.rows[ri + yArr[0]].allCells[ci + xArr[0]].value);
      }
      text += cellsData.join("\t") + "\r";
      rowsData.push(cellsData);
    }
    text = text ? text.replace(/\r$/, "") : " "; // 去掉最后一个\n，否则会导致复制到excel里多一行空白
    if (!text) {
      text = " "; // 替换为' '，是为了防止复制空的内容导致document.execCommand命令无效
    }
    return {
      text,
      value: rowsData
    };
  }
  getData() {
    return this.rows.map(row => {
      const cells = row.allCells;
      let _o = {};
      cells.forEach(cell => {
        _o[cell.key] = cell.value;
      });
      _o = Object.assign({}, row.data, _o)
      return _o;
    });
  }
  getCheckedRows() {
    return this.rows
      .filter(item => item.checked)
      .map(row => {
        const cells = row.allCells;
        let _o = {};
        cells.forEach(cell => {
          _o[cell.key] = cell.value;
        });
        _o = Object.assign({}, row.data, _o)
        return _o;
      });
  }
  getChangedRows() {
    let arr = new Set();
    let rows = [];
    Object.keys(this.grid.hashChange).forEach(key => {
      arr.add(Number(key.split("-")[1]));
    });
    Array.from(arr).sort().forEach(item => {
      rows.push(this.rows[item]);
    });
    return rows.map(row => {
      const cells = row.allCells;
      let _o = {};
      cells.forEach(cell => {
        _o[cell.key] = cell.value;
      });
      _o = Object.assign({}, row.data, _o)
      return _o;
    });
  }
  validateFields(fields) {
    if (fields && Array.isArray(fields)) { // 校验指定数据单元格
      fields.forEach(item => {
        this.rows.forEach(row => {
          if (row.data[this.grid.rowKey] === item[this.grid.rowKey]) {
            const cells = row.allCells;
            cells.forEach(cell => {
              if (item.fields.includes(cell.key)) {
                cell.validate()
              }
            });
          }
        });
      })
    } else { // 校验全部
      this.rows.forEach(row => {
        const cells = row.allCells;
        cells.forEach(cell => {
          cell.validate()
        });
      })
    }
  }
  getValidations() {
    const validFaildRows = []
    this.rows.forEach(row => {
      const validFaildCells = []
      const cells = row.allCells;
      cells.forEach(cell => {
        !cell.valid && validFaildCells.push({
          title: cell.title,
          key: cell.key,
          value: cell.value,
          message: cell.message
        })
      });
      validFaildCells.length && validFaildRows.push(validFaildCells)
    })
    return validFaildRows
  }
  setValidations(errors) {
    if (errors && Array.isArray(errors)) {
      errors.forEach(item => {
        this.rows.forEach(row => {
          if (row.data[this.grid.rowKey] === item[this.grid.rowKey]) {
            const cells = row.allCells;
            cells.forEach(cell => {
              const valid = !item[cell.key]
              if (item.hasOwnProperty(cell.key)) {
                cell.resetValidate(valid, item[cell.key])
              }
            });
          }
        });
      })
    }
  }
  clearValidations() {
    this.rows.forEach(row => {
      const cells = row.allCells;
      cells.forEach(cell => {
        cell.resetValidate()
      });
    })
  }
  getRowData(y) {
    const row = this.getRow(y);
    let _o = {};
    row.allCells.forEach(cell => {
      _o[cell.key] = cell.value;
    });
    return Object.assign({}, row.data, _o)
  }
  getCellData(x, y) {
    
  }
  updateRowData(rowIndex) {}
  updateCellData(colIndex) {}
}

export default Body;
