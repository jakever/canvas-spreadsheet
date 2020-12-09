<template>
  <div id="app">
    <div style="padding: 12px 0;">
      <el-button size="small" @click="getCheckedRows">获取选中行数据</el-button>
      <el-button size="small" @click="setFullScreen">
        {{ !isFullscreen ? "全屏" : "退出全屏" }}
      </el-button>
    </div>
    <ComGridTable
      ref="datagrid"
      url="https://api-dev.2haohr.com/payroll/basic/salary_info_of_emp/"
      :query="query"
      :fixed-left="1"
      :fixed-right="1"
      :show-top-pager="true"
      row-key="emp_id"
      @select-change="handleSelect"
    >
        <GridTableColumn :width="80" property="head_img_url" business_type="avatar"></GridTableColumn>
        <template v-for="(item, index) in headers">
            <GridTableColumn 
              :label="item.field_name" 
              :property="item.field_key" 
              :business_type="item.field_key === 'emp_name' ? 'link' : ''" 
              :key="index"
              :link-action="linkAction"
              :card-render="cardRender">
            </GridTableColumn>
        </template>
        <GridTableColumn label="地址" :width="80" property="address" :format="columnFormat"></GridTableColumn>
        <GridTableColumn label="操作" :width="80" business_type="action" :actions="columnActions">
        </GridTableColumn>
    </ComGridTable>
  </div>
</template>
<script>
import ComGridTable from "./components/data-table/com-grid-table.vue";
import GridTableColumn from "./components/data-table/column.vue"
import empCard from './emp-card.vue'
import axios from 'axios'
export default {
  name: "App",
  components: { 
    ComGridTable,
    GridTableColumn,
    empCard
  },
  data() {
    return {
      isFullscreen: false,
      query: {
        work_status: 6,
        order_by: 'dep_name'
      },
      headers: [],
      columnFormat: {
        color: '#ccc',
        'font-size': '16px',
        'background-color': '#e1e1e1'
      }
    };
  },
  computed: {
    columnActions() {
      return [{
        label: '编辑',
        type: 'link',
        handler({ row, rowIndex }) {
          console.log(row, rowIndex)
        }
      }, {
        type: 'dropdown',
        list: [{
          label: '发送考勤确认',
          handler({ row, rowIndex }) {
            console.log(row, rowIndex)
          } 
        }, {
          label: '删除',
          handler({ row, rowIndex }) {
            console.log(row, rowIndex)
          }
        }]
      }]
    }
  },
  methods: {
    linkAction({ row, rowIndex }) {
      console.log(row, rowIndex);
    },
    cardRender(h, { row, rowIndex }) {
      return (
        <empCard
          query={{
            year: 2020,
            month: 5,
            emp_id: row.emp_id
          }}>
        </empCard>
      )
    },
    getCheckedRows() {
      const data = this.$refs.datagrid.getCheckedRows();
      console.log(data);
      alert("获取成功，请查看控制台");
    },
    setFullScreen() {
      let el = document.getElementById("app");
      if (!this.isFullscreen) {
        this.isFullscreen = true;
        el.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          min-height: 100vh;
          background: #fff;
          z-index: 2000;
          overflow: hidden;
        `;
      } else {
        this.isFullscreen = false;
        el.style.cssText = `
          position: relative;
        `;
      }
      this.$refs.datagrid.setFullScreen();
    },
    handleSelect(data) {
      console.log(data, '~~~');
    },
    async getHeaders() {
        const data = await axios.get('https://dev.2haohr.com/api/payroll/month/month_header/', {
            params: {
                salary_template_id: 'b4f2186d376e4dd284bd805442c17b25',
                year: 2020,
                month: 5
            },
            headers: {'accesstoken': '4mbiqv2549rn3nlvidesb4sqdoqfp22g'}
        })
        this.headers = data.data.data.headers
    }
  },
  created() {
    this.getHeaders()
  }
};
</script>

<style lang="scss">
body {
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 32px;
  margin: 0;
}
</style>
