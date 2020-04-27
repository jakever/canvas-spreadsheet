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
                        v-else-if="dataType==='month'"
                        :class="`${CSS_PREFIX}-popup`"
                        :style="popupSty"
                        v-model="value"
                        :editable="false"
                        type="month"
                        size="medium"
                        placeholder="选择月份"
                        format="yyyy-MM"
                        value-format="yyyy-MM"
                        @change="selectChange">
                    </el-date-picker>
                    <el-date-picker
                        ref="date"
                        v-else-if="dataType==='date'"
                        :class="`${CSS_PREFIX}-popup`"
                        :style="popupSty"
                        v-model="value"
                        :editable="false"
                        type="date"
                        size="medium"
                        placeholder="选择日期"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                        @change="selectChange">
                    </el-date-picker>
                    <el-select 
                        ref="select"
                        v-else-if="dataType==='select'"
                        :class="`${CSS_PREFIX}-popup`"
                        :style="popupSty"
                        v-model="value" 
                        clearable
                        filterable
                        size="medium"
                        :automatic-dropdown="true"
                        @change="selectChange">
                        <el-option v-for="item in selectOptions" :value="item.value" :label="item.label" :key="item.value"></el-option>
                    </el-select>
                    <!-- <el-cascader
                        ref="cascader"
                        v-else-if="dataType==='cascader'"
                        :class="`${CSS_PREFIX}-popup`"
                        :style="popupSty"
                        v-model="cascader_value"
                        size="medium"
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
const COMPLEX_DATE_TYPES = ['month','date','select']

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
            dataType: 'text',
            popWidth: 'auto',
            value: '',
            editorSty: {
                borderColor: 'rgb(82,146,247)'
            },
            cascader_value: [],
            selectOptions: []
        }
    },
    computed: {
        popupSty() {
            return {
                width: this.popWidth,
                top: '-1px'
            }
        },
        isSimple() {
            return SIMPLE_DATE_TYPES.includes(this.dataType)
        }
    },
    methods: {
        getData() {
            return this.grid.getData()
        },
        getCheckedRows() {
            return this.grid.getCheckedRows()
        },
        getChangedRows() {
            return this.grid.getChangedRows()
        },
        setFullScreen(){
            this.grid.resize()
        },
        showEditor(cell) {
            this.show = true
            this.dataType = cell.dataType
            this.selectOptions = cell.options
            this.$refs.text.innerText = cell.value
            if (this.dataType === 'month' || this.dataType === 'date') {
                if (isNaN(cell.value) && !isNaN(Date.parse(cell.value))) {
                    this.value = cell.value
                } else {
                    this.value = ''
                }
            } else {
                this.value = cell.value
            }
            this.setStyle(cell)
            this.$nextTick(() => {
                this.focus()
            })
        },
        hideEditor() {
            this.$refs.editor.style.left = '-10000px'
            this.$refs.editor.style.top = '-10000px'
            this.show = false
            this.dataType = 'text'
        },
        setStyle(cell) {
            this.$refs.editor.style.left = `${cell.x - 1}px`
            this.$refs.editor.style.top = `${cell.y - 1}px`
            this.$refs.text.style['min-width'] = `${cell.width - 2}px`
            this.$refs.text.style['min-height'] = `${cell.height - 2}px`
            this.popWidth = `${cell.width - 2}px`
            if (COMPLEX_DATE_TYPES.includes(this.dataType)) { // 下拉，日期控件高度比输入框高
                this.$refs.editor.style.height = '38px'
            }
        },
        focus(type) {
            let _type = type || this.dataType
            if (this.isSimple) {
                _type = 'text'
            }
            const el = this.$refs[_type]
            if (typeof el.focus === 'function') {
                if (COMPLEX_DATE_TYPES.includes(_type)) {
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