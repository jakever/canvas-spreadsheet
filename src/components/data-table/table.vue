  <!-- <div :class="CSS_PREFIX">
    <div :class="`${CSS_PREFIX}-hiddenColumns`" ref="hiddenColumns">
      <slot></slot>
    </div>
    <div :class="[`${CSS_PREFIX}-main`, border ? 'border' : '']">
      <canvas
        :id="`${CSS_PREFIX}-target`"
        :class="`${CSS_PREFIX}-table`"
      ></canvas>
      <div
        :class="`${CSS_PREFIX}-overlayer`"
        :style="{ top: `${tableHeaderHeight+1}px` }"
        v-loading="loading"
      >
        <div :class="`${CSS_PREFIX}-dropdown`" ref="dropdown">
          <ul class="dropdown-menu">
            <template v-for="(item, index) in dropdownMenu">
              <li 
                :key="index"
                @click="item.handler({ row: rowData, rowIndex })">
                <span>{{item.label}}</span>
              </li>
            </template>
            <div :class="['arrow', 'dropdown-arrow']"></div>
          </ul>
        </div>
        <div :class="`${CSS_PREFIX}-poptip`" ref="poptip">
          <div class="popper">
            <div class="popper-inner">
              <slot name="popper"></slot>
            </div>
            <div :class="['arrow','popper-arrow']"></div>
          </div>
        </div>
      </div>
    </div>
  </div> -->
<script>
import { CSS_PREFIX, HEADER_HEIGHT } from "./core/constants.js";
import { getMaxRow } from './core/util.js'
import DataGrid from "./core/DataGrid.js";

export default {
  name: "DTableGrid",
  props: {
    loading: {
      type: Boolean,
      default: false
    },
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
    footerPadding: {
      type: Number,
      default: 0
    },
    showSummary: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: false
    },
    divider: {
      type: Boolean,
      default: false
    },
    width: Number,
    height: Number,
    minHeight: Number,
    maxHeight: Number,
    customColumns: {
      type: Array,
      default: () => []
    },
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
      rowIndex: -1,
      showPop: false,
      content: '',
      dropdownMenu: [],
      columns: [], // 所有列原始配置
      rowData: null
    };
  },
  watch: {
    columns(val) {
      if (this.isConfig) {
        this.grid.loadColumns(val)
        this.grid.loadData(this.data);
      }
    },
    smartColumns(val) {
      if (!this.isConfig) {
        this.grid.loadColumns(val)
        this.grid.loadData(this.data);
      }
    },
    data(val) {
      this.grid.loadColumns(this.isConfig ? this.columns : this.smartColumns)
      this.grid.loadData(val);
      this.reload()
    }
  },
  computed: {
    isConfig() {
      return !!this.$slots.default
    },
    tableHeaderHeight() {
      const maxHeaderRow = getMaxRow(this.isConfig ? this.columns : this.customColumns)
      return HEADER_HEIGHT * maxHeaderRow
    },
    smartColumns() {
      let arr = []
      this.customColumns.forEach(item => {
        let links = []
        let dropdown = []
        if (item.business_type === 'link') {
            links = {
                handler: ({ row, rowIndex }) => {
                    typeof item.linkAction === 'function' && item.linkAction({ row, rowIndex })
                },
                cardRender: (pos, { row, rowIndex }) => {
                    if (typeof item.cardRender === 'function') {
                        const vnode = item.cardRender(this.$createElement, { row, rowIndex })
                        this.updatePoptip(pos, vnode)
                    }
                }
            }
        } else if (item.business_type === 'action'){
          item.actions.forEach(item => {
            if (item.type === 'link') {
                links.push(item)
            }
            if (item.type === 'dropdown') {
                dropdown = item.list
            }
          })
        }
        arr.push({
          ...item,
          links,
          dropdown
        })
      })
      return arr
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
    renderDropdown(config) {
      this.dropdownMenu = config
    },
    showDropdown(pos, { row, rowIndex } = { row: null, rowIndex: -1 }) {
      this.rowData = row
      this.rowIndex = rowIndex
      this.$refs.dropdown.style.right = `${pos.x}px`;
      this.$refs.dropdown.style.top = `${pos.y - this.tableHeaderHeight}px`;
    },
    showPoptip(pos, value = false) {
      this.showPop = value
      this.$refs.poptip.style.left = `${pos.x}px`;
      this.$refs.poptip.style.top = `${pos.y - this.tableHeaderHeight}px`;
    },
    updatePoptip(pos, content) {
      // this.$slots.popper = [vnode]
      if (content._isVue) {
          const component = content.$mount().$children[0] || {}
          this.content = component.$vnode
      } else {
          this.content = content
      }
      this.showPoptip(pos, true)
      this.$nextTick(() => {
        this.updatePoptipStyle(this.$refs.popper.offsetHeight / 2)
      })
    },
    updatePoptipStyle(height) {
      const top = parseFloat(this.$refs.poptip.style.top)
      this.$refs.poptip.style.top = `${top - height}px`;
    }
  },
  render(h) {
    const self = this
    const topSty = { 
      top: `${this.tableHeaderHeight+1}px` 
    }
    return (
      <div class={this.CSS_PREFIX}>
        <div class={`${this.CSS_PREFIX}-hiddenColumns`} ref="hiddenColumns">
          {this.$slots.default}
        </div>
        <div class={[`${this.CSS_PREFIX}-main`, this.border ? 'border' : '']}>
          <canvas
            id={`${this.CSS_PREFIX}-target`}
            class={`${this.CSS_PREFIX}-table`}
          ></canvas>
          <div
            class={`${this.CSS_PREFIX}-overlayer`}
            style={topSty}
            v-loading={this.loading}
          >
            <div class={`${this.CSS_PREFIX}-dropdown`} ref="dropdown">
              <ul class="dropdown-menu">
              {
                this.dropdownMenu.map(item => 
                  <li 
                    on-click={() => { item.handler({ row: this.rowData, rowIndex: this.rowIndex }) }}>
                    <span>{item.label}</span>
                  </li>
                )
              }
                <div class={['arrow', 'dropdown-arrow']}></div>
              </ul>
            </div>
            <div class={`${this.CSS_PREFIX}-poptip`} ref="poptip">
              {
                this.showPop && <div class="popper" ref="popper">
                  <div class="popper-inner">
                    {this.content}
                  </div>
                  <div class={['arrow','popper-arrow']}></div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  },
  created() {
    this.$nextTick(() => {
      const self = this;
      let el = document.getElementById(`${CSS_PREFIX}-target`);

      this.grid = new DataGrid(el, {
        rowKey: this.rowKey,
        gridWidth: this.width,
        gridHeight: this.height,
        minHeight: this.minHeight,
        border: this.border,
        divider: this.divider,
        footerPadding: this.footerPadding,
        fixedLeft: this.fixedLeft,
        fixedRight: this.fixedRight,
        showSummary: this.showSummary,
        columns: this.isConfig ? this.columns : this.smartColumns,
        data: this.data,
        afterCheckRow: (data) => {
          self.$emit('select-change', data)
        },
        showDropdown: (pos, data) => {
          self.showDropdown(pos, data)
        },
        showPoptip: (pos, data) => {
          self.showPoptip(pos, data)
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