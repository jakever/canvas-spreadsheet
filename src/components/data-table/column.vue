<script>
export default {
    name: 'DTableGridColumn',
    props: {
        business_type: String,
        showTooltip: Boolean, // 内容超出显示tooltip
        align: [Boolean, String], // 对齐方式
        fixed: [Boolean, String], // 固定列
        label: String, // 表头内容
        property: String, // 获取数据对应key
        width: Number, // 宽度
        actions: {
            type: Array,
            default() {
                return []
            }
        },
        renderColumn: Function,
        linkAction: Function,
        cardRender: Function
    },
    provide() {
        return {
            'dTableColumn': this
        }
    },
    inject: {
        'dTable': { default: null },
        'dTableColumn': { default: null }
    },
    data() {
        return {
            column: {}
        }
    },
    render(h) {
        // 初始化为一个空div节点，用于计算列顺序
        return h('div', this.$slots.default)
    },
    computed: {
    },
    methods: {
        getColumnAction() {
            let links = []
            let dropdown = []
            if (this.business_type === 'link') {
                links = {
                    handler: ({ row, rowIndex }) => {
                        typeof this.linkAction === 'function' && this.linkAction({ row, rowIndex })
                    },
                    cardRender: (pos, { row, rowIndex }) => {
                        if (typeof this.cardRender === 'function') {
                            const vnode = this.cardRender(this.$createElement, { row, rowIndex })
                            this.dTable.updatePoptip(pos, vnode)
                        }
                    }
                }
            } else if (this.business_type === 'action'){
                this.actions.forEach(item => {
                    if (item.type === 'link') {
                        links.push(item)
                    }
                    if (item.type === 'dropdown') {
                        dropdown = item.list
                    }
                })
            }
            
            return {
                links,
                dropdown
            }
        }
    },
    created() {
        const self = this
        const { links, dropdown } = this.getColumnAction()
        this.column = {
            business_type: this.business_type,
            property: this.property,
            label: this.label,
            showTooltip: this.showTooltip,
            align: this.align,
            width: this.width,
            fixed: this.fixed === true ? 'left' : this.fixed,
            links,
            dropdown
            // ...columnAction
            // updateColumn: (data) => {
            //     if (self.$scopedSlots.default) {
            //         const vnode = self.$scopedSlots.default(data)
            //         if (self.type === 'action') {
            //             self.dTable.renderDropdown(vnode)
            //         } else if (self.type === 'expand') {

            //         } else {
            //             self.column.render = () => vnode[0] ? vnode[0].text : ''
            //         }
            //     } else if (typeof self.renderColumn === 'function') {
            //         const vnode2 = self.renderColumn.call(self._renderProxy, self.$createElement, data)
            //         self.dTable.renderDropdown(vnode2)
            //     }
            // }
        }
        if (dropdown.length) {
            this.dTable.renderDropdown(dropdown)
        }
    },
    mounted() {
        let columnIndex // 计算列的位置
        
        if (this.dTableColumn) {
            columnIndex = [].indexOf.call(this.dTableColumn.$el.children, this.$el)
            this.dTable.addColumnConfig({
                ...this.column,
                fixed: this.dTableColumn.column.fixed // 嵌套节点继承父节点fixed属性
            }, columnIndex, this.dTableColumn.column)
        } else {
            columnIndex = [].indexOf.call(this.dTable.$refs.hiddenColumns.children, this.$el)
            this.dTable.addColumnConfig(this.column, columnIndex)
        }
    }
}
</script>