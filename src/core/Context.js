import { ROW_INDEX_WIDTH } from "./constants.js";

class Context {
  constructor(grid, x, y, width, height, fixed) {
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fixed = fixed;
  }
  isHorizontalVisibleOnBody() {
    return !(
      this.x + this.width - this.grid.fixedLeftWidth + this.grid.scrollX <= 0 ||
      this.x + this.grid.scrollX >= this.grid.width - this.grid.fixedRightWidth
    );
  }
  isVerticalVisibleOnBody() {
    return !(
      this.y + this.height - this.grid.tableHeaderHeight + this.grid.scrollY <= 0 ||
      this.y + this.grid.scrollY >=
        this.grid.height - this.grid.horizontalScrollerSize
    );
  }
  // 鼠标坐标是否在body内
  isInsideHorizontalBodyBoundary(mouseX, mouseY) {
    return (
      mouseX > this.x + this.grid.scrollX &&
      mouseX < this.x + this.grid.scrollX + this.width &&
      mouseX > this.grid.fixedLeftWidth && // 避免冻结列点击穿透了
      mouseX < this.grid.width - this.grid.fixedRightWidth
    ); // 避免冻结列点击穿透了
  }
  isInsideHorizontalTableBoundary(mouseX, mouseY) {
    return (
      mouseX > this.x + this.grid.scrollX &&
      mouseX < this.x + this.grid.scrollX + this.width &&
      mouseX > this.grid.fixedLeftWidth
    );
  }
  isInsideFixedHorizontalBodyBoundary(mouseX, mouseY) {
    const x =
      this.grid.width -
      (this.grid.tableWidth - this.x - this.width) -
      this.width -
      this.grid.verticalScrollerSize;
    return (
      (mouseX >= x && mouseX < x + this.width && this.fixed === "right") ||
      (mouseX > this.x && mouseX < this.x + this.width && this.fixed === "left")
    );
  }
  isInsideVerticaBodyBoundary(mouseX, mouseY) {
    return (
      mouseY > this.y + this.grid.scrollY &&
      mouseY < this.y + this.height + this.grid.scrollY &&
      mouseY > this.grid.tableHeaderHeight &&
      mouseY < this.grid.height - this.grid.horizontalScrollerSize
    );
  }
  isInsideVerticaTableBoundary(mouseX, mouseY) {
    return (
      mouseY > this.y + this.grid.scrollY &&
      mouseY < this.y + this.height + this.grid.scrollY &&
      mouseY > this.grid.tableHeaderHeight
    );
  }
  // 鼠标坐标是否在单元格后缀图标区域内
  isInsideAffixIcon(mouseX, mouseY) {
    return (
      mouseX > this.x + this.width + this.grid.scrollX - 25 &&
      mouseX < this.x + this.width + this.grid.scrollX &&
      mouseY > this.y + this.grid.scrollY + 10 &&
      mouseY < this.y + this.height + this.grid.scrollY - 10
    )
  }
  // 鼠标坐标是否在表头范围内
  isInsideHeader(mouseX, mouseY) {
    return mouseY > this.y && mouseY < this.y + this.grid.tableHeaderHeight;
  }
  // 鼠标坐标是否在checkbox部分内
  isInsideCheckboxBoundary(mouseX, mouseY) {
    return (
      mouseX > this.x + ROW_INDEX_WIDTH &&
      mouseX < this.x + this.grid.originFixedWidth
    );
  }
  isInsideHeaderCheckboxBoundary(mouseX, mouseY) {
    return (
      this.isInsideCheckboxBoundary(mouseX, mouseY) &&
      this.isInsideHeader(mouseX, mouseY)
    );
  }
}

export default Context;
