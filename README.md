# canvas-spreadsheet
> 基于Canvas的一款高性能在线编辑组件，拥有仿Excel的复制粘贴、拖拽柄、实时编辑、6种不同数据类型、基本数据校验等功能

## Examples
Please try it on [Live Demo](https://harlen.cn/canvas-spreadsheet/?_blank).

### Screenshot
![image](/assets/images/canvas-spreadsheet.gif)

## Feature
- [x] 支持（文本、数字、电话、邮箱、日期、下拉）6种基本数据类型
- [x] 支持6种数据类型的格式校验及实时错误提示
- [x] 单元格内容支持（左、中、右）三种对齐方式
- [x] 单元格数据编辑、选区
- [x] 批量复制、粘贴数据
- [x] 拖拽柄拖拽自动填充（Autofill）
- [x] 单元格内容自定义渲染函数，基本的文本转换
- [x] 指定列支持锁定，不可编辑
- [x] 当前焦点单元格所在行、列高亮
- [x] 冻结表头、左侧、右侧冻结列
- [x] 支持行勾选
- [x] 单元格内容溢出显示样式支持（随内容自适应高度、内容隐藏）2种显示方式
- [x] 随屏幕尺寸响应式渲染
- [x] 模拟滚动条
- [x] Tab键、方向键快速切换
- [x] 复合表头
- [ ] 数据类型增加`级联组件`、`下拉多选`两种类型
- [ ] Context menu右键功能菜单
- [ ] 历史记录的撤销与恢复（CTRL+Z、CTRL+Y／CTRL+Z、CTRL+SHIFT+Z）

## Usage
### Example for basic usage
```html
<template>
    <DataGrid
        ref="datagrid"
        :columns="columns"
        :data="gridData"
        :fixed-left="2"
        :fixed-right="1"
    ></DataGrid>
</template>
<script>
export default {
  data() {
    return {
        gridData: [],
        columns: [
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
                key: "delivery_info"
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
                align: "right",
                rule: {
                message: "请输入数字，且不能超过2为小数！"
                }
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
    };
  },
  methods: {
  },
  created() {
    let data = [];
    for (let i = 0; i < 1000; i += 1) {
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
    this.gridData = data;
  }
};
</script>
```
### Example for Composite header（复合表头）
![image](/assets/images/complex-header.png)

要实现复合表头只需在相应的表头数据中添加children字段即可，支持多层嵌套：
```js
{ 
    title: "配送信息", 
    key: "delivery_info",
    children: [
      {
        title: "寄件人", 
        key: "delivery_name",
      },
      {
        title: "配送地址", 
        key: "delivery_address",
        children: [
          {
            title: "省", 
            key: "province",
          },
          {
            title: "市", 
            key: "city",
          },
          {
            title: "区", 
            key: "region",
          }
        ]
      }
    ]
}
```

## Props
| 参数      | 说明    | 类型      | 可选值       | 默认值   |
|---------- |-------- |---------- |-------------  |-------- |
| rowKey | 每行数据的唯一标识 | String |   | id |
| width  | 编辑器外层容器宽度 | Number |   | 视窗宽 |
| height | 编辑器外层容器高度 | Number |   | 视窗高 |
| showCheckbox  | 是否开启勾选行功能 | Boolean |   | false |
| fixedLeft | 左侧冻结的列数 | Number |  | 0 |
| fixedRight | 右侧冻结的列数 | Number |  | 0 |
| columns | 表头列配置，参考[Columns Props](https://github.com/jakever/canvas-spreadsheet#columns-props) | Array |  |  |
| data | 表格源数据 | Array |   |  |

## Columns Props
| 参数      | 说明    | 类型      | 可选值       | 默认值   |
|---------- |-------- |---------- |-------------  |-------- |
| title | 列的显示名称 | String |   |  |
| key  | 列的取值key | String |   |  |
| size | 列宽 |  String  |  mini／small／medium／large  | mini |
| align | 列内容水平对齐方式 | String | left／center／right  | left |
| readonly | 列是否锁定，不可编辑 | Boolean |  |    |
| type | 列的数据源类型，type为除text之外的其他类型拥有内置的校验规则 | String  |  text／number／phone／email／select／month／date／datetime | text |
| options | 列数据源类型为`select`时必须提供 | Array  |   |     |
| render | 列内容自定义渲染函数，函数参数为该列数据值  | Function |   |     |
| rule | 自定义数据校验规则，参考[Columns Rule Props](https://github.com/jakever/canvas-spreadsheet#columns-rule-props) | Object  |   |     |

## Columns Rule Props
| 参数      | 说明    | 类型      | 可选值       | 默认值   |
|---------- |-------- |---------- |-------------  |-------- |
| required  | 表示必填   | Boolean  |   |     |
| message  | 数据格式错误提示文案   | String  |   |     |
| immediate  | 编辑器初始化时否立即校验 | Boolean  |   | true |
| validator | 自定义校验规则，若为Function（支持异步），则接收3个参数：第一个参数是当前焦点单元格的数据，第二个参数是当前焦点行的数据，第三个参数是callback函数（定义校验结果或者错误提示信息，优先级高于message字段），参考[自定义Validator](https://github.com/jakever/canvas-spreadsheet#zi-ding-yi-validator-li-zi-ru-xia)    | Function／RegExp  |   |   |

### 自定义Validator例子如下：
```js
// 1. 定义统一的错误message
{ title: "部门", 
    key: "dep_name", 
    size: 'small',
    align: 'left',
    rule: { 
        message: '部门字段长度需要为0～10个字符哦！',
        immediate: false,
        validator: function(value, row, callback) {
            if (value.length > 10) {
                callback(false)
            } else {
                callback()
            }
        }
    }
},
// 2. 定义不同的错误message
{ title: "岗位", 
    key: "job_name", 
    size: 'small',
    align: 'left',
    rule: { 
        message: '岗位字段长度需要为0～10个字符哦！',
        immediate: false,
        validator: function(value, row, callback) {
            if (value.length > 10) {
                callback('岗位字段长度必须小于10个字符哦！')
            } else if (value.length < 1) {
                callback('岗位字段长度必须填哦！')
            } else {
                callback()
            }
        }
    }
},
```

## Methods
> 通过`$refs`实例调用

| 方法名称      | 说明    | 参数      |
|---------- |-------- |---------- |
| getData | 获取表格所有数据 |   |
| getCheckedRows | 获取已勾选的数据 |   |
| getChangedRows | 获取仅发生改变的数据 |   |
| updateData | 更新表格数据 |  Array：需要更新的数据集合 |
| validate | 校验整个表格数据 |  callback函数，函数参数接收一个Boolean类型的校验结果值 |
| validateField | 校验指定行、指定列的单元格数据是否正确，返回一个Boolean类型的校验结果值 |  x,y，需要校验的数据单元格横坐标和纵坐标 |
| validateChanged | 校验仅发生改变的数据  | callback函数，函数参数接收一个Boolean类型的校验结果值  |
| getValidations | 获取整个表格中校验失败的单元格集合  |   |
| setValidations | 设置数据校验错误结果，可以用于将后端校验后的结果批量回填到组件中 |  Array：错误数据集合 |
| clearValidations | 清空全部校验结果 |  |

### validate使用例子如下：
```js
this.$refs.datagrid.validate(valid => {
    if (valid) {
        // TODO 校验成功，继续你的操作
    }
})
```
### setValidations使用例子如下：
```js
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
```

## Events
| 事件名称      | 说明    | 回调参数      |
|---------|--------|---------|
| before-select-cell | 选取单元格之前触发 | Array: 当前选中区域单元格集合的数据 |
| after-select-cell | 选取单元格之后触发 | Array: 当前选中区域单元格集合的数据 |
| before-edit-cell | 编辑单元格之前触发 | Object: 当前单元格所在行的数据 |
| after-edit-cell | 编辑完单元格之后触发 | Object: 当前单元格所在行的数据 |
| before-select-row | 选取行之前触发 | Array: 当前选取行的数据 |
| after-select-row | 选取行之后触发 | Array: 当前选取行的数据 |
| before-resize-column | 调整列宽之前触发 |  |
| after-resize-column | 调整列宽之后触发 |  |
| before-resize-row | 调整行高之前触发 |  |
| after-resize-row | 调整行高之后触发 |  |
| before-autofill | 自动填充数据之前触发 | Array: 当前填充区域单元格集合所在行的数据 |
| after-autofill | 自动填充数据之后触发 | Array: 当前填充区域单元格集合所在行的数据 |
| before-copy | 复制数据之前触发 | Array: 当前复制区域单元格所在行的数据集合 |
| after-copy | 复制数据之后触发 | Array: 当前复制区域单元格集合所在行的数据 |
| before-paste | 粘贴数据之前触发 | Array: 当前粘贴区域单元格集合所在行的数据 |
| after-paste | 粘贴数据之后触发 | Array: 当前粘贴区域单元格集合所在行的数据 |
| after-clear | 清空单元格数据后触发 | Array: 当前清空区域单元格集合所在行的数据 |
| on-load | 数据网格Dom加载完后触发 |  |

## Development
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```