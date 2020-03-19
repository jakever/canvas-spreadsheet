/**
 * 画笔
 */
class Paint {
  constructor(target, options) {
    target.width = options.width * 2;
    target.height = options.height * 2;
    target.style.width = options.width + "px";
    target.style.height = options.height + "px";

    this.ctx = target.getContext("2d");
    this.ctx.scale(2, 2); // 解决fillText模糊的问题

    const getMouseCoords = e => {
      const rect = this.ctx.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    this.ctx.canvas.onmousedown = e => {
      const coords = getMouseCoords(e);
      options.onMouseDown(coords.x, coords.y);
      e.preventDefault();
    };
    this.ctx.canvas.onmousemove = function(e) {
      const coords = getMouseCoords(e);
      options.onMouseMove(coords.x, coords.y);
      e.preventDefault();
    };
    this.ctx.canvas.onmouseup = function(e) {
      const coords = getMouseCoords(e);
      options.onMouseUp(coords.x, coords.y);
      e.preventDefault();
    };
    this.ctx.canvas.onclick = function(e) {
      const coords = getMouseCoords(e);
      options.onClick(coords.x, coords.y);
      e.preventDefault();
    };
    this.ctx.canvas.ondblclick = function(e) {
      const coords = getMouseCoords(e);
      options.onDbClick(coords.x, coords.y);
      e.preventDefault();
    };
    this.ctx.canvas.onmousewheel = e => {
      options.onScroll(e);
      e.preventDefault();
    };
  }
  drawLine(points, options) {
    options = Object.assign(
      {
        width: 1,
        color: "black",
        cap: "square",
        lineJoin: "miter"
      },
      options
    );

    this.ctx.beginPath();
    this.ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i][0], points[i][1]);
    }
    this.ctx.lineWidth = options.width;
    this.ctx.strokeStyle = options.color;
    this.ctx.lineCap = options.cap;
    this.ctx.lineJoin = options.lineJoin;
    this.ctx.stroke();
  }
  drawText(text, x, y, options) {
    options = Object.assign(
      {
        font: "normal 12px PingFang SC",
        color: "#495060",
        align: "center",
        baseLine: "middle"
      },
      options
    );

    this.ctx.font = options.font;
    this.ctx.fillStyle = options.color;
    this.ctx.textAlign = options.align;
    this.ctx.textBaseline = options.baseLine;
    this.ctx.fillText(text, x, y);
  }
  drawRect(x, y, width, height, options) {
    options = Object.assign(
      {
        borderWidth: 1,
        borderColor: undefined,
        fillColor: undefined
      },
      options
    );

    this.ctx.beginPath();

    // 填充颜色
    if (options.fillColor) {
      this.ctx.fillStyle = options.fillColor;
    }

    // 线条宽度及绘制颜色
    if (options.borderColor) {
      this.ctx.lineWidth = options.borderWidth;
      this.ctx.strokeStyle = options.borderColor;
    }

    // 绘制矩形路径
    this.ctx.rect(x, y, width, height);

    // 如果有填充色，则填充
    if (options.fillColor) {
      this.ctx.fill();
    }

    // 如果有绘制色，则绘制
    if (options.borderColor) {
      this.ctx.stroke();
    }
  }
  drawImage(img, x, y, width, height) {
    this.ctx.drawImage(img, x, y, width, height);
  }
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
  getTextWrapping(text, width) {
    if (!text && text !== 0) {
      return null;
    }
    this.ctx.font = "normal 12px PingFang SC";
    const chr = `${text}`.split("");
    let temp = chr[0];
    const arr = [];

    for (let i = 1; i < chr.length; i++) {
      if (this.ctx.measureText(temp).width >= width - 20) {
        arr.push(temp);
        temp = "";
      }
      temp += chr[i];
    }
    arr.push(temp);

    return arr;
  }
}

export default Paint;
