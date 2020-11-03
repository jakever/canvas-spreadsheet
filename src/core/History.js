/**
 * 数据历史堆栈
 */
class Histories {
    constructor(grid) {
        this.grid = grid;
        this.history = [];
        this.historyIndex = -1;
    }
    // 推入历史堆栈
    pushState(data) {
        this.history.push(data)
        if (this.history.length > 20) {
            this.history.splice(0, 1)
        }
        this.historyIndex = this.history.length - 1
    }
    // 回退
    backState() {
        if (this.historyIndex >= 0) {
            const backValue = this.history[this.historyIndex]
            // 单个操作
            if (backValue.type === 'single') {
                this.grid.setData(backValue.before.value, backValue.before)
            } else {
                this.grid.batchSetData(backValue.before)
            }
            this.historyIndex -= 1
        }
    }
    // 前进
    forwardState() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex += 1
            const forwardValue = this.history[this.historyIndex]
            // 单个操作
            if (forwardValue.type === 'single') {
                this.grid.setData(forwardValue.after.value, forwardValue.after)
            } else {
                this.grid.batchSetData(forwardValue.after)
            }
        }
    }
}

export default Histories