<template>
  <div id="app">
    <div id="data-grid-demo"></div>
    <div style="padding: 12px 0;">
      <el-button size="small" @click="getCheckedRow">获取选中行数据</el-button>
      <el-button size="small" @click="getChangedRow">获取已改变行数据</el-button>
      <el-button size="small" @click="setFullScreen">
        {{!isFullscreen ? '全屏' : '退出全屏'}}
      </el-button>
    </div>
    <DataGrid ref="datagrid" :columns="columns" :data="gridData" :fixed-right="2" :fixed-left="1"></DataGrid>
  </div>
</template>
<script>
// import DataGrid from "./core/DataGrid.js";
import DataGrid from './components/index.vue'
export default {
  name: "App",
  components: { DataGrid },
  data() {
    return {
      isFullscreen: false,
      gridData: [],
      columns: [
        { title: "姓名", key: "emp_name", width: 100 },
        { title: "工号", key: "emp_no", width: 100 },
        { title: "部门", key: "dep_name", width: 140, align: 'left', readonly: true },
        { title: "岗位", 
          key: "job_name", 
          width: 140, 
          align: 'left', 
          rule: { 
            validator: function(value) {
              if (value.length > 10 || value.length < 1) {
                return false
              }
              return true
            }, 
            message: '岗位字段长度需要为0～10个字符哦！' 
          }
        },
        { title: "手机号", key: "phone", width: 100, type: 'phone' },
        { title: "性别", key: "sex", width: 80, type: 'select', options: [
          { value: 1, label: '男' }, 
          { value: 2, label: '女'}
        ] },
        { title: "计薪月份", width: 120, key: "salary_month", type: 'month' },
        { title: "出生日期", width: 140, key: "birthday", type: 'date' },
        // { title: "爱好", width: 140, key: "hobby", type: 'cascader', options: [
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
        { title: 
          "家庭地址", 
          key: "address", 
          width: 150, 
          align: 'left',
          rule: { 
            required: true, 
            message: '该项必填哦！' 
          } 
        },
        { title: "物料编码", 
          key: "materialNo", 
          width: 100, 
          align: 'right' 
        },
        { title: "数量", key: "requiredQuantity", type: "number", width: 70, align: 'right' },
        { title: "单位", key: "unit", width: 70 },
        { title: "工作性质", width: 100, key: "work_type" },
        { title: "工作状态", width: 100, key: "work_status" },
        { title: "户籍城市", width: 100, key: "household_city" },
        { title: "户籍地址", width: 100, key: "household_address" },
        { title: "民族", width: 80, key: "nation" },
        { title: "工作地址", width: 140, key: "work_address" },
        { title: "工作邮箱", width: 140, key: "work_email" },
        { title: "个人邮箱", width: 140, key: "email" },
        { title: "工龄", width: 100, key: "work_age" },
        { title: "司龄", width: 100, key: "company_age" },
        { title: "合同公司", width: 120, key: "contract_company" },
        { title: "qq号", width: 80, key: "qq" },
        { title: "年龄", width: 80, key: "age" },
        { title: "品牌", key: "brandName", width: 80 },
        { title: "商品名称", key: "goodsName", width: 150 },
        { title: "规格型号", key: "sn", width: 100 },
        { title: "客户备注", key: "customerRemarks", width: 150 },
        {
          title: "采购价(元)",
          key: "purchasePrice",
          type: "number",
          width: 80
        },
        { title: "销售价(元)", key: "salePrice", type: "number", width: 100 }
      ]
    };
  },
  methods: {
    setFullScreen() {
      let el = document.getElementById('app')
      if (!this.isFullscreen) {
        this.isFullscreen = true
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
        `
      } else {
        this.isFullscreen = false
        el.style.cssText = `
          position: relative;
        `
      }
      this.$refs.datagrid.setFullScreen()
    },
    getCheckedRow() {
      const data = this.$refs.datagrid.getCheckedRow()
      console.log(data)
      alert('获取成功，请查看控制台')
    },
    getChangedRow() {
      const data = this.$refs.datagrid.getChangedRow()
      console.log(data)
      alert('获取成功，请查看控制台')
    }
  },
  created() {
    // this.$nextTick(() => {
      let el = document.getElementById("data-grid-demo");
      let data = [];
      for (let i = 0; i < 1000; i += 1) {
        data.push({
          emp_name: `张三${i}`,
          emp_no: 10 + i,
          dep_name: i === 4 ? null : `研发部${i}`,
          job_name: i === 5 ? '产品经理测试很长的名字' : `产品经理${i}`,
          phone: i === 4 ? '13159645561a' : 13159645561 + i,
          sex: i % 4 === 0 ? 1 : (i === 3 ? null : 2),
          address:
            i === 1
              ? `海淀区北京路海淀区北京路十分地${i}号`
              : (i === 4 ? '' : `海淀区北京路${i}号`),
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
          hobby: '水果/苹果',
          brandName: `博世${i}`,
          goodsName: `电钻${i}`,
          sn: `SDFSD${i}`,
          materialNo: `1231${i}`,
          unit: "个",
          requiredQuantity: 10,
          customerRemarks: `测试测试${i}`,
          purchasePrice: 10.2 + i,
          salePrice: 12.3 + i
        });
      }
      this.gridData = data

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
