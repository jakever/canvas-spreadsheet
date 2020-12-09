<template>
    <div
        ref="table"
        :class="s.gridTable">
        <div :class="s.gridTableHeader">
            <slot name="custom-column" />
            <div
                ref="pagnationBox"
                v-if="$slots.tips || $slots['right-group'] || showTopPager"
                :class="s.tableTopBar">
                <div :class="s.boxLeft">
                    <small-pagnation
                        v-if="showTopPager && total_count > minSize"
                        :class="s.smPagnation"
                        :current-page="p"
                        :total-page="totalPage"
                        :next="nextPage"
                        :prev="prevPage" />
                    <slot name="tips" />
                </div>
                <slot name="right-group" />
            </div>
        </div>
        <GridTable
            ref="gridTable"
            v-bind="$attrs"
            :empty-text="emptyText"
            :loading="loading"
            :height="customHeight"
            :custom-columns="columns"
            :data="list"
            :class="s.table"
            :row-key="rowKey"
            :summary-method="interceptors.summary"
            :divider="divider"
            :show-summary="showSummary"
            :min-height="minHeight"
            :footer-padding="footerPadding"
            @select-change="handleSelect"
            @expanded-change="handleExpanded">
            <slot />
            <div
                v-if="this.$slots.empty"
                slot="empty"
                :class="s.empty">
                <slot name="empty" />
            </div>
            <template v-if="this.$slots.emptyText" slot="emptyText">
                <slot name="emptyText" />
            </template>
        </GridTable>
        <el-pagination
            v-if="showPagination && total_count > minSize"
            ref="pagination"
            layout="prev, pager, next, sizes, total"
            :total="total_count"
            :current-page.sync="p"
            :page-sizes="pageSize"
            :page-size.sync="limit"
            background
            border
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange">
        </el-pagination>
    </div>
</template>

<script>
import smallPagnation from './small-pagnation.vue'
import GridTable from './table.vue'
// const { api, util: { lodash: { debounce, isEqual } } } = Vue.$ctx
import { isEqual, debounce } from 'lodash'
import axios from 'axios'

export default {
    name: 'ComGirdable',
    components: {
        GridTable,
        smallPagnation
    },
    props: {
        url: String, // 请求 url，若为空则不请求数据，地址改变会重新请求数据
        methods: {
            type: String,
            default: 'get'
        },
        rowKey: String,
        showTopPager: { // 是否显示顶部分页
            type: Boolean,
            default: false
        },
        showPagination: { // 是否显示分页
            type: Boolean,
            default: true
        },
        // 底部留的高度 默认16px
        footerPadding: {
            type: Number,
            default: 32
        },
        auto: {
            type: Boolean,
            default: true
        },
        // autoQuery: { // 自动替换 query 参数
        //     type: Boolean,
        //     default: false
        // },
        emptyText: {
            type: String
        },
        showSummary: {
            type: Boolean
        },
        customHeight: {
            type: [
                Number,
                String
            ]
        },
        divider: {
            type: Boolean,
            default: true
        },
        minHeight: [
            Number,
            String
        ],
        columns: {
            type: Array,
            default: () => []
        },
        query: { // 查询字段，属性变化会重新请求数据
            type: Object,
            default: () => { }
        },
        interceptors: { // 拦截器
            type: Object,
            default() {
                return {
                    summary: () => { }
                }
            }
        },
        pageSize: {
            type: Array,
            default() {
                return [
                    10,
                    20,
                    30,
                    50
                ]
            }
        }
    },
    data() {
        return {
            once: true, // 是否第一次调用 getList
            oldParams: {},
            loading: true,
            list: [],
            p: 1,
            limit: 10,
            total_count: 0
        }
    },
    computed: {
        minSize() {
            return this.pageSize[0]
        },
        totalPage() {
            return Math.ceil(this.total_count / this.limit)
        },
        params() {
            return {
                p: this.p,
                limit: this.limit || 10,
                ...this.query
            }
        }
    },
    watch: {
        limit(val) {
            this.p = 1
            localStorage.setItem('DM_DATATABLE_PAGE_SIZE', val || 10)
        },
        query: {
            async handler(val, oldVal) {
                if (!this.auto) return false
                const { p, limit, ...newQuery } = val
                const { p: p1, limit: limit1, ...oldQuery } = oldVal
                if (!isEqual(newQuery, oldQuery)) {
                    await this.getList()
                    // this.replaceQuery()
                }
            },
            deep: true
        },
        url(val) {
            this.getList()
        }
    },
    methods: {
        resetP() {
            this.p = 1
            this.$emit('current-change', 1)
        },
        handleSizeChange(limit) {
            this.$emit('size-change', limit)
            this.resetP()
            this.getList({ p: 1, limit })
        },
        handleCurrentChange(p) {
            this.$emit('current-change', p)
            this.getList({ p })
        },
        // 解析 location.search 参数并重置相关 data
        // resetData() {
        //     const { query } = this.$router.currentRoute.query
        //     if (query) {
        //         const queryJSON = JSON.parse(query)
        //         this.p = queryJSON && Number(queryJSON.p) || 1
        //         this.limit = queryJSON && Number(queryJSON.limit) || 10
        //     }
        // },
        getList(args = {}) {
            const params = { ...this.params, ...args }
            const { p, limit, ...newQuery } = params
            const { p: p1, limit: limit1, ...oldQuery } = this.oldParams
            // 如果非首次调用 getList 且query参数发生变化，则重置 p
            if (!this.once && !isEqual(newQuery, oldQuery)) {
                this.resetP()
                params.p = 1
            }
            this.once = false
            this.oldParams = params
            this.getListHandle(params)
        },
        // 获取列表数据和列表总数
        async getListHandle(params) {
            if (!this.url) return false
            let data
            this.loading = true
            try {
                if (this.methods === 'get') {
                    data = await axios.get(this.url, {
                        params,
                        headers: {'accesstoken': '4mbiqv2549rn3nlvidesb4sqdoqfp22g'}
                    })
                } else {
                    data = await axios.post(this.url, {
                        ...params,
                        body: this.body
                    })
                }
                if (this.interceptors.post) {
                    data = this.interceptors.post(data)
                }
                const { objects, total_count } = data.data.data
                this.total_count = total_count
                this.list = objects
                // this.$refs.gridTable.reload()
            } catch (e) {
                console.warn(e)
            } finally {
                this.loading = false
            }
        },
        // 替换 location.search 的内容
        // replaceUrl(query) {
        //     const { name, params } = this.$router.currentRoute
        //     this.$router.replace({
        //         name,
        //         params,
        //         query
        //     })
        // },
        // 替换 location.search 中的 query 参数
        // replaceQuery() {
        //     if (!this.autoQuery) return false
        //     const { query } = this.$router.currentRoute
        //     const complex = query.query
        //         ? { ...JSON.parse(query.query), ...this.params }
        //         : this.params
        //     const optQuery = { ...query, query: JSON.stringify(complex) }
        //     this.replaceUrl(optQuery)
        // },
        // 刷新列表数据
        refresh(resetPage, p) {
            if (resetPage) {
                this.p = 1
            }
            if (p) {
                this.p = p
            }
            this.getList()
        },
        clearSelect() {
            this.$refs.gridTable.clearSelect()
        },
        selectAll() {
            this.$refs.gridTable.selectAll()
        },
        toggleSelect(rowKey, selected) {
            this.$refs.gridTable.toggleSelect(rowKey, selected)
        },
        handleSelect(...args) {
            this.$emit('select-change', ...args)
        },
        handleExpanded(...args) {
            this.$emit('expanded-change', ...args)
        },
        nextPage() {
            if (this.p === this.totalPage) return false
            this.p++
            this.handleCurrentChange(this.p)
        },
        prevPage() {
            if (this.p === 1) return false
            this.p--
            this.handleCurrentChange(this.p)
        }
    },
    async mounted() {
        this.limit = Number(localStorage.getItem('DM_DATATABLE_PAGE_SIZE')) || 10
        this.p = 1
        // this.resetData() // 根据 location.search 重置 data 参数
        if (this.auto) {
            await this.getList()
        }
        // this.replaceQuery() // 替换 location.search query 参数
    }
}
</script>

<style lang="scss" module="s">
.gridTable {
    width: 100%;
    position: relative;
    margin-top: 16px;

    .table {
        margin: 0 0 24px;
    }

    .pagnationBox {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding: 0;
        margin: 0;
        // margin: 16px 0;
    }

    .boxLeft {
        display: flex;
        align-items: flex-end;
    }

    .tableTopBar {
        margin-bottom: 16px;
    }

    .smPagnation {
        margin-right: 10px;
    }

    .gridTableHeader {
        position: relative;
    }

    .empty {
        position: absolute;
        left: 0;
        right: 1px;
        bottom: 1px;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
