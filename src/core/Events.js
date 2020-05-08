function throttle(
  func,
  time = 17,
  options = {
    // leading 和 trailing 无法同时为 false
    leading: true,
    trailing: false,
    context: null
  }
) {
  let previous = new Date(0).getTime();
  let timer;
  const _throttle = function(...args) {
    let now = new Date().getTime();

    if (!options.leading) {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        func.apply(options.context, args);
      }, time);
    } else if (now - previous > time) {
      func.apply(options.context, args);
      previous = now;
    } else if (options.trailing) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(options.context, args);
      }, time);
    }
  };
  // 闭包返回取消函数
  _throttle.cancel = () => {
    previous = 0;
    clearTimeout(timer);
    timer = null;
  };
  return _throttle;
}
function handleMouseDown(e) {
  if (e.target.tagName.toLowerCase() === "canvas") {
    e.preventDefault();
  }
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (this.header.isInsideHeader(x, y)) {
    this.header.mouseDown(x, y);
  }
  this.body.mouseDown(x, y);
  this.scroller.mouseDown(x, y);
}
function handleMouseMove(e) {
  if (e.target.tagName.toLowerCase() === "canvas") {
    e.preventDefault();
  }
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  this.target.style.cursor = "default";
  if (this.header.isInsideHeader(x, y) || this.header.isResizing) {
    this.header.mouseMove(x, y);
  }
  this.body.mouseMove(x, y);
  this.scroller.mouseMove(x, y);
}
function handleMouseUp(e) {
  if (e.target.tagName.toLowerCase() === "canvas") {
    e.preventDefault();
  }
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (this.header.isInsideHeader(x, y) || this.header.isResizing) {
    this.header.mouseUp(x, y);
  }
  this.endMultiSelect();
  this.scroller.mouseUp(x, y);
}
function handleClick(e) {
  if (e.target.tagName.toLowerCase() === "canvas") {
    e.preventDefault();
  }
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  this.body.click(x, y);
  if (this.header.isInsideHeaderCheckboxBoundary(x, y)) {
    this.header.click();
    this.body.handleCheckRow();
  }
}
function handleDbClick(e) {
  if (e.target.tagName.toLowerCase() === "canvas") {
    e.preventDefault();
  }
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  this.body.dbClick(x, y);
}
function handleKeydown(e) {
  if (this.editor.show) {
    // 编辑模式按下按Enter／ESC退出编辑模式
    if (e.keyCode === 13 || e.keyCode === 27) {
      e.preventDefault();
      this.doneEdit();
    }
    return;
  }
  // 未选中
  if (!this.selector.show) {
    return;
  }
  // 撤销
  if (
    (e.ctrlKey && e.keyCode === 90) ||
    (e.metaKey && !e.shiftKey && e.keyCode === 90)
  ) {
    // e.preventDefault()
    console.log("undo");
  }
  // 恢复
  if (
    (e.ctrlKey && e.keyCode === 89) ||
    (e.metaKey && e.shiftKey && e.keyCode === 90)
  ) {
    // e.preventDefault()
    console.log("recovery");
  }
  // CTRL+C／Command+C
  if ((e.ctrlKey && e.keyCode === 67) || (e.metaKey && e.keyCode === 67)) {
    // e.preventDefault()
    this.clipboard.copy();
  }
  // CTRL+V／Command+V
  // if ((e.ctrlKey && e.keyCode === 86) || (e.metaKey && e.keyCode === 86)) {
  //     // e.preventDefault()
  //     // this.paste(e)
  //     console.log('paste')
  // }
  // CTRL+A／Command+A
  if ((e.ctrlKey && e.keyCode) === 65 || (e.metaKey && e.keyCode === 65)) {
    // e.preventDefault()
    console.log("select all");
  }
  if (e.metaKey || e.ctrlKey) {
    // CTRL+R／CRTRL+F等类型的事件不禁用默认事件
    return;
  }
  e.preventDefault();
  const keyHandler = k => {
    if (
      (k >= 65 && k <= 90) ||
      (k >= 48 && k <= 57) ||
      (k >= 96 && k <= 107) ||
      (k >= 109 && k <= 111) ||
      k === 32 ||
      (k >= 186 && k <= 222)
    ) {
      return true;
    } else {
      return false;
    }
  };
  if (keyHandler(e.keyCode)) {
    return this.startEdit(e.key);
  }
  switch (e.keyCode) {
    // 左
    case 37:
      this.moveFocus("LEFT");
      break;
    // 上
    case 38:
      this.moveFocus("TOP");
      break;
    // 右 或 Tab
    case 9:
    case 39:
      this.moveFocus("RIGHT");
      break;
    // 下
    case 40:
      this.moveFocus("BOTTOM");
      break;
    case 8: // BackSpace／delede
    case 46:
      this.setData("");
      break;
    case 13:
      this.startEdit();
      break;
    default:
    //
  }
}
function handleScroll(e) {
  e.preventDefault();
  if (this.editor.show) return;
  const { deltaX, deltaY } = e;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (this.scroller.horizontalScroller.has) {
      const maxWidth = this.tableWidth;
      if (this.scrollX - deltaX > 0) {
        this.scrollX = 0;
      } else if (
        maxWidth + this.verticalScrollerSize - this.width + this.scrollX <
        deltaX
      ) {
        this.scrollX = this.width - maxWidth - this.verticalScrollerSize;
      } else {
        e.preventDefault();
        e.returnValue = false;
        this.scrollX -= 2 * deltaX;
      }
    }
  } else {
    if (this.scroller.verticalScroller.has) {
      if (this.scrollY - deltaY > 0) {
        this.scrollY = 0;
      } else if (
        this.tableHeight +
          this.horizontalScrollerSize -
          this.height +
          this.scrollY <
        deltaY
      ) {
        this.scrollY =
          this.height - this.tableHeight - this.horizontalScrollerSize;
      } else {
        e.preventDefault();
        e.returnValue = false;
        this.scrollY -= 2 * deltaY;
      }
    }
  }
  this.scroller.setPosition();
}
function handleResize() {
  this.resize();
}

class Events {
  constructor(grid, el) {
    this.grid = grid;

    el.addEventListener("mousedown", handleMouseDown.bind(grid), false);
    // el.addEventListener('mousemove', throttle(handleMouseMove, 50, {
    //     context: grid
    // }), false)
    window.addEventListener("mousemove", handleMouseMove.bind(grid), false);
    window.addEventListener("mouseup", handleMouseUp.bind(grid), false);
    // el.addEventListener('mouseup', handleMouseUp.bind(grid), false)
    el.addEventListener("click", handleClick.bind(grid), false);
    el.addEventListener("dblclick", handleDbClick.bind(grid), false);
    el.addEventListener("mousewheel", handleScroll.bind(grid), false);
    window.addEventListener("keydown", handleKeydown.bind(grid), false);
    window.addEventListener(
      "resize",
      throttle(handleResize, 100, {
        context: grid
      }),
      false
    );
  }
}
export default Events;
