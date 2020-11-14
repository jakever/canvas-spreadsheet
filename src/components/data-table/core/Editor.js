import { h } from "./element.js";
import { CSS_PREFIX } from "./constants.js";

function inputEventHandler(evt) {
  const v = evt.target.innerHTML;
  // console.log(evt, 'v:', v);
  const { suggest, validator } = this;
  const { cell } = this;
  if (cell !== null) {
    if (
      ("editable" in cell && cell.editable === true) ||
      cell.editable === undefined
    ) {
      this.value = v;
      if (validator) {
        if (validator.type === "list") {
          suggest.search(v);
        } else {
          suggest.hide();
        }
      }
    } else {
      evt.target.value = "";
    }
  } else {
    this.value = v;
  }
}
function keydownHander(e) {
  // // 撤销
  // if ((e.ctrlKey && e.keyCode === 90) || e.metaKey && !e.shiftKey && e.keyCode === 90) {
  //     return console.log('undo')
  // }
  // // 恢复
  // if ((e.ctrlKey && e.keyCode === 89) || (e.metaKey && e.shiftKey && e.keyCode === 90)) {
  //     return console.log('recovery')
  // }
  // 编辑模式下按Enter／ESC
  if (e.keyCode === 13 || e.keyCode === 27) {
    return this.grid.finishedEdit();
  }
  // // 未选中或编辑模式下可以撤销、恢复和enter/ESC退出编辑模式，除此之外阻止键盘事件
  // if (!this.selector.show || this.editor.show) {
  //     return
  // }
  // // CTRL+C／Command+C
  // if ((e.ctrlKey && e.keyCode === 67) || (e.metaKey && e.keyCode === 67)) {
  //     return this.copy()
  // }
  // // CTRL+V／Command+V
  // if ((e.ctrlKey && e.keyCode === 86) || (e.metaKey && e.keyCode === 86)) {
  //     return this.$emit('focus', 'clipboard')
  // }
  // // CTRL+A／Command+A
  // if ((e.ctrlKey && e.keyCode) === 65 || (e.metaKey && e.keyCode === 65)) {
  //     return this.selectAll(e)
  // }
  if (e.metaKey || e.ctrlKey) {
    // 阻止CTRL+类型的事件
    return;
  }
  // e.preventDefault()
  // const keyHandler = (k) => {
  //     if ((k >= 65 && k <= 90) || (k >= 48 && k <= 57) || (k >= 96 && k <= 107) || (k >= 109 && k <= 111) || k === 32 || (k >= 186 && k <= 222)) {
  //         return true
  //     } else {
  //         return false
  //     }
  // }
  // if (keyHandler(e.keyCode)) {
  //     return this.doEdit(e.key)
  // }
  // switch (e.keyCode) {
  //     // 左
  //     case 37:
  //         if (this.editor.editorXIndex > this.editor.range.minX) {
  //             this.editor.editorXIndex--
  //         }
  //         this.adjustPosition()
  //         break
  //     // 上
  //     case 38:
  //         if (this.editor.editorYIndex > this.editor.range.minY) {
  //             this.editor.editorYIndex--
  //         }
  //         this.adjustPosition()
  //         break
  //     // 右 或 Tab
  //     case 9:
  //     case 39:
  //         if (this.editor.editorXIndex < this.editor.range.maxX) {
  //             this.editor.editorXIndex++
  //         }
  //         this.adjustPosition()
  //         break
  //     // 下
  //     case 40:
  //         if (this.editor.editorYIndex < this.editor.range.maxY) {
  //             this.editor.editorYIndex++
  //         }
  //         this.adjustPosition()
  //         break
  //     // BackSpace／delede
  //     case 8:
  //         this.clearSelected()
  //         break
  //     // Enter
  //     case 13:
  //         this.doEdit()
  //         break
  //     default:
  //         console.log(e, 'event')
  // }
}
// 改用div(contenteditable = true)
function resetTextareaSize() {
  const { value } = this;
  if (!/^\s*$/.test(value)) {
    const { textlineEl, textEl, areaOffset } = this;
    const txts = value.split("\n");
    const maxTxtSize = Math.max(...txts.map(it => it.length));
    const tlOffset = textlineEl.offset();
    const fontWidth = tlOffset.width / value.length;
    const tlineWidth = (maxTxtSize + 1) * fontWidth + 5;
    const maxWidth = this.viewFn().width - areaOffset.left - fontWidth;
    let h1 = txts.length;
    if (tlineWidth > areaOffset.width) {
      let twidth = tlineWidth;
      if (tlineWidth > maxWidth) {
        twidth = maxWidth;
        h1 += parseInt(tlineWidth / maxWidth, 10);
        h1 += tlineWidth % maxWidth > 0 ? 1 : 0;
      }
      textEl.css("width", `${twidth}px`);
    }
    h1 *= this.rowHeight;
    if (h1 > areaOffset.height) {
      textEl.css("height", `${h1}px`);
    }
  }
}

class Editor {
  constructor(grid) {
    this.grid = grid;
    this.areaEl = h("div", `${CSS_PREFIX}-editor-area`).children(
      (this.textEl = h("div", "")
        .on("input", evt => inputEventHandler.call(this, evt))
        .on("keydown", evt => keydownHander.call(this, evt)))
    );
    this.textEl.attr("contenteditable", true);
    this.el = h("div", `${CSS_PREFIX}-editor`)
      .child(this.areaEl)
      .hide();

    this.type = "text"; // 数据类型
    this.fixed = false; // 当前选中单元格是否属于冻结列
    this.selectOptions = []; // 下拉数据源
    this.editorXIndex = 0; // 编辑器所在x,y轴坐标
    this.editorYIndex = 0;
    this.show = false;
    this.value = "";
  }
  fire(cell) {
    this.cell = cell;
    this.setoffset();
    this.show = true;
    this.el.show();
    this.textEl.focus();
  }
  hide() {
    this.cell = null;
    this.el.hide();
    this.show = false;
    this.value = "";
    this.textEl.html("");
  }
  setData(val) {
    this.value = val;
    this.textEl.html(val);
    // console.log('text>>:', text);
    // setText.call(this, text, text.length);
    // resetTextareaSize.call(this);
  }
  setoffset() {
    if (this.cell) {
      const { x, y, width, height } = this.cell;
      this.areaEl.offset({
        left: x + this.grid.scrollX - 1,
        top: y + this.grid.scrollY - 1
      });
      this.textEl.offset({
        "min-width": width + 2,
        "min-height": height
      });
    }
  }
}

export default Editor;
