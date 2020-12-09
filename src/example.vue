<template>
  <div id="app">
    <div id="data-grid-demo"></div>
    <div style="padding: 12px 0;">
      <el-button size="small" @click="getCheckedRows">获取选中行数据</el-button>
      <el-button size="small" @click="setFullScreen">
        {{ !isFullscreen ? "全屏" : "退出全屏" }}
      </el-button>
    </div>
    <TableGrid
      ref="datagrid"
      :data="gridData"
      :fixed-left="1"
      :fixed-right="1"
    >
        <TableGridColumn label="姓名" property="emp_name"></TableGridColumn>
        <TableGridColumn label="工号">
          <template v-slot="{ emp_no }">
            {{'自定义' + emp_no}}
          </template>
        </TableGridColumn>
        <TableGridColumn label="部门" property="dep_name"></TableGridColumn>
        <TableGridColumn label="岗位" property="job_name"></TableGridColumn>
        <TableGridColumn label="手机号" property="phone"></TableGridColumn>
        <TableGridColumn label="配送信息" property="delivery_info"></TableGridColumn>
        <TableGridColumn label="性别" property="sex"></TableGridColumn>
        <TableGridColumn label="计薪月份" property="salary_month"></TableGridColumn>
        <TableGridColumn label="出生日期" property="birthday"></TableGridColumn>
        <TableGridColumn label="家庭地址" property="address"></TableGridColumn>
        <TableGridColumn label="请假开始时间" property="start_dt"></TableGridColumn>
        <TableGridColumn label="物料编码" property="materialNo"></TableGridColumn>
        <TableGridColumn label="数量" property="requiredQuantity"></TableGridColumn>
        <TableGridColumn label="单位" property="unit"></TableGridColumn>
        <TableGridColumn label="工作性质" property="work_type"></TableGridColumn>
        <TableGridColumn label="工作状态" property="work_status"></TableGridColumn>
        <TableGridColumn label="户籍城市" property="household_city"></TableGridColumn>
        <TableGridColumn label="户籍地址" property="household_address"></TableGridColumn>
        <TableGridColumn label="民族" property="nation"></TableGridColumn>
        <TableGridColumn label="工作地址" property="work_address"></TableGridColumn>
        <TableGridColumn label="工作邮箱" property="work_email"></TableGridColumn>
        <TableGridColumn label="个人邮箱" property="email"></TableGridColumn>
        <TableGridColumn label="工龄" property="work_age"></TableGridColumn>
        <TableGridColumn label="司龄" property="company_age"></TableGridColumn>
        <TableGridColumn label="合同公司" property="contract_company"></TableGridColumn>
        <TableGridColumn label="qq号" property="qq"></TableGridColumn>
        <TableGridColumn label="年龄" property="age"></TableGridColumn>
        <TableGridColumn label="品牌" property="brandName"></TableGridColumn>
        <TableGridColumn label="商品名称" property="goodsName"></TableGridColumn>
        <TableGridColumn label="规格型号" property="sn"></TableGridColumn>
        <TableGridColumn label="客户备注" property="customerRemarks"></TableGridColumn>
        <TableGridColumn label="采购价(元)" property="purchasePrice"></TableGridColumn>
        <TableGridColumn label="销售价(元)" property="salePrice"></TableGridColumn>
        <TableGridColumn label="操作" :width="120" type="action" :actions="columnActions">
        </TableGridColumn>
    </TableGrid>
  </div>
</template>
<script>
import TableGrid from "./components/data-table/table.vue";
import TableGridColumn from "./components/data-table/column.vue"
export default {
  name: "App",
  components: { 
    TableGrid,
    TableGridColumn
  },
  data() {
    return {
      isFullscreen: false,
      gridData: [],
      columns: []
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
        label: '编辑2',
        type: 'link',
        handler({ row, rowIndex }) {
          console.log(row, rowIndex)
        }
      }, {
        type: 'dropdown',
        list: [{
          label: '导入',
          handler({ row, rowIndex }) {
            console.log(row, rowIndex)
          } 
        }, {
          label: '导出',
          handler({ row, rowIndex }) {
            console.log(row, rowIndex)
          }
        }]
      }]
    }
  },
  methods: {
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
    getRow(data) {
      console.log(data, '~~~');
    }
  },
  created() {
    const columns = [
      { title: "姓名", key: "emp_name" },
      { title: "工号", key: "emp_no" },
      {
        title: "部门",
        key: "dep_name",
        size: "small",
        align: "left"
      },
      {
        title: "岗位",
        key: "job_name",
        size: "small",
        align: "left"
      },
      { title: "手机号", key: "phone" },
      { 
        title: "配送信息", 
        key: "delivery_info",
        // children: [
        //   {
        //     title: "寄件人", 
        //     key: "delivery_name",
        //   },
        //   {
        //     title: "配送地址", 
        //     key: "delivery_address",
        //     children: [
        //       {
        //         title: "省", 
        //         key: "province",
        //       },
        //       {
        //         title: "市", 
        //         key: "city",
        //       },
        //       {
        //         title: "区", 
        //         key: "region",
        //       }
        //     ]
        //   }
        // ]
      },
      {
        title: "性别",
        key: "sex"
      },
      {
        title: "计薪月份",
        size: "small",
        key: "salary_month",
        align: "center" 
      },
      { title: "出生日期", size: "small", key: "birthday" },
      {
        title: "家庭地址",
        key: "address",
        size: "medium",
        align: "left"
      },
      {
        title: "请假开始时间",
        size: "small",
        key: "start_dt"
      },
      {
        title: "物料编码",
        key: "materialNo",
        align: "right",
        render: function(val) {
          const v = parseFloat(val);
          return v.toFixed(2);
        }
      },
      {
        title: "数量",
        key: "requiredQuantity",
        align: "right"
      },
      { title: "单位", key: "unit" },
      { title: "工作性质", key: "work_type" },
      { title: "工作状态", key: "work_status" },
      { title: "户籍城市", key: "household_city" },
      { title: "户籍地址", key: "household_address" },
      { title: "民族", key: "nation" },
      { title: "工作地址", size: "small", key: "work_address" },
      { title: "工作邮箱", size: "small", key: "work_email" },
      { title: "个人邮箱", size: "small", key: "email" },
      { title: "工龄", key: "work_age" },
      { title: "司龄", key: "company_age" },
      { title: "合同公司", size: "small", key: "contract_company" },
      { title: "qq号", key: "qq" },
      { title: "年龄", key: "age" },
      { title: "品牌", key: "brandName" },
      { title: "商品名称", key: "goodsName" },
      { title: "规格型号", key: "sn" },
      { title: "客户备注", key: "customerRemarks", size: "small" },
      {
        title: "采购价(元)",
        key: "purchasePrice"
      },
      { title: "销售价(元)", key: "salePrice", size: "small" }
    ]
    let data = [];
    for (let i = 0; i < 100; i += 1) {
      data.push({
        id: i,
        emp_name: `张三${i}`,
        emp_no: 10 + i,
        dep_name: i === 4 ? null : `研发部${i}`,
        job_name: i === 5 ? "产品经理测试很长的名字" : `产品经理${i}`,
        phone: i === 4 ? "13159645561a" : `${13159645561 + i}`,
        sex: i % 4 === 0 ? 1 : i === 3 ? null : 2,
        address:
          i === 1
            ? `海淀区北京路海淀区北京路十分地${i}号`
            : i === 4
            ? ""
            : `海淀区北京路${i}号`,
        work_type: `兼职${i}`,
        work_status: `在职${i}`,
        household_city: `深圳${i}`,
        household_address: `深南大道${i}号`,
        nation: `汉${i}`,
        work_address: `南京路${i}号`,
        work_email: `${28976633 + i}@qq.com`,
        email: `${4465566 + i}@qq.com`,
        work_age: 2 + i,
        company_age: 1 + i,
        contract_company: `飞鸟物流公司${i}`,
        qq: 35860567 + i,
        salary_month: `${1996 + i}-09`,
        birthday: `${1996 + i}-09-21`,
        age: 1 + i,
        hobby: "水果/苹果",
        brandName: `博世${i}`,
        goodsName: `电钻${i}`,
        sn: `SDFSD${i}`,
        materialNo: `1231${i}`,
        unit: "个",
        requiredQuantity: 10,
        customerRemarks: `测试测试${i}`,
        purchasePrice: 10.2 + i,
        salePrice: 12.3 + i,
        delivery_name: `王麻子${i}`,
        delivery_address: `民族大道${i}号`,
        province: `湖北省${i}`
      });
    }
    this.columns = columns;
    // setTimeout(() => {
      this.gridData = data;
    // }, 2000)
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
