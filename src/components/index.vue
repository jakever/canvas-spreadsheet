<template>
  <div :class="CSS_PREFIX" v-clickoutside="handleclickoutside" @paste="doPaste">
    <div :class="`${CSS_PREFIX}-main`">
      <canvas
        :id="`${CSS_PREFIX}-target`"
        :class="`${CSS_PREFIX}-table`"
      ></canvas>
      <div
        :class="`${CSS_PREFIX}-overlayer`"
        :style="{ top: `${tableHeaderHeight+1}px` }"
        v-loading="loading"
      >
        <div :class="`${CSS_PREFIX}-editor`" ref="editor" :style="editorSty">
          <div
            ref="text"
            contenteditable="true"
            v-show="isSimple"
            @input="inputHandler"
            @keydown.tab.prevent 
            @keydown.enter.prevent 
            @keydown.esc.prevent
          ></div>
          <el-date-picker
            ref="month"
            v-if="dataType === 'month'"
            :class="`${CSS_PREFIX}-popup`"
            :style="popupSty"
            v-model="value"
            :editable="false"
            type="month"
            size="medium"
            placeholder="选择月份"
            format="yyyy-MM"
            value-format="yyyy-MM"
            @change="selectChange"
          >
          </el-date-picker>
          <el-date-picker
            ref="date"
            v-else-if="dataType === 'date'"
            :class="`${CSS_PREFIX}-popup`"
            :style="popupSty"
            v-model="value"
            :editable="false"
            type="date"
            size="medium"
            placeholder="选择日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            @change="selectChange"
          >
          </el-date-picker>
          <el-date-picker
            ref="datetime"
            v-else-if="dataType === 'datetime'"
            :class="`${CSS_PREFIX}-popup`"
            :style="popupSty"
            v-model="value"
            :editable="false"
            type="datetime"
            size="medium"
            placeholder="选择日期时间"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
            @change="selectChange"
          >
          </el-date-picker>
          <el-select
            ref="select"
            v-else-if="dataType === 'select'"
            :class="`${CSS_PREFIX}-popup`"
            :style="popupSty"
            v-model="value"
            clearable
            filterable
            size="medium"
            :automatic-dropdown="true"
            @change="selectChange"
          >
            <el-option
              v-for="item in selectOptions"
              :value="item.value"
              :label="item.label"
              :key="item.value"
            ></el-option>
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
import { CSS_PREFIX, HEADER_HEIGHT } from "../core/constants.js";
import { getMaxRow } from '../core/util.js'
import DataGrid from "../core/DataGrid.js";
import Clickoutside from './clickoutside.js'
const SIMPLE_DATE_TYPES = ["text", "number", "phone", "email"];
const COMPLEX_DATE_TYPES = ["month", "date", "datetime", "select"];

export default {
  name: "DDataGrid",
  props: {
    rowKey: {
      type: String,
      default: 'id'
    },
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
        return [];
      }
    },
    data: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  directives: {
    Clickoutside
  },
  data() {
    return {
      CSS_PREFIX,
      loading: false,
      show: false,
      dataType: "text",
      popWidth: "auto",
      isEditing: false,
      isPaste: false,
      value: "",
      editorSty: {
        borderColor: "rgb(82,146,247)"
      },
      focusCell: null,
      cascader_value: [],
      selectOptions: []
    };
  },
  watch: {
    columns(val) {
      this.grid.updateColumns(val)
      this.grid.loadData(this.data);
    },
    data(val) {
      this.grid.updateColumns(this.columns)
      this.grid.loadData(val);
      this.loading = false;
    }
  },
  computed: {
    tableHeaderHeight() {
      const maxHeaderRow = getMaxRow(this.columns)
      return HEADER_HEIGHT * maxHeaderRow
    },
    popupSty() {
      return {
        width: this.popWidth,
        top: "-1px"
      };
    },
    isSimple() {
      return SIMPLE_DATE_TYPES.includes(this.dataType);
    }
  },
  methods: {
    reload() {
      return this.grid.resize()
    },
    getData() {
      return this.grid.getData();
    },
    getCheckedRows() {
      return this.grid.getCheckedRows();
    },
    getChangedRows() {
      return this.grid.getChangedRows();
    },
    validate(callback) {
      return this.grid.validate(callback);
    },
    validateChanged(callback) {
      return this.grid.validateChanged(callback);
    },
    validateField(ci, ri) {
      return this.grid.validateField(ci, ri);
    },
    getValidations() {
      return this.grid.getValidations();
    },
    setValidations(errors) {
      return this.grid.setValidations(errors);
    },
    clearValidations() {
      return this.grid.clearValidations();
    },
    updateData(data) {
      return this.grid.updateData(data);
    },
    setFullScreen() {
      this.grid.resize();
    },
    editCell() {
      const {
        dataType,
        options,
        value
      } = this.focusCell
      this.show = true;
      this.dataType = dataType;
      this.selectOptions = options;
      this.$refs.text.innerHTML = value;
      this.grid.setTempData(value)
      if (this.dataType === "month" || this.dataType === "date" || this.dataType === "datetime") {
        if (isNaN(value) && !isNaN(Date.parse(value))) {
          this.value = value;
        } else {
          this.value = "";
        }
      } else {
        this.value = value;
      }
      this.showEditor();
      this.$nextTick(() => {
        this.focus();
      });
    },
    selectCell(cell) {
      this.focusCell = cell
      this.clearEditor()
      this.hideEditor();
      this.$nextTick(() => {
        this.focus();
      });
    },
    showEditor() {
      const {
        x,
        y,
        width,
        height
      } = this.focusCell
      this.isEditing = true
      this.$refs.editor.style.left = `${x - 1}px`;
      this.$refs.editor.style.top = `${y - 2 - this.tableHeaderHeight}px`;
      this.$refs.text.style["min-width"] = `${width - 1}px`;
      this.$refs.text.style["min-height"] = `${height - 1}px`;
      this.popWidth = `${width - 1}px`;
      if (COMPLEX_DATE_TYPES.includes(this.dataType)) {
        // 下拉，日期控件高度比输入框高
        this.$refs.editor.style.height = "38px";
      }
    },
    hideEditor() {
      this.isEditing = false
      this.$refs.editor.style.left = "-10000px";
      this.$refs.editor.style.top = "-10000px";
      this.show = false;
      this.dataType = "text";
    },
    clearEditor() {
      this.$refs.text.innerHTML = ''
    },
    focus(type) {
      let _type = type || this.dataType;
      if (this.isSimple) {
        _type = "text";
      }
      const el = this.$refs[_type];
      if (typeof el.focus === "function") {
        if (COMPLEX_DATE_TYPES.includes(_type)) {
          el.focus();
        } else {
          if (window.getSelection) {
            // ie11 10 9 ff safari
            el.focus(); // 解决ff不获取焦点无法定位问题
            const range = window.getSelection(); // 创建range
            range.selectAllChildren(el); // range 选择obj下所有子内容
            range.collapseToEnd(); // 光标移至最后
          } else if (document.selection) {
            // ie10以下
            const range = document.selection.createRange(); // 创建选择对象
            // var range = document.body.createTextRange();
            range.moveToElementText(el); // range定位到obj
            range.collapse(false); // 光标移至最后
            range.select();
          }
        }
      }
    },
    doPaste() {
      // 粘贴事件标识
      this.isPaste = true
    },
    inputHandler(e) {
      /**
       * 复制粘贴的基本原理：直接监听可编辑元素（这里是contenteditable=true的div）的
       * input事件，按下CTRL+V会先触发paste事件，接着会触发input事件，在paste事件中
       * 定义一个标识，这样在input事件就可以区分内容是通过粘贴来的还是手动输入的
       */
      const val = e.target.innerText;
      if (!this.isPaste) {
        this.showEditor()
        this.grid.setTempData(val)
      } else if (!this.isEditing) {
        this.isPaste = false

        let textArr = [];
        let arr = val.split("\r");
        if (arr.length === 1) {
          let _arr = arr[0].split("\n");
          textArr = _arr.map(item => item.split("\t"));
        } else {
          textArr = arr.map(item => item.split("\t"));
        }

        // 通过table的格式进行粘贴解析
        // const objE = document.createElement('div')
        // objE.innerHTML = e.target.innerHTML
        // const dom = objE.childNodes
        // e.target.innerHTML = ''
        // const pasteData = []
        // const modifyData = []
        // for (let i = 0; i < dom.length; i += 1) {
        //     if (dom[i].tagName === 'TABLE') {
        //         const trs = dom[i].querySelectorAll('tr')
        //         for (const tr of trs) {
        //             const arrTmp = []
        //             for (const td of tr.cells) {
        //                 let str = td.innerText
        //                 str = str.replace(/^\s+|\s+$/g, '')
        //                 arrTmp.push(str)
        //                 const colspan = td.getAttribute('colspan')
        //                 if (colspan) {
        //                     for (let i = 1; i < colspan; i += 1) {
        //                         arrTmp.push('')
        //                     }
        //                 }
        //             }
        //             pasteData.push(arrTmp)
        //         }
        //     } else {
        //         pasteData.push([this.val])
        //     }
        // }

        this.grid.pasteData(textArr)
      } else {
        this.isPaste = false
        this.grid.setTempData(val)
      }
    },
    selectChange(val) {
      this.grid.setTempData(val)
    },
    handleclickoutside() {
      this.grid.doneEdit()
    }
  },
  created() {
    this.loading = this.data.length > 0 ? false : true;
    this.$nextTick(() => {
      const self = this;
      let el = document.getElementById(`${CSS_PREFIX}-target`);

      this.grid = new DataGrid(el, {
        rowKey: this.rowKey,
        width: this.width,
        height: this.height,
        fixedLeft: this.fixedLeft,
        fixedRight: this.fixedRight,
        columns: this.columns,
        data: this.data,
        beforeSelectCell: () => {},
        afterSelectCell: (cell) => {
          self.selectCell(cell)
        },
        beforeMultiSelectCell: () => {},
        afterMultiSelectCell: () => {},
        beforeEditCell: () => {
          self.editCell();
        },
        afterEditCell: (data) => {
          self.$emit('after-edit-cell', data)
        },
        afterAutofill: (data) => {
          self.$emit('after-autofill', data)
        },
        afterPaste: (data) => {
          self.$emit('after-paste', data)
        }
      });
    });
  },
  destroyed() {
    this.grid.events.destroy()
  }
};
</script>
<style lang="scss" src="./index.scss"></style>