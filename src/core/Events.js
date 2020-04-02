function throttle (func, time = 17, options = {
    // leading 和 trailing 无法同时为 false
    leading: true,
    trailing: false,
    context: null
}) {
    let previous = new Date(0).getTime()
    let timer;
    const _throttle = function (...args) {
        let now = new Date().getTime();

        if (!options.leading) {
            if (timer) return
            timer = setTimeout(() => {
                timer = null
                func.apply(options.context, args)
            }, time)
        } else if (now - previous > time) {
            func.apply(options.context, args)
            previous = now
        } else if (options.trailing) {
            clearTimeout(timer)
            timer = setTimeout(() => {
                func.apply(options.context, args)
            }, time)
        }
    };
    // 闭包返回取消函数
    _throttle.cancel = () => {
        previous = 0;
        clearTimeout(timer);
        timer = null
    };
    return _throttle
};
function handleMouseDown(e) {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if(this.header.isInsideHeader(x, y)) {
        this.header.mouseDown(x, y);
    }
    this.body.mouseDown(x, y);
}
function handleMouseMove(e) {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    document.body.style.cursor = 'default';
    if(this.header.isInsideHeader(x, y) || this.header.isResizing) {
        this.header.mouseMove(x, y);
    }
    this.body.mouseMove(x, y);
}
function handleMouseUp(e) {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if(this.header.isInsideHeader(x, y) || this.header.isResizing) {
        this.header.mouseUp(x, y);
    }
    this.body.mouseUp(x, y);
}
function handleClick(e) {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    this.body.click(x, y);
    if(this.header.isInsideHeaderCheckboxBoundary(x, y)) {
        this.header.click();
        this.body.handleCheckRow();
    }
}
function handleDbClick(e) {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
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
    e.preventDefault();
    if (this.editor.show) return;
    const { deltaX, deltaY } = e
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        const maxWidth = this.tableWidth;
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
        } else if (this.tableHeight - this.height + this.scrollY < deltaY) {
            this.scrollY = this.height - this.tableHeight
        } else {
            e.preventDefault()
            e.returnValue = false
            this.scrollY -= 2 * deltaY;
        }
    }
}
function handleResize() {
    this.initSize()
}

class Events {
    constructor(grid, el) {
        this.grid = grid

        el.addEventListener('mousedown', handleMouseDown.bind(grid), false)
        el.addEventListener('mousemove', throttle(handleMouseMove, 50, {
            context: grid
        }), false)
        el.addEventListener('mouseup', handleMouseUp.bind(grid), false)
        el.addEventListener('click', handleClick.bind(grid), false)
        el.addEventListener('dblclick', handleDbClick.bind(grid), false)
        el.addEventListener('mousewheel', handleScroll.bind(grid), false)
        window.addEventListener('keydown', handleKeydown.bind(grid), false)
        window.addEventListener('resize', throttle(handleResize, 100, {
            context: grid
        }), false)
    }
}
export default Events