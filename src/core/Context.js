import { HEADER_HEIGHT, ROW_INDEX_WIDTH, CHECK_BOX_WIDTH } from './constants.js'

class Context {
    constructor(grid, x, y, width, height) {
        this.grid = grid;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    isHorizontalVisibleOnBody() {
        return !(this.x + this.width - this.grid.fixedLeftWidth + this.grid.scrollX < 0 || 
            this.x + this.grid.scrollX > this.grid.width - this.grid.fixedRightWidth);
    }
    isVerticalVisibleOnBody() {
        return !(this.y + this.height - HEADER_HEIGHT + this.grid.scrollY < 0 || 
            this.y + this.grid.scrollY > this.grid.height);
    }
    isInsideHeader(mouseX, mouseY) {
        return mouseY > this.y &&
            mouseY < this.y + this.height;
    }
    // 鼠标坐标是否在body内
    isInsideHorizontalBodyBoundary(mouseX, mouseY) {
        return mouseX > this.x + this.grid.scrollX &&
            mouseX < this.x + this.grid.scrollX + this.width &&
            mouseX > this.grid.fixedLeftWidth;
    }
    isInsideVerticaBodyBoundary(mouseX, mouseY) {
        return mouseY > this.y + this.grid.scrollY &&
            mouseY < this.y + this.grid.scrollY + this.height &&
            mouseY > HEADER_HEIGHT;
    }
    // 鼠标坐标是否在左侧冻结部分内
    isInsideFixedBoundary(mouseX, mouseY) {
        return mouseX > this.x &&
            mouseX < this.x + this.width &&
            mouseY > this.y + this.grid.scrollY &&
            mouseY < this.y + this.grid.scrollY + this.height;
    }
    // 鼠标坐标是否在行索引部分内
    isInsideIndexBoundary(mouseX, mouseY) {
        return mouseX > this.x &&
            mouseX < this.x + ROW_INDEX_WIDTH &&
            mouseY > this.y + this.grid.scrollY &&
            mouseY < this.y + this.grid.scrollY + this.height;
    }
    // 鼠标坐标是否在checkbox部分内
    isInsideCheckboxBoundary(mouseX, mouseY) {
        return mouseX > this.x + ROW_INDEX_WIDTH &&
            mouseX < this.x + ROW_INDEX_WIDTH + CHECK_BOX_WIDTH &&
            mouseY > this.y + this.grid.scrollY &&
            mouseY < this.y + this.height + this.grid.scrollY;
    }
}

export default Context