function handleMouseDown(x, y) {
    if(this.header.isInsideHeader(x, y)) {
        this.header.mouseDown(x, y);
    }
    this.body.mouseDown(x, y);
}
function handleMouseMove(x, y) {
    document.body.style.cursor = 'default';
    if(this.header.isInsideHeader(x, y) || this.header.isResizing) {
        this.header.mouseMove(x, y);
    }
    this.body.mouseMove(x, y);
}
function handleMouseUp(x, y) {
    if(this.header.isInsideHeader(x, y) || this.header.isResizing) {
        this.header.mouseUp(x, y);
    }
    this.body.mouseUp(x, y);
}
function handleClick(x, y) {
    this.body.click(x, y);
}
function handleDbClick(x, y) {
    this.body.dbClick(x, y);
}
function handleKeydown(e) {
    if (e.metaKey || e.ctrlKey) { // 阻止CTRL+类型的事件
        return
    }
    !this.editor.show && e.preventDefault()
    const keyHandler = (k) => {
        if ((k >= 65 && k <= 90) || (k >= 48 && k <= 57) || (k >= 96 && k <= 107) || (k >= 109 && k <= 111) || k === 32 || (k >= 186 && k <= 222)) {
            return true
        } else {
            return false
        }
    }
    if (keyHandler(e.keyCode) && !this.editor.show) {
        return this.startEdit(e.key)
    }
}
function handleScroll(e) {
    if (this.editor.show) return;
    const { deltaX, deltaY } = e
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        let maxWidth = 0;
        if (this.fillCellWidth > 0) { // 列总宽小于容器宽
            maxWidth = this.actualTableWidth
        } else {
            maxWidth = this.actualTableWidth + this.fixedLeftWidth + this.fixedRightWidth
        }
        if (this.scrollX - deltaX > 0) {
            this.scrollX = 0
        } else if (maxWidth - this.width + this.scrollX < deltaX) {
            this.scrollX = this.width - maxWidth
        } else {
            e.preventDefault()
            e.returnValue = false
            this.scrollX -= 2 * deltaX;
        }
    } else {
        if (this.scrollY - deltaY > 0) {
            this.scrollY = 0
        } else if (this.actualTableHeight - this.height + this.scrollY < deltaY) {
            this.scrollY = this.height - this.actualTableHeight
        } else {
            e.preventDefault()
            e.returnValue = false
            this.scrollY -= 2 * deltaY;
        }
    }
}

class Events {
    constructor(grid, el) {
        this.grid = grid

        const getMouseCoords = (e) => {
            const rect = el.getBoundingClientRect()
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            }
        }
        el.onmousedown = (e) => {
            const coords = getMouseCoords(e);
            handleMouseDown.call(grid, coords.x, coords.y);
            e.preventDefault();
        };
        el.onmousemove = function(e) {
            const coords = getMouseCoords(e);
            handleMouseMove.call(grid, coords.x, coords.y);
            e.preventDefault();
        };
        el.onmouseup = function (e) {
            const coords = getMouseCoords(e);
            handleMouseUp.call(grid, coords.x, coords.y);
          e.preventDefault();
        };
        el.onclick = function (e) {
            const coords = getMouseCoords(e);
            handleClick.call(grid, coords.x, coords.y);
          e.preventDefault();
        };
        el.ondblclick = function (e) {
            const coords = getMouseCoords(e);
            handleDbClick.call(grid, coords.x, coords.y);
          e.preventDefault();
        };
        window.addEventListener('keydown', handleKeydown.bind(grid), false)
        el.onmousewheel = (e) => {
            handleScroll.call(grid, e);
            e.preventDefault();
        };
    }
}
export default Events