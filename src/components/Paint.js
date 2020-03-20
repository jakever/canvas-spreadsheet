/**
 * 画笔
 */
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

      const getMouseCoords = (e) => {
          const rect = this.ctx.canvas.getBoundingClientRect()
          return {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
          }
      }
      this.ctx.canvas.onmousedown = (e) => {
          const coords = getMouseCoords(e);
          options.onMouseDown(coords.x, coords.y);
          e.preventDefault();
      };
      this.ctx.canvas.onmousemove = function(e) {
          const coords = getMouseCoords(e);
          options.onMouseMove(coords.x, coords.y);
          e.preventDefault();
      };
      this.ctx.canvas.onmouseup = function (e) {
          const coords = getMouseCoords(e);
          options.onMouseUp(coords.x, coords.y);
        e.preventDefault();
      };
      this.ctx.canvas.onclick = function (e) {
          const coords = getMouseCoords(e);
          options.onClick(coords.x, coords.y);
        e.preventDefault();
      };
      this.ctx.canvas.ondblclick = function (e) {
          const coords = getMouseCoords(e);
          options.onDbClick(coords.x, coords.y);
        e.preventDefault();
      };
      this.ctx.canvas.onmousewheel = (e) => {
          options.onScroll(e);
          e.preventDefault();
      };
  }
  drawLine(points, options) {
      options = Object.assign({
          width: 1,
          color: 'black',
          cap: 'square',
          lineJoin: 'miter'
      }, options);

      this.ctx.beginPath();
      this.ctx.moveTo(points[0][0], points[0][1]);
      for(let i = 1; i < points.length; i++) {
          this.ctx.lineTo(points[i][0], points[i][1]);
      }
      this.ctx.lineWidth = options.width;
      this.ctx.strokeStyle = options.color;
      this.ctx.lineCap = options.cap;
      this.ctx.lineJoin = options.lineJoin;
      this.ctx.stroke();
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
      this.ctx.textAlign = defautSty.align;
      this.ctx.textBaseline = defautSty.baseLine;
      this.ctx.fillText(text, x, y);
  }
  drawRect(x, y, width, height, options) {
      options = Object.assign({
          borderWidth: 1,
          borderColor: undefined,
          fillColor: undefined
      }, options);
  
      this.ctx.beginPath();
      
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
  }
  drawImage(img, x, y, width, height) {
      this.ctx.drawImage(img, x, y, width, height);
  }
  clearCanvas() {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
  getTextWrapping(text, width) {
      if (!text && text !== 0) {
          return null
      }
      this.ctx.font = 'normal 12px PingFang SC';
      const chr = `${text}`.split('')
      let temp = chr[0]
      const arr = []
      
      for (let i = 1; i < chr.length; i++) {
          if (this.ctx.measureText(temp).width >= width - 20) {
              arr.push(temp)
              temp = ''
          }
          temp += chr[i]
      }
      arr.push(temp)
      
      return arr
  }
    // 计算文本各种对齐方式下的绘制x轴起始坐标
    calucateTextAlign(value, width) {
        // debugger
        let x = width / 2
        const textWidth = this.ctx.measureText(value).width
        if (textWidth > width - 20) {
            x = textWidth / 2 + 10
        }
        return x
    }
}

export default Paint