<template>
  <div id="app">
    <div id="data-grid-demo"></div>
    <div style="padding: 12px 0;">
      <el-button size="small" @click="getData">获取数据</el-button>
      <el-button size="small" @click="updateData">更新行数据</el-button>
      <el-button size="small" @click="getCheckedRows">获取选中行数据</el-button>
      <el-button size="small" @click="getChangedRows"
        >获取已改变行数据</el-button
      >
      <el-button size="small" @click="getValidations"
        >获取校验结果</el-button
      >
      <el-button size="small" @click="setValidations"
        >设置校验结果</el-button
      >
      <el-button size="small" @click="clearValidations"
        >清空校验结果</el-button
      >
      <el-button size="small" @click="setFullScreen">
        {{ !isFullscreen ? "全屏" : "退出全屏" }}
      </el-button>
    </div>
    <DataGrid
      ref="datagrid"
      :columns="columns"
      :data="gridData"
      :fixed-left="2"
      :fixed-right="1"
      @after-edit-cell="afterEditCell"
      @after-autofill="afterAutofill"
      @after-paste="afterPaste"
      @after-clear="afterClear"
    ></DataGrid>
  </div>
</template>
<script>
// import DataGrid from "./core/DataGrid.js";
import DataGrid from "./components/index.vue";
export default {
  name: "App",
  components: { DataGrid },
  data() {
    return {
      isFullscreen: false,
      gridData: [],
      columns: []
    };
  },
  methods: {
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
    getData() {
      const data = this.$refs.datagrid.getData();
      console.log(data);
      alert("获取成功，请查看控制台");
    },
    updateData() {
      const data = [
        {
          id: 1,
          'emp_name': '数据111',
          'emp_no': '数据222'
        },
        {
          id: 3,
          'job_name': '数据333',
          'emp_no': '数据444'
        }
      ]
      this.$refs.datagrid.updateData(data);
    },
    afterEditCell(data) {
      console.log(data)
    },
    afterAutofill(data) {
      console.log(data)
    },
    afterPaste(data) {
      console.log(data)
    },
    afterClear(data) {
      console.log(data)
    },
    getCheckedRows() {
      const data = this.$refs.datagrid.getCheckedRows();
      console.log(data);
      alert("获取成功，请查看控制台");
    },
    getChangedRows() {
      const data = this.$refs.datagrid.getChangedRows();
      console.log(data);
      alert("获取成功，请查看控制台");
    },
    getValidations() {
      const data = this.$refs.datagrid.getValidations();
      console.log(data);
      alert("获取成功，请查看控制台");
    },
    setValidations() {
      const errors = [
        {
          id: 1,
          'emp_name': '错误111',
          'emp_no': '错误222'
        },
        {
          id: 3,
          'job_name': '错误333',
          'emp_no': '错误444'
        }
      ]
      this.$refs.datagrid.setValidations(errors);
    },
    clearValidations() {
      this.$refs.datagrid.clearValidations();
    }
  },
  created() {
    const columns = [
      { title: "姓名", key: "emp_name" },
      { title: "工号", key: "emp_no", type: 'number' },
      {
        title: "部门",
        key: "dep_name",
        size: "small",
        align: "left",
        readonly: true
      },
      {
        title: "岗位",
        key: "job_name",
        size: "small",
        align: "left",
        rule: {
          required: true,
          validator: function(value, row, callback) {
            if (value.length > 10) {
              callback('岗位字段长度必须小于10个字符哦！')
            } else if (value.length < 1) {
              callback('岗位字段长度必须填哦！')
            } else {
              callback()
            }
          },
          immediate: false
        }
      },
      { title: "手机号", key: "phone", type: "phone" },
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
        key: "sex",
        type: "select",
        options: [
          { value: 1, label: "男" },
          { value: 2, label: "女" }
        ],
        rule: {
          required: true
        }
      },
      {
        title: "计薪月份",
        size: "small",
        key: "salary_month",
        type: "month",
        align: "center" 
      },
      { title: "出生日期", size: "small", key: "birthday", type: "date" },
      // { title: "爱好", size: 'small', key: "hobby", type: 'cascader', options: [
      //   {
      //     value: '1',
      //     label: '水果',
      //     children: [
      //       {
      //         value: '11',
      //         label: '苹果'
      //       },
      //       {
      //         value: '12',
      //         label: '香蕉'
      //       }
      //     ]
      //   },
      //   {
      //     value: '2',
      //     label: '书籍',
      //     children: [
      //       {
      //         value: '21',
      //         label: 'web前端',
      //         children: [
      //           {
      //             value: '211',
      //             label: 'Javascript程序设计',
      //           },
      //           {
      //             value: '212',
      //             label: 'NodeJs实战',
      //           }
      //         ]
      //       },
      //       {
      //         value: '22',
      //         label: '后端开发'
      //       }
      //     ]
      //   }
      // ] },
      {
        title: "家庭地址",
        key: "address",
        size: "medium",
        align: "left",
        rule: {
          required: true,
          message: "该项必填哦！"
        }
      },
      {
        title: "请假开始时间",
        size: "small",
        key: "start_dt",
        type: "datetime"
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
        type: "number",
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
        key: "purchasePrice",
        type: "number"
      },
      { title: "销售价(元)", key: "salePrice", type: "number", size: "small" }
    ]
    // this.$nextTick(() => {
    let el = document.getElementById("data-grid-demo");
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

    // const Grid = new DataGrid(el, {
    //   // width: 1264,
    //   // height: 400,
    //   fixedLeft: 1,
    //   fixedRight: 2,
    //   columns: this.columns,
    //   data
    // });
    // });
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
  padding: 0;
  margin: 0;
}
</style>
