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
  constructor(id, grid, rowIndex, x, y, width, height, options) {
    super(grid, x, y, width, height);

    this.rowIndex = rowIndex;
    this.id = id;
    this.text = rowIndex + 1;
    this.checked = false;

    Object.assign(this, options);
  }
  handleCheck(val) {
    this.checked = val;
  }
  draw() {
    const y = this.y + this.grid.scrollY;
    const {
      border,
      borderColor,
      borderWidth,
      dividerColor,
      fillColor
    } = this.grid

    // 绘制checkbox
    if (this.grid.showCheckbox) {
      this.checked = this.grid.checkedIds.includes(this.id)
      const checkEl = this.checked ? oncheck : offcheck;
      this.grid.painter.drawRect(this.width, y, CHECK_BOX_WIDTH, this.height, {
        borderColor: border ? borderColor : undefined,
        fillColor: this.grid.focusRowIndex === this.rowIndex ? ROW_FOCUS_COLOR : fillColor,
        borderWidth
      });
      if (this.grid.divider) {
        this.grid.painter.drawTBBorder(this.width, y, CHECK_BOX_WIDTH, this.height, {
          borderColor: dividerColor,
          borderWidth
        })
      }
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
