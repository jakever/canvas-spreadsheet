class Context {
    constructor(grid, x, y, width, height) {
        this.grid = grid;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    // 判断单元格是否超过了右侧和底部可视区的边界
    isVisibleOnScreen() {
        return !(this.x + this.grid.scrollX + this.width < 0 || this.x + this.grid.scrollX > this.grid.width ||
        this.y + this.grid.scrollY + this.height < 0 || this.y + this.grid.scrollY > this.grid.height);
    }
    // 判断单元格是否和否鼠标所在位置有交集
    isInsideBoundary(mouseX, mouseY) {
        return mouseX > this.x + this.grid.scrollX &&
            mouseX < this.x + this.grid.scrollX + this.width &&
            mouseY > this.y + this.grid.scrollY &&
            mouseY < this.y + this.grid.scrollY + this.height;
    }
}

export default Context