import { h } from "./element.js";
import { CSS_PREFIX } from "./constants.js";

class Selector {
  constructor() {
    this.cornerEl = h("div", `${CSS_PREFIX}-selector-corner`);
    this.areaEl = h("div", `${CSS_PREFIX}-selector-wrap`)
      .child(this.cornerEl)
      .hide();
    this.clipboardEl = h("div", `${CSS_PREFIX}-selector-clipboard`).hide();
    this.autofillEl = h("div", `${CSS_PREFIX}-selector-autofill`).hide();
    this.el = h("div", `${CSS_PREFIX}-selector`)
      .children(this.areaEl, this.clipboardEl, this.autofillEl)
      .hide();
  }
}

export default Selector;
