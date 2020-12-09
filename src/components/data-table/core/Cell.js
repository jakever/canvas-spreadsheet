import Context from "./Context.js";
import { ROW_FOCUS_COLOR } from './constants'
const dateIcon = new Image();
const timeIcon = new Image();
dateIcon.src = require("./images/date.png");
timeIcon.src = require("./images/time.png");

class Cell extends Context {
  constructor(
    value,
    grid,
    colIndex,
    rowIndex,
    x,
    y,
    width,
    height,
    column,
    rowData,
    options
  ) {
    super(grid, x, y, width, height, column.fixed);
    this.colIndex = colIndex;
    this.rowIndex = rowIndex;
    this.rowData = rowData

    this.property = column.property;
    this.fixed = column.fixed;
    this.type = column.business_type
    this.textAlign = column.align || "left";
    this.textBaseline = column.baseline || "middle";
    this.format = column.format

    this.value = value ?? '';

    this.message = null;
    this.hoverColor = '';

    Object.assign(this, options);
    this.setLabel(this.value);
    this.initButtons(column)

    if (this.type === 'avatar' && this.value) {
      this.avatarImg = new Image();
      this.avatarImg.crossOrigin = 'anonymous';
      this.avatarImg.src = this.value
    }
  }
  setLabel(val) {
    let label = val;
    if (typeof this.format === "function") {
      label = this.format(val);
    }
    this.label = label === null || label === undefined ? "" : label;
  }
  // 初始化按钮配置
  initButtons(column) {
    if (this.type === 'action') {
      let textWidth = 0
      if (column.links.length) {
        textWidth = this.grid.painter.ctx.measureText(column.links[0].label).width
      }
      let x = textWidth / 2 + 10 // 10:距离左边框的padding值
      let realX = 10
      this.links = column.links.map(item => {
        const textW = this.grid.painter.ctx.measureText(item.label).width
        const config = {
          ...item,
          x,
          realX,
          y: this.height / 2,
          width: textW,
          height: 12
        }
        x += 16 + textW // 16 相邻按钮之间的间距
        realX += 16 + textW
        return config
      })
      
      if (column.dropdown.length) {
        const _x = this.links.reduce((total, item) => {
          return total + this.grid.painter.ctx.measureText(item.label).width + 16
        }, 10)
        this.dropdown = {
          ...column.dropdown,
          x: _x,
          y: this.height / 2,
          width: 20,
          height: 4
        }
      }
    } else if (this.type === 'link') {
      const textW = this.grid.painter.ctx.measureText(this.label).width
      const x = textW / 2 + 10 // 10:距离左边框的padding值
      const realX = 10
      this.links = [{
        x,
        realX,
        y: this.height / 2,
        width: textW >= this.width - 10 ? this.width - 10 : textW + 6, // bold style影响mesureText值，适当增加
        height: 12,
        label: this.label,
        ...column.links
      }]
    }
    
  }
  // 获取鼠标点击所在位置对应的按钮
  getLinkAtCoord(mouseX, mouseY) {
    const x =
      this.fixed === "right"
        ? this.grid.width -
          (this.grid.tableWidth - this.x - this.width) -
          this.width -
          this.grid.verticalScrollerSize
        : this.fixed === "left"
        ? this.x
        : this.x + this.grid.scrollX;
    let button = null
    for (const link of this.links) {
      if (mouseX >= x + link.realX && 
          mouseX <= x + link.realX + link.width &&
          mouseY >= this.y + this.grid.scrollY + link.y - link.height / 2 &&
          mouseY <= this.y + this.grid.scrollY + link.y - link.height / 2 + link.height &&
          this.y + this.grid.scrollY + link.y - link.height / 2 + link.height < this.grid.height - this.grid.horizontalScrollerSize
        ) {
          button = Object.assign({}, link);
          break;
      }
    }
    return button
  }
  draw() {
    const {
      painter,
      width,
      tableWidth,
      verticalScrollerSize,
      scrollX,
      scrollY,
      color,
      border,
      divider,
      borderColor,
      borderWidth,
      dividerColor,
      fillColor,
      colorPromary
    } = this.grid;
    const x =
      this.fixed === "right"
        ? width -
          (tableWidth - this.x - this.width) -
          this.width -
          verticalScrollerSize
        : this.fixed === "left"
        ? this.x
        : this.x + scrollX;
    const y = this.y + scrollY;

    /**
     * 绘制单元格边框
     */
    painter.ctx.save()
    painter.drawRect(x, y, this.width, this.height, {
      fillColor: this.grid.focusRowIndex === this.rowIndex ? ROW_FOCUS_COLOR : fillColor,
      borderColor: border ? borderColor : undefined,
      borderWidth
    });
    painter.ctx.clip()
    
    divider && painter.drawTBBorder(x, y, this.width, this.height, {
      borderColor: dividerColor,
      borderWidth
    })

    /**
     * 绘制单元格内容
     */
    if (this.type === 'avatar' && this.value) { // 头像
      const imgSize = 24
      // let avatarImg = new Image();
      // avatarImg.src = this.value
      this.avatarImg.onload = () => {
        painter.drawAvatar(
          this.avatarImg,
          x + (this.width - imgSize) / 2,
          y + (this.height - imgSize) / 2,
          imgSize,
          imgSize
        );
      }
      painter.ctx.restore()
    } else if (this.type === 'action' || this.type === 'link') { // 按钮事件
      const style = {
        color: colorPromary,
        align: this.textAlign,
        baseLine: this.textBaseline
      }
      if (this.type === 'link') {
        style.color = this.hoverColor || color
        style.fontFamily = "bold";
        this.links.length && this.links.forEach((item) => {
          painter.drawCellText(item.label, x, y, this.width, this.height, 10, style);
          // painter.drawText(item.label, x + item.x, y + item.y, style)
        })
      } else {
        this.links.length && this.links.forEach((item) => {
          painter.drawText(item.label, x + item.x, y + item.y, style)
        })
      }
      if (this.dropdown) {
        let _x = this.dropdown.x
        Array.from({length: 3}).forEach(() => {
          painter.drawCircle(x + _x, y + this.dropdown.y, 2)
          _x += 8
        })
      }
    } else { // 文本
      painter.drawCellText(this.label, x, y, this.width, this.height, 10, {
        color: this.format?.color || color,
        fontSize: this.format?.fontSize || "12px",
        fontFamily: this.format?.fontFamily || "normal",
        align: this.textAlign,
        baseLine: this.textBaseline
      });
    }
  }
}

export default Cell;
