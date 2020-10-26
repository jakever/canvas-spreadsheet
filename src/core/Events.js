function bind(target, name, fn, useCapture) {
  target.addEventListener(name, fn, useCapture);
}
function unbind(target, name, fn, useCapture) {
  target.removeEventListener(name, fn, useCapture);
}
function unbindClickoutside(el) {
  if (el.xclickoutside) {
    unbind(window.document.body, 'mousedown', el.xclickoutside);
    delete el.xclickoutside;
  }
}

// the left mouse button: mousedown → mouseup → click
// the right mouse button: mousedown → contenxtmenu → mouseup
// the right mouse button in firefox(>65.0): mousedown → contenxtmenu → mouseup → click on window
function bindClickoutside(el, cb) {
  const self = this
  el.xclickoutside = (evt) => {
    // ignore double click
    // console.log('evt:', evt);
    const pointX = evt.clientX - self.containerOriginX
    const pointY = evt.clientY - self.containerOriginY
    const isInTable = pointX > 0 && pointX < self.width && pointY > 0 && pointY < self.height
    if (evt.detail === 2 || el.contains(evt.target) || isInTable) return;
    if (cb) cb(el);
    else {
      el.style.display = 'none'
      unbindClickoutside(el);
    }
  };
  bind(window.document.body, 'mousedown', el.xclickoutside);
}
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
  e.preventDefault();
  this.enterShift = e.shiftKey
  // 点击画布的任何区域都需要将编辑器变为非编辑模式
  this.doneEdit();
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
    this.header.resizing(x, y);
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
    this.header.endResize(x, y);
  }
  this.endMultiSelect();
  this.scroller.mouseUp(x, y);
}
function handleClick(e) {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  this.body.click(x, y);
  if (this.header.isInsideHeaderCheckboxBoundary(x, y)) {
    this.header.handleCheck();
    this.body.handleCheckRow(); // 表头勾选需要影响body的勾选框状态
  }
}
function handleDbClick(e) {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  this.body.dbClick(x, y);
}
function handleClickoutside() {
  this.doneEdit();
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
    e.preventDefault()
    this.history.backState()
  }
  // 恢复
  if (
    (e.ctrlKey && e.keyCode === 89) ||
    (e.metaKey && e.shiftKey && e.keyCode === 90)
  ) {
    e.preventDefault()
    this.history.forwardState()
  }
  // CTRL+C／Command+C
  if ((e.ctrlKey && e.keyCode === 67) || (e.metaKey && e.keyCode === 67)) {
    e.preventDefault()
    this.clipboard.copy();
  }
  // CTRL+V／Command+V
  if ((e.ctrlKey && e.keyCode === 86) || (e.metaKey && e.keyCode === 86)) {
      // e.preventDefault() // 注意：这里一定不能阻止默认事件，因为粘贴功能依赖原生的paste事件
      this.clipboard.paste();
  }
  // CTRL+A／Command+A
  if ((e.ctrlKey && e.keyCode) === 65 || (e.metaKey && e.keyCode === 65)) {
    e.preventDefault()
    // TODO Select all
  }
  // CTRL+R／CRTRL+F等类型的事件不阻止默认事件
  if (e.metaKey || e.ctrlKey) {
    return;
  }

  /**
   * 由于非编辑模式下，输入中文无法正常触发原生input可编辑元素中的中文输入法模式，
   * 固改用利用原生的可编辑元素的input事件处理非编辑模式下直接敲击键盘可进入编辑模式，
   * 前提是该元素必须先获取聚焦
   */
  // const keyHandler = k => {
  //   if (
  //     (k >= 65 && k <= 90) ||
  //     (k >= 48 && k <= 57) ||
  //     (k >= 96 && k <= 107) ||
  //     (k >= 109 && k <= 111) ||
  //     k === 32 ||
  //     (k >= 186 && k <= 222)
  //   ) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };
  // if (keyHandler(e.keyCode)) {
  //   return this.startEdit(e.key);
  // }
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
      this.clearSelectedData()
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
    this.el = el
    this.isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1

    this.init()
  }
  init() {
    const {
      el,
      grid,
      isFirefox
    } = this
    // const rootEl = el.parentElement;
    this.eventTasks = {
      'clickoutside': handleClickoutside.bind(grid),
      'mousedown': handleMouseDown.bind(grid),
      'mousemove': handleMouseMove.bind(grid),
      'mouseup': handleMouseUp.bind(grid),
      'click': handleClick.bind(grid),
      'dblclick': handleDbClick.bind(grid),
      'mousewheel': handleScroll.bind(grid),
      'keydown': handleKeydown.bind(grid),
      'resize': throttle(handleResize, 100, {
        context: grid
      }),
    }
    /**
     * 这里用js的方案实现Clickoutside会导致一个问题，对于select／data-picker等浮层组件，
     * 若其超过视窗之外，则会判断不准确，所以直接用v-clickoutside指令的方式完美替代；
     * -----------------------------------------------------------------------------
     * 再解释这里为什么有些事件绑定在canvas上而有些绑定在window上？
     * mousemove／mouseup事件：因为存在一些拖拽的事件（比如调整列宽、拖动滚动条等）拥有“中间状态”，
     * 需要鼠标在画布之外时也保持事件执行的能力
     */
    // bindClickoutside.call(grid, rootEl, handleClickoutside.bind(grid))
    bind(el, 'mousedown', this.eventTasks.mousedown, false)
    bind(window, 'mousemove', this.eventTasks.mousemove, false)
    bind(window, 'mouseup', this.eventTasks.mouseup, false)
    bind(el, 'click', this.eventTasks.click, false)
    bind(el, 'dblclick', this.eventTasks.dblclick, false)
    bind(el, isFirefox ? 'DOMMouseScroll' : 'mousewheel', this.eventTasks.mousewheel, false)
    bind(window, 'keydown', this.eventTasks.keydown, false) // canvas元素不支持keydown事件
    bind(window, 'resize', this.eventTasks.resize, false)
  }
  destroy() {
    const {
      el,
      isFirefox
    } = this
    // const rootEl = el.parentElement;
    // unbindClickoutside(rootEl)
    unbind(el, 'mousedown', this.eventTasks.mousedown, false)
    unbind(window, 'mousemove', this.eventTasks.mousemove, false)
    unbind(window, 'mouseup', this.eventTasks.mouseup, false)
    unbind(el, 'click', this.eventTasks.click, false)
    unbind(el, 'dblclick', this.eventTasks.dblclick, false)
    unbind(el, isFirefox ? 'DOMMouseScroll' : 'mousewheel', this.eventTasks.mousewheel, false)
    unbind(window, 'keydown', this.eventTasks.keydown, false)
    unbind(window, 'resize', this.eventTasks.resize, false)
  }
}
export default Events;
