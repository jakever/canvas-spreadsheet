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
  return {
    width: textWidth,
    offset: x
  };
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
  /**
   * 在指定位置渲染文本
   * @param {String} text 渲染的文本
   * @param {Number} x 渲染的x轴位置
   * @param {Number} y 渲染的y轴位置
   * @param {Object} options 
   */
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
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = options.baseLine;
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }
  /**
   * 在指定宽高的盒子里渲染文本，会结合文本的长度和盒子的宽来决定对齐方式
   * @param {String} text 渲染的文本
   * @param {Number} x 渲染的初始x轴位置
   * @param {Number} y 渲染的初始y轴位置
   * @param {Number} width 盒子的宽
   * @param {Number} height 盒子的高
   * @param {Number} padding 左右边距
   * @param {Object} options color, font, align...
   */
  drawCellText(text, x, y, width, height, padding, options) {
    options = Object.assign(
      {
        color: "#495060",
        fontSize: "12px",
        fontFamily: "normal",
        align: "left",
        baseLine: "middle",
        icon: null,
        iconWidth: 14,
        iconHeight: 14,
        iconOffsetX: 0, 
        iconOffsetY: 0
      },
      options
    );
    this.ctx.font = options.fontFamily + ' ' + options.fontSize + ' ' + '"Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif';
    this.ctx.fillStyle = options.color;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = options.baseLine;
    // font会影响measureText获取的值
    let posX = x
    const posY = options.baseLine === 'middle' ? y + height / 2 : y
    let {
      offset: startOffset,
      width: textWidth
    } = calucateTextAlign.call(
      this,
      text,
      width,
      padding,
      options.align
    );
    if (textWidth > width - padding) {
      let str = text.charAt(0)
      let i = 0
      let w = this.ctx.measureText(str).width;
      while(true) {
        i++
        const temp = str + text.charAt(i)
        w = this.ctx.measureText(temp).width;
        if (w >= width) {
          break;
        }
        str += text.charAt(i)
      }
      text = str.slice(0, -1)
      const rs = calucateTextAlign.call(
        this,
        text,
        width,
        padding,
        options.align
      );
      startOffset = rs.offset
      text += '...'
    }
    if (options.icon && typeof options.icon === 'object' && options.icon.src) {
      // 绘制日历控件小图标，固定在单元格左侧
      this.drawImage(
        options.icon,
        x + options.iconOffsetX,
        posY - options.iconOffsetY - options.iconHeight / 2,
        options.iconWidth,
        options.iconHeight
      );
      // 如果有图标而且是左对齐，那么渲染文本x轴坐标需要增加，给左侧图标留空间
      if (options.align === 'left') {
        posX += 2 * options.iconWidth
      }
    }
    this.ctx.fillText(text, posX + startOffset, posY);
    this.ctx.restore()
  }
  // 在指定宽度的单元格尾部渲染一个图标
  drawCellAffixIcon(icon, x, y, width, height, options) {
    options = Object.assign(
      {
        color: '#bbbec4',
        fillColor: '#fff'
      },
      options
    );
    const rightIconPadding = 25
    this.drawRect(x + width - rightIconPadding, y + 1, rightIconPadding, height, {
      fillColor: options.fillColor
    })
    if (icon === 'arrow') {
      const points = [
        [x + width - 20, y + height / 2 - 2],
        [x + width - 15, y + height / 2 + 3],
        [x + width - 10, y + height / 2 - 2]
      ];
      this.drawLine(points, {
        borderColor: options.color,
        borderWidth: 1
      });
    }
  }
  /**
   * 在文本前指定距离的位置渲染一个图标
   * @param {String} label 支持字符串图标或者实体字符
   * @param {String} text 指定文本
   * @param {Number} x 
   * @param {Number} y 
   * @param {Number} width 
   * @param {Number} padding 
   * @param {Number} offsetX 横坐标位移
   * @param {Number} offsetY 纵坐标位移
   * @param {Object} options 
   */
  drawIcon(label, text, x, y, width, padding, offsetX, offsetY, options) {
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
    const {
      offset: startOffset,
      width: textWidth
    } = calucateTextAlign.call(
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
    this.ctx.fillText(label, x + startOffset - textWidth / 2 - offsetX, y + offsetY);
    this.ctx.restore()
  }
  drawCircle(x, y, radius) {
    this.ctx.beginPath();
    this.ctx.fillStyle = '#0bb27a';
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill();
  }
  // 单元格上下border
  drawTBBorder(x, y, width, height, options) {
    options = Object.assign(
      {
        borderWidth: 1,
        borderColor: undefined,
        shadowOffsetX: undefined,
        shadowOffsetY: undefined,
        shadowBlur: 0,
        shadowColor: undefined
      },
      options
    );
    this.drawLine(
      [
        [x, y],
        [x + width, y]
      ],
      {
        borderColor: options.borderColor,
        borderWidth: options.borderWidth
      }
    );
    this.drawLine(
      [
        [x, y + height],
        [x + width, y + height]
      ],
      {
        borderColor: options.borderColor,
        borderWidth: options.borderWidth
      }
    );
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
  drawAvatar(img, x, y, width, height) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x + width / 2, y + height / 2, 12, 0, Math.PI * 2)
    this.ctx.clip();
    this.drawImage(img, x, y, width, height)
  }
  drawImage(img, x, y, width, height) {
    this.ctx.drawImage(img, x, y, width, height);
    this.ctx.restore()
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
      return '';
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
