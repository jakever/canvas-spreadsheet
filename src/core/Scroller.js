import { 
    SCROLLER_SIZE,
    SCROLLER_TRACK_SIZE,
    HEADER_HEIGHT
 } from './constants.js'

class Scroller {
    constructor(grid) {
        this.grid = grid;
        this.horizontalScroller = {
            x: 0,
            move: false,
            size: 0, // 滚动滑块的尺寸
            ratio: 1
        }
        this.verticalScroller = {
            y: 0,
            move: false,
            size: 0,
            ratio: 1
        }

        this.init()
    }
    init() {
        const {
            width,
            height,
            tableWidth,
            tableHeight,
            originFixedWidth
        } = this.grid
        this.horizontalScroller.ratio = width / tableWidth
        this.verticalScroller.ratio = height / tableHeight
        if (this.horizontalScroller.ratio >= 1) {
            this.horizontalScroller.size = 0;
        } else {
            this.horizontalScroller.size = parseInt(this.horizontalScroller.ratio * width)
        }
        if (this.verticalScroller.ratio >= 1) {
            this.verticalScroller.size = 0;
        } else {
            this.verticalScroller.size = parseInt(this.verticalScroller.ratio * height)
        }
        if (this.horizontalScroller.size < 30) {
            this.horizontalScroller.size = 30
        }
        if (this.verticalScroller.size < 30) {
            this.verticalScroller.size = 30
            this.verticalScroller.ratio = (height - 16) / (tableHeight - height)
        }

        // 计算滚动距离的比例
        this.horizontalScrollRatio = 
            (width - originFixedWidth - SCROLLER_TRACK_SIZE - this.horizontalScroller.size - SCROLLER_SIZE) / 
            // (width - originFixedWidth - SCROLLER_TRACK_SIZE - this.horizontalScroller.size) / 
            // (width - SCROLLER_TRACK_SIZE - this.horizontalScroller.size) / 
            (tableWidth + SCROLLER_TRACK_SIZE - width);
        this.verticalScrollRatio = 
            (height - HEADER_HEIGHT - SCROLLER_TRACK_SIZE - this.verticalScroller.size - SCROLLER_SIZE) / 
            // (height - HEADER_HEIGHT - SCROLLER_TRACK_SIZE - this.verticalScroller.size) / 
            // (height - SCROLLER_TRACK_SIZE - this.verticalScroller.size) / 
            (tableHeight + SCROLLER_TRACK_SIZE - height)
    }
    isInsideHorizontalScroller(mouseX, mouseY) {
        return mouseX > this.grid.originFixedWidth &&
            mouseX < this.grid.width - SCROLLER_TRACK_SIZE &&
            mouseY > this.grid.height - SCROLLER_TRACK_SIZE &&
            mouseY < this.grid.height;
    }
    isInsideVerticalScroller(mouseX, mouseY) {
        return mouseX > this.grid.width - SCROLLER_TRACK_SIZE &&
            mouseX < this.grid.width &&
            mouseY > HEADER_HEIGHT &&
            mouseY < this.grid.height - SCROLLER_TRACK_SIZE;
    }
    setPosition() {
        this.horizontalScroller.x = -parseInt(this.grid.scrollX * this.horizontalScrollRatio)
        this.verticalScroller.y = -parseInt(this.grid.scrollY * this.verticalScrollRatio)
    }
    mouseDown(x, y) {
        if (this.isInsideHorizontalScroller(x, y)) {
            this.mouseOriginalX = x;
            this.horizontalScroller.move = true
        } else if (this.isInsideVerticalScroller(x, y)) {
            this.mouseOriginalY = y;
            this.verticalScroller.move = true
        }
    }
    mouseMove(x, y) {
        if (this.horizontalScroller.move) {
            const diffX = x - this.mouseOriginalX
            // const movedX = this.horizontalScroller.x - (this.grid.originFixedWidth + SCROLLER_SIZE / 2) + diffX
            const movedX = this.horizontalScroller.x + diffX
            const trachWidth = this.grid.width - this.grid.originFixedWidth - this.horizontalScroller.size - SCROLLER_TRACK_SIZE - SCROLLER_SIZE
            // const trachWidth = this.grid.width - this.grid.originFixedWidth - this.horizontalScroller.size - SCROLLER_TRACK_SIZE
            // const trachWidth = this.grid.width - this.horizontalScroller.size - SCROLLER_TRACK_SIZE
            
            if (movedX > 0 && movedX < trachWidth) {
                this.horizontalScroller.x += diffX
                this.grid.scrollX = -this.horizontalScroller.x / this.horizontalScroller.ratio
            } else if (movedX <= 0) {
                // this.horizontalScroller.x = this.grid.originFixedWidth + SCROLLER_SIZE / 2
                this.horizontalScroller.x = 0
                this.grid.scrollX = 0
            } else {
                // this.horizontalScroller.x = this.grid.originFixedWidth + SCROLLER_SIZE / 2 + trachWidth
                this.horizontalScroller.x = trachWidth
                this.grid.scrollX = this.grid.width - this.grid.tableWidth - SCROLLER_TRACK_SIZE
            }
            this.mouseOriginalX = x
            // this.grid.scrollX = -this.horizontalScroller.x / this.horizontalScroller.ratio
            
        } else if (this.verticalScroller.move) {
            const diffY = y - this.mouseOriginalY
            const movedY = this.verticalScroller.y + diffY
            const trackHeight = this.grid.height - HEADER_HEIGHT - this.verticalScroller.size - SCROLLER_TRACK_SIZE - SCROLLER_SIZE
            // const trackHeight = this.grid.height - HEADER_HEIGHT - this.verticalScroller.size - SCROLLER_TRACK_SIZE
            // const trackHeight = this.grid.height - this.verticalScroller.size

            if (movedY > 0 && movedY < trackHeight) {
                this.verticalScroller.y += diffY
                this.grid.scrollY = -this.verticalScroller.y / this.verticalScroller.ratio
            } else if (movedY <= 0) {
                this.verticalScroller.y = 0
                this.grid.scrollY = 0
            } else {
                this.verticalScroller.y = trackHeight
                this.grid.scrollY = this.grid.height - this.grid.tableHeight - SCROLLER_TRACK_SIZE
            }
            this.mouseOriginalY = y
        }
    }
    mouseUp(x, y) {
        this.horizontalScroller.move = false
        this.verticalScroller.move = false
    }
    draw() {
        // 横向滚动条
        const scrollerWidth = this.grid.width - SCROLLER_TRACK_SIZE
        const scrollerHeight = this.grid.height - SCROLLER_TRACK_SIZE
        const trackOffset = SCROLLER_TRACK_SIZE / 2

        const thumbOffset = SCROLLER_SIZE / 2
        // const horizontalThumbX = this.grid.originFixedWidth + thumbOffset - this.grid.scrollX * this.horizontalScrollRatio
        // const horizontalThumbX = this.grid.originFixedWidth - this.grid.scrollX * this.horizontalScrollRatio
        // const verticalThumbY = HEADER_HEIGHT + thumbOffset - this.grid.scrollY * this.verticalScrollRatio

        // 轨道
        this.grid.painter.drawRect(0, scrollerHeight, scrollerWidth, SCROLLER_TRACK_SIZE, {
            fillColor: this.grid.fillColor,
            borderColor: this.grid.borderColor,
            borderWidth: this.grid.borderWidth
        });
        // 滑块起始位置线条
        this.grid.painter.drawLine([
            [this.grid.originFixedWidth, scrollerHeight],
            [this.grid.originFixedWidth, scrollerHeight + SCROLLER_TRACK_SIZE]
        ], {
            borderColor: this.grid.borderColor,
            borderWidth: this.grid.borderWidth,
        })
        // 滑块
        this.grid.painter.drawLine([
            [this.horizontalScroller.x + this.grid.originFixedWidth + thumbOffset, scrollerHeight + trackOffset],
            [this.horizontalScroller.x + this.grid.originFixedWidth + thumbOffset + this.horizontalScroller.size, scrollerHeight + trackOffset]
            // [this.horizontalScroller.x + this.grid.originFixedWidth, scrollerHeight + trackOffset],
            // [this.horizontalScroller.x + this.grid.originFixedWidth + this.horizontalScroller.size, scrollerHeight + trackOffset]
            // [this.horizontalScroller.x, scrollerHeight + trackOffset],
            // [this.horizontalScroller.x + this.horizontalScroller.size, scrollerHeight + trackOffset]
        ], {
            borderColor: this.grid.borderColor,
            borderWidth: SCROLLER_SIZE,
            lineCap: 'round'
        })

        // 纵向滚动条
        this.grid.painter.drawRect(scrollerWidth, 0, SCROLLER_TRACK_SIZE, scrollerHeight, {
            fillColor: this.grid.fillColor,
            borderColor: this.grid.borderColor,
            borderWidth: this.grid.borderWidth
        });
        // 滑块起始位置线条
        this.grid.painter.drawLine([
            [scrollerWidth, HEADER_HEIGHT],
            [scrollerWidth + SCROLLER_TRACK_SIZE, HEADER_HEIGHT]
        ], {
            borderColor: this.grid.borderColor,
            borderWidth: this.grid.borderWidth,
        })
        // 滑块
        this.grid.painter.drawLine([
            [scrollerWidth + trackOffset, this.verticalScroller.y + thumbOffset + HEADER_HEIGHT],
            [scrollerWidth + trackOffset, this.verticalScroller.y + thumbOffset + HEADER_HEIGHT + this.verticalScroller.size]
            // [scrollerWidth + trackOffset, this.verticalScroller.y + HEADER_HEIGHT],
            // [scrollerWidth + trackOffset, this.verticalScroller.y + HEADER_HEIGHT + this.verticalScroller.size]
        ], {
            borderColor: this.grid.borderColor,
            borderWidth: SCROLLER_SIZE,
            lineCap: 'round'
        })
    }
}

export default Scroller