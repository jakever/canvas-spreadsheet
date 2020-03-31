/**
 * 画笔
 */
const ALIGN_MAP = {
    left: 'right',
    right: 'left'
}

// 计算文本各种对齐方式下的绘制x轴起始坐标
function calucateTextAlign(value, width, padding, align) {
    let x = width / 2
    const textWidth = this.ctx.measureText(value).width
    if (textWidth > width - padding * 2 || align === 'left') {
        x = textWidth / 2 + padding
    } else if (align === 'right') {
        x = width - textWidth / 2 - padding
    }
    return x
}

class Paint {
  constructor(target, options) {
      const w = options.width
      const h = options.height
      target.width = w * 2;
      target.height = h * 2;
      target.style.width = w + "px";
      target.style.height = h + "px";

      this.ctx = target.getContext('2d')
      this.ctx.scale(2, 2); // 解决fillText模糊的问题
  }
  drawLine(points, options) {
      if (!points[0]) return;
      options = Object.assign({
            borderWidth: 1,
            borderColor: undefined,
            cap: 'square',
            lineJoin: 'miter'
      }, options);

      this.ctx.beginPath();
      this.ctx.moveTo(points[0][0], points[0][1]);
      for(let i = 1; i < points.length; i++) {
          this.ctx.lineTo(points[i][0], points[i][1]);
      }
      this.ctx.lineWidth = options.borderWidth;
      this.ctx.lineCap = options.cap;
      this.ctx.lineJoin = options.lineJoin;

      if (options.fillColor) {
        this.ctx.fillStyle = options.fillColor;
          this.ctx.fill()
      }
      if (options.borderColor) {
        this.ctx.strokeStyle = options.borderColor;
        this.ctx.stroke();
      }
  }
  drawText(text, x, y, options) {
      const defautSty = {
            font: 'normal 12px PingFang SC',
            color: '#495060',
            align: 'center',
            baseLine: 'middle'
      }
      Object.keys(defautSty).forEach(key => {
          if (options[key]) {
            defautSty[key] = options[key]
          }
      })
  
      this.ctx.font = defautSty.font;
      this.ctx.fillStyle = defautSty.color;
      this.ctx.textAlign = ALIGN_MAP[defautSty.align] || defautSty.align;
      this.ctx.textBaseline = defautSty.baseLine;
      this.ctx.fillText(text, x, y);
  }
  drawCellText(text, x, y, width, padding, options) {
    const defautSty = {
          font: 'normal 12px PingFang SC',
          color: '#495060',
          align: 'center',
          baseLine: 'middle'
    }
    Object.keys(defautSty).forEach(key => {
        if (options[key]) {
          defautSty[key] = options[key]
        }
    })
    const startOffset = calucateTextAlign.call(this, text, width, padding, defautSty.align)

    this.ctx.font = defautSty.font;
    this.ctx.fillStyle = defautSty.color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = defautSty.baseLine;
    this.ctx.fillText(text, x + startOffset, y);
}
  drawRect(x, y, width, height, options) {
      options = Object.assign({
          borderWidth: 1,
          borderColor: undefined,
          fillColor: undefined,
          shadowOffsetX: undefined,
          shadowOffsetY: undefined,
          shadowBlur: 0,
          shadowColor: undefined
      }, options);
      this.ctx.save()
      this.ctx.beginPath();

    if(options.shadowOffsetX) {
        this.ctx.shadowOffsetX = options.shadowOffsetX;
    }
    if(options.shadowOffsetY) {
        this.ctx.shadowOffsetY = options.shadowOffsetY;
    }
    if(options.shadowBlur) {
        this.ctx.shadowBlur = options.shadowBlur;
    }
    if(options.shadowColor) {
        this.ctx.shadowColor = options.shadowColor;
    }
      
    // 填充颜色
    if(options.fillColor) {
        this.ctx.fillStyle = options.fillColor;
    }
      
      // 线条宽度及绘制颜色
      if(options.borderColor) {
          this.ctx.lineWidth = options.borderWidth;
          this.ctx.strokeStyle = options.borderColor;
      }
      
      // 绘制矩形路径
      this.ctx.rect(x, y, width, height);
      
      // 如果有填充色，则填充
      if(options.fillColor) {
          this.ctx.fill();
      }
      
      // 如果有绘制色，则绘制
      if(options.borderColor) {
          this.ctx.stroke();
      }
      this.ctx.restore()
  }
  drawImage(img, x, y, width, height) {
      this.ctx.drawImage(img, x, y, width, height);
  }
  clearCanvas(x = 0, y = 0, width, height) {
      this.ctx.clearRect(x, y, width || this.ctx.canvas.width, height || this.ctx.canvas.height);
  }
  getTextWrapping(text, width, padding) {
      if (!text && text !== 0) {
          return null
      }
      this.ctx.font = 'normal 12px PingFang SC';
      const chr = `${text}`.split('')
      let temp = chr[0]
      const arr = []
      
      for (let i = 1; i < chr.length; i++) {
          if (this.ctx.measureText(temp).width >= width - padding * 2) {
              arr.push(temp)
              temp = ''
          }
          temp += chr[i]
      }
      arr.push(temp)
      
      return arr
  }
}

export default Paint