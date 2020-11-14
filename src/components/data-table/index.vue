<template>
  <div :class="CSS_PREFIX">
    <div :class="`${CSS_PREFIX}-hiddenColumns`" ref="hiddenColumns">
      <slot></slot>
    </div>
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
        <div :class="`${CSS_PREFIX}-editor`" ref="editor">
          <slot name="dropdown"></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { CSS_PREFIX, HEADER_HEIGHT } from "./core/constants.js";
import { getMaxRow } from './core/util.js'
import DataGrid from "./core/DataGrid.js";

export default {
  name: "DTableGrid",
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
    // columns: {
    //   type: Array,
    //   default() {
    //     return [];
    //   }
    // },
    data: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  provide() {
    return {
      dTable: this
    }
  },
  data() {
    return {
      CSS_PREFIX,
      loading: false,
      columns: [], // 所有列原始配置
    };
  },
  watch: {
    // columns(val) {
    //   this.grid.loadColumns(val)
    //   this.grid.loadData(this.data);
    // },
    data(val) {
      this.grid.loadColumns(this.columns)
      this.grid.loadData(val);
      this.loading = false;
    }
  },
  computed: {
    tableHeaderHeight() {
      const maxHeaderRow = getMaxRow(this.columns)
      return HEADER_HEIGHT * maxHeaderRow
    }
  },
  methods: {
    reload() {
      return this.grid.resize()
    },
    setFullScreen() {
      this.grid.resize();
    },
    // 增加列配置
    addColumnConfig(column, index, columns) {
      if (!columns) {
          columns = this.columns
      } else {
          columns.children = columns.children || []
          columns = columns.children
      }
      columns.splice(index, 0, column)
    },
    // renderCell(data) {
    //   this.columns.forEach(item => {
    //     item.updateColumn(data)
    //   })
    // },
    renderDropdown(config) {
      this.$slots.dropdown = (
        <el-dropdown>
            <a class="operateIcon">
              <span></span>
              <span></span>
              <span></span>
          </a>
          <el-dropdown-menu slot="dropdown">
          {
            config.map(item => 
              <el-dropdown-item><span on-click={() => {item.handler()}}>{item.label}</span></el-dropdown-item>
            )
          }
          </el-dropdown-menu>
        </el-dropdown>
      )
    },
    showDropdown({ x, y }) {
      this.$refs.editor.style.left = `${x - 1}px`;
      this.$refs.editor.style.top = `${y - 2 - this.tableHeaderHeight}px`;
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
        // beforeRenderRow: data => {
        //   self.renderCell(data)
        // },
        showDropdown: cell => {
          self.showDropdown(cell)
        },
        onLoad: () => {
          // 推入事件队列中延迟执行
          setTimeout(() => {
            self.$emit('on-load')
          }, 0)
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