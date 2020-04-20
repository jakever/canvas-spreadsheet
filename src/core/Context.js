import { HEADER_HEIGHT, ROW_INDEX_WIDTH } from './constants.js'

class Context {
    constructor(grid, x, y, width, height) {
        this.grid = grid;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    isHorizontalVisibleOnBody() {
        return !(this.x + this.width - this.grid.fixedLeftWidth + this.grid.scrollX <= 0 || 
            this.x + this.grid.scrollX >= this.grid.width - this.grid.fixedRightWidth);
    }
    isVerticalVisibleOnBody() {
        return !(this.y + this.height - HEADER_HEIGHT + this.grid.scrollY <= 0 || 
            this.y + this.grid.scrollY >= this.grid.height - this.grid.scrollerTrackSize);
    }
    // 鼠标坐标是否在body内
    isInsideHorizontalBodyBoundary(mouseX, mouseY) {
        return mouseX > this.x + this.grid.scrollX &&
            mouseX < this.x + this.grid.scrollX + this.width &&
            mouseX > this.grid.fixedLeftWidth && // 避免冻结列点击穿透了
            mouseX < this.grid.width - this.grid.fixedRightWidth; // 避免冻结列点击穿透了
    }
    isInsideVerticaBodyBoundary(mouseX, mouseY) {
        return mouseY > this.y + this.grid.scrollY &&
            mouseY < this.y + this.height + this.grid.scrollY &&
            mouseY > HEADER_HEIGHT &&
            mouseY < this.grid.height - this.grid.scrollerTrackSize;
    }
    isInsideHeader(mouseX, mouseY) {
        return mouseY > this.y &&
            mouseY < this.y + HEADER_HEIGHT;
    }
    // 鼠标坐标是否在checkbox部分内
    isInsideCheckboxBoundary(mouseX, mouseY) {
        return mouseX > this.x + ROW_INDEX_WIDTH &&
        mouseX < this.x + this.grid.originFixedWidth;
    }
    isInsideHeaderCheckboxBoundary(mouseX, mouseY) {
        return this.isInsideCheckboxBoundary(mouseX, mouseY) &&
            this.isInsideHeader(mouseX, mouseY)
    }
}

export default Context