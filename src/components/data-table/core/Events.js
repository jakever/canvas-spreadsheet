function bind(target, name, fn, useCapture) {
  target.addEventListener(name, fn, useCapture);
}
function unbind(target, name, fn, useCapture) {
  target.removeEventListener(name, fn, useCapture);
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
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  this.scroller.mouseDown(x, y);
}
function handleMouseMove(e) {
  if (e.target.tagName.toLowerCase() === "canvas") {
    e.preventDefault();
  } else {
    this.focusRowIndex = -1
  }
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  this.target.style.cursor = "default";
  this.hoverColor = '';
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
  this.scroller.mouseUp(x, y);
}
function handleClick(e) {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (this.header.isInsideHeader(x, y)) {
    if (this.header.isInsideCheckboxBoundary(x, y)) {
      this.header.handleCheck();
      // this.body.handleCheckRow(); // 表头勾选需要影响body的勾选框状态
      this.handleSelectAll()
    }
  } else {
    this.body.click(x, y);
  }
}
function handleScroll(e) {
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
        e.preventDefault();
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
      'mousedown': handleMouseDown.bind(grid),
      'mousemove': handleMouseMove.bind(grid),
      'mouseup': handleMouseUp.bind(grid),
      'click': handleClick.bind(grid),
      'mousewheel': handleScroll.bind(grid),
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
    bind(el, 'mousemove', this.eventTasks.mousemove, false)
    bind(el, 'mouseup', this.eventTasks.mouseup, false)
    bind(el, 'click', this.eventTasks.click, false)
    bind(el, isFirefox ? 'DOMMouseScroll' : 'mousewheel', this.eventTasks.mousewheel, false)
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
    unbind(el, 'mousemove', this.eventTasks.mousemove, false)
    unbind(el, 'mouseup', this.eventTasks.mouseup, false)
    unbind(el, 'click', this.eventTasks.click, false)
    unbind(el, isFirefox ? 'DOMMouseScroll' : 'mousewheel', this.eventTasks.mousewheel, false)
    unbind(window, 'resize', this.eventTasks.resize, false)
  }
}
export default Events;
