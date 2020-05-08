/**
 * 画笔
 */
const ALIGN_MAP = {
  left: "right",
  right: "left"
};

// 计算文本各种对齐方式下的绘制x轴起始坐标
function calucateTextAlign(value, width, padding, align) {
  let x = width / 2;
  const textWidth = this.ctx.measureText(value).width;
  if (textWidth > width - padding * 2 || align === "left") {
    x = textWidth / 2 + padding;
  } else if (align === "right") {
    x = width - textWidth / 2 - padding;
  }
  return x;
}

class Paint {
  constructor(target) {
    this.ctx = target.getContext("2d");
  }
  scaleCanvas(dpr) {
    this.ctx.scale(dpr, dpr); // 解决高清屏canvas绘制模糊的问题
  }
  drawLine(points, options) {
    if (!points[0]) return;
    options = Object.assign(
      {
        lineCap: "square",
        lineJoin: "miter",
        borderWidth: 1,
        borderColor: undefined,
        fillColor: undefined
      },
      options
    );

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(points[0][0] + 0.5, points[0][1] + 0.5); // + 0.5解决1px模糊的问题
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i][0] + 0.5, points[i][1] + 0.5);
    }
    this.ctx.lineWidth = options.borderWidth;
    this.ctx.lineCap = options.lineCap;
    this.ctx.lineJoin = options.lineJoin;
    if (options.lineDash) {
      this.ctx.lineDashOffset = 4;
      this.ctx.setLineDash(options.lineDash);
    }

    if (options.fillColor) {
      this.ctx.fillStyle = options.fillColor;
      this.ctx.fill();
    }
    if (options.borderColor) {
      this.ctx.strokeStyle = options.borderColor;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }
  drawText(text, x, y, options) {
    options = Object.assign(
      {
        font:
          'normal 12px "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
        color: "#495060",
        align: "center",
        baseLine: "middle"
      },
      options
    );

    this.ctx.font = options.font;
    this.ctx.fillStyle = options.color;
    this.ctx.textAlign = ALIGN_MAP[options.align] || options.align;
    this.ctx.textBaseline = options.baseLine;
    this.ctx.fillText(text, x, y);
  }
  drawCellText(text, x, y, width, padding, options) {
    options = Object.assign(
      {
        font:
          'normal 12px "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif',
        color: "#495060",
        align: "left",
        baseLine: "middle"
      },
      options
    );
    const startOffset = calucateTextAlign.call(
      this,
      text,
      width,
      padding,
      options.align
    );

    this.ctx.font = options.font;
    this.ctx.fillStyle = options.color;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = options.baseLine;
    this.ctx.fillText(text, x + startOffset, y);
  }
  drawRect(x, y, width, height, options) {
    options = Object.assign(
      {
        borderWidth: 1,
        borderColor: undefined,
        fillColor: undefined,
        shadowOffsetX: undefined,
        shadowOffsetY: undefined,
        shadowBlur: 0,
        shadowColor: undefined
      },
      options
    );
    this.ctx.save();
    this.ctx.beginPath();

    if (options.shadowOffsetX) {
      this.ctx.shadowOffsetX = options.shadowOffsetX;
    }
    if (options.shadowOffsetY) {
      this.ctx.shadowOffsetY = options.shadowOffsetY;
    }
    if (options.shadowBlur) {
      this.ctx.shadowBlur = options.shadowBlur;
    }
    if (options.shadowColor) {
      this.ctx.shadowColor = options.shadowColor;
    }

    // 填充颜色
    if (options.fillColor) {
      this.ctx.fillStyle = options.fillColor;
    }

    // 线条宽度及绘制颜色
    if (options.borderColor) {
      this.ctx.lineWidth = options.borderWidth;
      this.ctx.strokeStyle = options.borderColor;
    }

    // 绘制矩形路径，+ 0.5解决1px模糊的问题
    this.ctx.rect(x + 0.5, y + 0.5, width, height);

    // 如果有填充色，则填充
    if (options.fillColor) {
      this.ctx.fill();
    }

    // 如果有绘制色，则绘制
    if (options.borderColor) {
      this.ctx.stroke();
    }
    this.ctx.restore();
  }
  // 绘制圆角矩形路径
  drawRoundRect(x, y, width, height, raidus, options) {
    options = Object.assign(
      {
        borderWidth: 1,
        borderColor: undefined,
        fillColor: undefined,
        shadowOffsetX: undefined,
        shadowOffsetY: undefined,
        shadowBlur: 0,
        shadowColor: undefined
      },
      options
    );
    this.ctx.save();
    this.ctx.beginPath();

    if (options.shadowOffsetX) {
      this.ctx.shadowOffsetX = options.shadowOffsetX;
    }
    if (options.shadowOffsetY) {
      this.ctx.shadowOffsetY = options.shadowOffsetY;
    }
    if (options.shadowBlur) {
      this.ctx.shadowBlur = options.shadowBlur;
    }
    if (options.shadowColor) {
      this.ctx.shadowColor = options.shadowColor;
    }

    // 填充颜色
    if (options.fillColor) {
      this.ctx.fillStyle = options.fillColor;
    }

    // 线条宽度及绘制颜色
    if (options.borderColor) {
      this.ctx.lineWidth = options.borderWidth;
      this.ctx.strokeStyle = options.borderColor;
    }

    this.ctx.moveTo(x + raidus, y);
    this.ctx.arcTo(x + width, y, x + width, y + raidus, raidus); // draw right side and bottom right corner
    this.ctx.arcTo(
      x + width,
      y + height,
      x + width - raidus,
      y + height,
      raidus
    ); // draw bottom and bottom left corner
    this.ctx.arcTo(x, y + height, x, y + height - raidus, raidus); // draw left and top left corner
    this.ctx.arcTo(x, y, x + raidus, y, raidus);

    // this.ctx.moveTo(x+raidus, y);
    // this.ctx.arcTo(x+width, y, x+width, y+height, raidus);
    // this.ctx.arcTo(x+width, y+height, x, y+height, raidus);
    // this.ctx.arcTo(x, y+height, x, y, raidus);
    // this.ctx.arcTo(x, y, x+width, y, raidus);

    // 如果有填充色，则填充
    if (options.fillColor) {
      this.ctx.fill();
    }

    // 如果有绘制色，则绘制
    if (options.borderColor) {
      this.ctx.stroke();
    }
    this.ctx.restore();
  }
  drawImage(img, x, y, width, height) {
    this.ctx.drawImage(img, x, y, width, height);
  }
  clearCanvas(x = 0, y = 0, width, height) {
    this.ctx.clearRect(
      x,
      y,
      width || this.ctx.canvas.width,
      height || this.ctx.canvas.height
    );
  }
  getTextWrapping(text, width, padding) {
    if (!text && text !== 0) {
      return null;
    }
    this.ctx.font =
      'normal 12px "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif';
    const chr = `${text}`.split("");
    let temp = chr[0];
    const arr = [];

    for (let i = 1; i < chr.length; i++) {
      if (this.ctx.measureText(temp).width >= width - padding * 2) {
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
