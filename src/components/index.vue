<template>
    <div :class="CSS_PREFIX">
        <div :class="`${CSS_PREFIX}-main`">
            <canvas :id="`${CSS_PREFIX}-target`" :class="`${CSS_PREFIX}-table`"></canvas>
            <div :class="`${CSS_PREFIX}-overlayer`">
                <!-- <textarea ref="clipboard" style="position:absolute;left:-10000px;top:-10000px" @paste="handlePaste"></textarea> -->
                <div :class="`${CSS_PREFIX}-editor`" ref="editor" :style="editorSty">
                    <div 
                        ref="text" 
                        contenteditable="true" 
                        v-if="isSimple"
                        @input="inputHandler"></div>
                    <el-date-picker
                        ref="month"
                        v-else-if="dateType==='month'"
                        :class="`${CSS_PREFIX}-popup`"
                        :style="popupSty"
                        v-model="value"
                        :editable="false"
                        type="month"
                        size="mini"
                        placeholder="选择月份"
                        format="yyyy-MM"
                        value-format="yyyy-MM"
                        @change="selectChange">
                    </el-date-picker>
                    <el-date-picker
                        ref="date"
                        v-else-if="dateType==='date'"
                        :class="`${CSS_PREFIX}-popup`"
                        :style="popupSty"
                        v-model="value"
                        :editable="false"
                        type="date"
                        size="mini"
                        placeholder="选择日期"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                        @change="selectChange">
                    </el-date-picker>
                    <el-select 
                        ref="select"
                        v-else-if="dateType==='select'"
                        :class="`${CSS_PREFIX}-popup`"
                        :style="popupSty"
                        v-model="value" 
                        clearable
                        filterable
                        size="mini"
                        :automatic-dropdown="true"
                        @change="selectChange">
                        <el-option v-for="item in selectOptions" :value="item.value" :label="item.label" :key="item.value"></el-option>
                    </el-select>
                    <!-- <el-cascader
                        ref="cascader"
                        v-else-if="dateType==='cascader'"
                        :class="`${CSS_PREFIX}-popup`"
                        :style="popupSty"
                        v-model="cascader_value"
                        size="mini"
                        :options="selectOptions"
                        @change="selectChange">
                    </el-cascader> -->
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
    name: 'DDataGrid',
    props: {
        fixedLeft: {
            type: Number,
            default: 0
        },
        fixedRight: {
            type: Number,
            default: 0
        },
        width: Number,
        height: Number,
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
            popWidth: 'auto',
            value: '',
            editorSty: {},
            cascader_value: [],
            selectOptions: []
        }
    },
    computed: {
        popupSty() {
            return {
                width: this.popWidth
            }
        },
        isSimple() {
            return SIMPLE_DATE_TYPES.includes(this.dateType)
        }
    },
    methods: {
        getCheckedRow() {
            return this.grid.getCheckedRow()
        },
        getChangedRow() {
            return this.grid.getChangedRow()
        },
        setFullScreen(){
            this.grid.resize()
        },
        showEditor(cell) {
            this.show = true
            this.dateType = cell.dateType
            this.value = cell.value
            this.selectOptions = cell.options
            this.$refs.text.innerText = cell.value
            this.setStyle(cell)
            this.$nextTick(() => {
                this.focus()
            })
        },
        hideEditor() {
            this.editorSty = {
                top: '-10000px',
                left: '-10000px',
            }
            this.show = false
            this.dateType = 'text'
        },
        setStyle(cell) {
            this.editorSty = {
                left: `${cell.x + cell.scrollX - 1}px`,
                top: `${cell.y + cell.scrollY - 1}px`
            }
            this.$refs.text.style['min-width'] = `${cell.width - 2}px`
            this.$refs.text.style['min-height'] = `${cell.height - 2}px`
            this.popWidth = `${cell.width - 2}px`
        },
        focus(type) {
            let _type = type || this.dateType
            if (this.isSimple) {
                _type = 'text'
            }
            const el = this.$refs[_type]
            if (typeof el.focus === 'function') {
                if (_type === 'month' || _type === 'date' || _type === 'select') {
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
        selectChange(val) {
            this.grid.setData(val)
        },
        handlePaste(e) {
        }
    },
    created() {
        this.$nextTick(() => {
            const self = this
            let el = document.getElementById(`${CSS_PREFIX}-target`);

            this.grid = new DataGrid(el, {
                width: this.width,
                height: this.height,
              fixedLeft: this.fixedLeft,
              fixedRight: this.fixedRight,
              columns: this.columns,
              data: this.data,
              onEditCell: (cell) => {
                  self.showEditor(cell)
              },
              onSelectCell: () => {
                  self.hideEditor()
                //   self.focus()
                //   self.$refs.clipboard.focus()
              }
            });
        })
    }
}
</script>
<style lang="scss">
</style>