<template>
    <div :class="CSS_PREFIX">
        <div :class="`${CSS_PREFIX}-main`">
            <canvas :id="`${CSS_PREFIX}-target`" :class="`${CSS_PREFIX}-table`"></canvas>
            <div :class="`${CSS_PREFIX}-overlayer`">
                <div :class="`${CSS_PREFIX}-editor`" v-show="show" ref="editor" @keydown="keydownHander">
                    <div 
                        ref="text" 
                        contenteditable="true" 
                        v-if="isSimple"
                        @input="inputHandler"></div>
                    <el-date-picker
                        ref="date"
                        :class="`${CSS_PREFIX}-popup`"
                        v-else-if="dateType==='date'"
                        :style="popupSty"
                        v-model="value"
                        :editable="false"
                        type="date"
                        size="mini"
                        placeholder="选择日期"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                        @change="dateChange">
                    </el-date-picker>
                    <el-select 
                        ref="select"
                        :class="`${CSS_PREFIX}-popup`"
                        v-else-if="dateType==='select'"
                        :style="popupSty"
                        v-model="value" 
                        size="mini"
                        :automatic-dropdown="true"
                        @change="selectChange">
                        <el-option v-for="item in selectOptions" :value="item.value" :label="item.label" :key="item.value"></el-option>
                    </el-select>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { CSS_PREFIX } from '../core/constants.js'
import DataGrid from '../core/DataGrid.js'
import './index.scss'
const SIMPLE_DATE_TYPES = ['text', 'number', 'phone', 'email']

export default {
    props: {
        fixedLeft: {
            type: Number,
            default: 0
        },
        fixedRight: {
            type: Number,
            default: 0
        },
        columns: {
            type: Array,
            default() {
                return []
            }
        },
        data: {
            type: Array,
            default() {
                return []
            }
        }
    },
    data() {
        return {
            CSS_PREFIX,
            show: false,
            dateType: 'text',
            width: 'auto',
            value: '',
            selectOptions: []
        }
    },
    computed: {
        popupSty() {
            return {
                width: this.width
            }
        },
        isSimple() {
            return SIMPLE_DATE_TYPES.includes(this.dateType)
        }
    },
    methods: {
        startEdit(cell) {
            this.dateType = cell.dateType
            this.value = cell.value
            this.selectOptions = cell.options
            this.$refs.text.innerText = cell.value
            this.width = `${cell.width - 2}px`
            this.setPosition(cell)
            this.show = true
            this.$nextTick(() => {
                this.focus()
            })
        },
        finishedEdit() {
            this.show = false
            this.dateType = 'text'
            this.grid.finishedEdit()
        },
        setPosition(cell) {
            this.$refs.editor.style.left = `${cell.x + cell.scrollX - 1}px`
            this.$refs.editor.style.top = `${cell.y + cell.scrollY - 1}px`
            this.$refs.text.style['min-width'] = `${cell.width - 2}px`
            this.$refs.text.style['min-height'] = `${cell.height - 2}px`
        },
        focus(type) {
            let _type = type || this.dateType
            if (this.isSimple) {
                _type = 'text'
            }
            const el = this.$refs[_type]
            if (typeof el.focus === 'function') {
                if (_type === 'date' || _type === 'select') {
                    el.focus()
                } else {
                    if (window.getSelection) { // ie11 10 9 ff safari
                        el.focus() // 解决ff不获取焦点无法定位问题
                        const range = window.getSelection()// 创建range
                        range.selectAllChildren(el)// range 选择obj下所有子内容
                        range.collapseToEnd()// 光标移至最后
                    } else if (document.selection) { // ie10以下
                        const range = document.selection.createRange()// 创建选择对象
                        // var range = document.body.createTextRange();
                        range.moveToElementText(el)// range定位到obj
                        range.collapse(false)// 光标移至最后
                        range.select()
                    }
                }
            }
        },
        inputHandler(e) {
            const val = e.target.innerText;
            this.grid.setData(val)
        },
        keydownHander(e) {
            // 编辑模式下按Enter／ESC
            if (e.keyCode === 13 || e.keyCode === 27) {
                e.preventDefault()
                return this.finishedEdit()
            }
        },
        selectChange(val) {
            this.grid.setData(val)
        },
        dateChange(val) {
            this.grid.setData(val)
        }
    },
    created() {
        this.$nextTick(() => {
            let el = document.getElementById(`${CSS_PREFIX}-target`);
            this.grid = new DataGrid(el, {
              fixedLeft: this.fixedLeft,
              fixedRight: this.fixedRight,
              columns: this.columns,
              data: this.data,
              onEditCell: (cell) => {
                  this.startEdit(cell)
              },
              onSelectCell: () => {
                  this.finishedEdit()
              }
            });
        })
    }
}
</script>
<style lang="scss">
</style>