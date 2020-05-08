<template>
  <div id="app">
    <div id="data-grid-demo"></div>
    <!-- <canvas id="data-grid-demo"></canvas> -->
  </div>
</template>
<script>
import DataGrid from "./core/DataGrid.js";
export default {
  name: "App",
  components: { DataGrid },
  data() {
    return {
      scrollX: 0,
      scrollY: 0,
      gridGata: [],
      columns: [
        { title: "姓名", key: "emp_name", width: 100 },
        { title: "工号", key: "emp_no", width: 100 },
        { title: "部门", key: "dep_name", width: 140, readonly: true },
        { title: "岗位", key: "job_name", width: 140 },
        { title: "手机号", key: "phone", width: 100 },
        { title: "性别", key: "sex", width: 80 },
        { title: "家庭地址", key: "address", width: 150 },
        { title: "物料编码", key: "materialNo", width: 100, align: "right" },
        {
          title: "数量",
          key: "requiredQuantity",
          type: "number",
          width: 70,
          align: "right"
        },
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
        { title: "生日", width: 80, key: "birthday" },
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
    init() {
      this.draw();
      window.requestAnimationFrame(this.init.bind(this));
    },
    bindEvent() {
      const self = this;
      this.ctx.canvas.onmousewheel = e => {
        if (e.deltaY > 0) {
          self.scrollY -= 2 * e.deltaY;
        } else if (e.deltaY < 0) {
          if (self.scrollY <= 2 * e.deltaY) {
            self.scrollY -= 2 * e.deltaY;
          }
        }

        if (e.deltaX > 0) {
          self.scrollX -= 2 * e.deltaX;
        } else if (e.deltaX < 0) {
          if (self.scrollX <= 2 * e.deltaX) {
            self.scrollX -= 2 * e.deltaX;
          }
        }
        e.preventDefault();
      };
    },
    drawText() {},
    draw() {
      this.ctx.beginPath();
      this.ctx.fillStyle = "#f8f8f9";
      this.ctx.strokeStyle = "#333";
      this.ctx.rect(0, 0, 1264, 400);
      this.ctx.fill();

      this.ctx.rect(100 + this.scrollX, 30 + this.scrollY, 100, 30);
      this.ctx.stroke();

      this.ctx.fillStyle = "#333";
      this.ctx.fillText(
        "Hello World!!!",
        100 + this.scrollX,
        30 + this.scrollY
      );
      // this.ctx.drawImage(this.textCanvas, 0, 0)
    }
  },
  created() {
    this.$nextTick(() => {
      // let el = document.getElementById("data-grid-demo");
      // this.textCanvas = document.createElement('canvas');
      // this.textCtx = this.textCanvas.getContext('2d');
      // this.textCtx.fillStyle = '#000';
      // this.textCtx.textAlign = 'center';
      // this.textCtx.textBaseline = 'middle';
      // this.textCtx.fillText('Hello World123', 0, 0);

      // el.width = 1264 * 2
      // el.height = 400 * 2
      // el.style.width = '1264px'
      // el.style.height = '400px'
      // this.ctx = el.getContext('2d')
      // this.ctx.scale(2,2)
      // this.bindEvent()
      // this.init()

      let data = [];
      for (let i = 0; i < 5000; i += 1) {
        data.push({
          emp_name: `张三${i}`,
          emp_no: 10 + i,
          dep_name: `研发部${i}`,
          job_name: `产品经理${i}`,
          phone: 1385964556 + i,
          sex: i % 4 === 0 ? "男" : "女",
          address:
            i === 0
              ? `海淀区北京路海淀区北京路十分地${i}号`
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
          birthday: 1 + 1,
          age: 1 + i,
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

        this.gridGata = data;
      }

      // const Grid = new DataGrid(el, {
      //   // width: 1264,
      //   // height: 400,
      //   fixedLeft: 1,
      //   fixedRight: 2,
      //   columns: this.columns,
      //   data
      // });
    });
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
