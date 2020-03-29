<template>
    <div class="data-grid">
        <div id="data-grid__el"></div>
        <div class="data-grid__editor" v-show="show" ref="editor">
            <el-date-picker
                ref="date"
                class="data-grid__cell--editor"
                v-if="dateType==='date'"
                :style="popupSty"
                v-model="value"
                :editable="false"
                type="date"
                size="mini"
                placeholder="选择日期">
            </el-date-picker>
            <el-select 
                ref="select"
                class="data-grid__cell--editor"
                v-else-if="dateType==='select'"
                :style="popupSty"
                v-model="value" 
                size="mini"
                :automatic-dropdown="true">
                <el-option v-for="item in selectOptions" :value="item.value" :label="item.label" :key="item.value"></el-option>
            </el-select>
        </div>
    </div>
</template>
<script>
import DataGrid from '../core/DataGrid.js'
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
            show: false,
            dateType: 'text',
            width: 'auto',
            value: '',
            selectOptions: [
                { value: 111, label: '测试111' },
                { value: 222, label: '测试222' },
                { value: 333, label: '测试333' },
            ]
        }
    },
    computed: {
        popupSty() {
            return {
                width: this.width
            }
        }
    },
    methods: {
        startEdit(cell) {
            this.dateType = cell.dateType
            this.value = cell.value
            this.width = `${cell.width - 2}px`
            this.setPosition(cell)
            this.show = true
            this.$nextTick(() => {
                this.focus()
            })
        },
        setPosition(cell) {
            this.$refs.editor.style.left = `${cell.x + 2}px`
            this.$refs.editor.style.top = `${cell.y + 2}px`
        },
        focus(type) {
            const _type = type || this.dateType
            if (typeof this.$refs[_type].focus === 'function') {
                this.$refs[_type].focus()
            }
        },
    },
    created() {
        this.$nextTick(() => {
            let el = document.getElementById("data-grid__el");
            new DataGrid(el, {
              fixedLeft: this.fixedLeft,
              fixedRight: this.fixedRight,
              columns: this.columns,
              data: this.data,
              onEditCell: (cell) => {
                  this.startEdit(cell)
              },
              onSelectCell: () => {
                  this.show = false
                  this.dateType = 'text'
              }
            });
        })
    }
}
</script>
<style lang="scss">
.data-grid{
    position: relative;
}
.data-grid__editor {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 100;
    height: 27px;
    overflow: hidden;
}
.data-grid__cell--editor {
    input[type="text"] {
        border: none;
        outline: none;
        border-radius: 0;
    }
}
</style>