import { h } from "./element.js";

class Clipboard {
  constructor(grid) {
    this.grid = grid;
    this.show = false;
    this.isPaste = false
    this.xArr = [-1, -1];
    this.yArr = [-1, -1];
    // this.init();
  }
  init() {
    const clipboardEl = h("textarea", "").on("paste", e => this.paste(e));
    clipboardEl.css({
      position: "absolute",
      left: "-10000px",
      top: "-10000px"
    });
    this.el = clipboardEl.el;
    document.body.appendChild(this.el);
  }
  copy() {
    const { selector, body } = this.grid;
    const { text } = body.getSelectedData();
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy", false); // copy到剪切板
    document.body.removeChild(textArea);
    this.show = true;
    this.xArr = selector.xArr.slice();
    this.yArr = selector.yArr.slice();
  }
  paste() {
    this.isPaste = true
  }
  // paste2(e) {
  //   const { editor, selector, autofill, body } = this.grid;
  //   let textArr;
  //   let rawText = e.clipboardData.getData("text/plain");
  //   // let arr = isMac ? rawText.split('\r').map(item => item.split('\t')) : rawText.split('\r').map(item => item.split('\t')).slice(0, -1) // windows系统截取掉最后一个空白字符
  //   let arr = rawText.split("\r");
  //   if (arr.length === 1) {
  //     let _arr = arr[0].split("\n");
  //     textArr = _arr.map(item => item.split("\t"));
  //   } else {
  //     textArr = arr.map(item => item.split("\t"));
  //   }
  //   if (textArr.length) {
  //     body.pasteData(textArr);
  //   }
  // }
  select(textArr) {
    this.isPaste = false
    // 复制完把被填充的区域选中，并把激活单元格定位到填充区域的第一个
    const { editor, selector, autofill } = this.grid;
    selector.xArr.splice(1, 1, editor.xIndex + textArr[0].length - 1);
    selector.yArr.splice(1, 1, editor.yIndex + textArr.length - 1);
    autofill.xIndex = selector.xArr[1];
    autofill.yIndex = selector.yArr[1];
    this.clear();
  }
  clear() {
    this.show = false;
    this.xArr = [-1, -1];
    this.yArr = [-1, -1];
  }
}

export default Clipboard;
