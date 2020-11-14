import Context from "./Context.js";
import {
  CHECK_BOX_WIDTH,
  ROW_FOCUS_COLOR
} from "./constants.js";

const oncheck = new Image();
const offcheck = new Image();
oncheck.src = require("./images/oncheck.png");
offcheck.src = require("./images/offcheck.png");

class RowHeader extends Context {
  constructor(grid, rowIndex, x, y, width, height, options) {
    super(grid, x, y, width, height);

    this.rowIndex = rowIndex;
    this.text = rowIndex + 1;
    this.checked = false;

    Object.assign(this, options);
  }
  handleCheck(val) {
    this.checked = val;
  }
  draw() {
    const y = this.y + this.grid.scrollY;
    const editor = this.grid.editor;
    const selector = this.grid.selector;

    // 绘制checkbox
    if (this.grid.showCheckbox) {
      const checkEl = this.checked ? oncheck : offcheck;
      this.grid.painter.drawRect(this.width, y, CHECK_BOX_WIDTH, this.height, {
        // borderColor: this.borderColor,
        fillColor: this.grid.focusRowIndex === this.rowIndex ? ROW_FOCUS_COLOR : this.fillColor,
        borderWidth: this.borderWidth
      });
      this.grid.painter.drawTBBorder(this.width, y, CHECK_BOX_WIDTH, this.height, {
        borderColor: this.borderColor,
        borderWidth: this.borderWidth
      })
      this.grid.painter.drawImage(
        checkEl,
        this.width + (CHECK_BOX_WIDTH - 20) / 2,
        y + (this.height - 20) / 2,
        20,
        20
      );
    }
  }
}

export default RowHeader;
