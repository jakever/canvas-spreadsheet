const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; //0 = A, 25 = Z

const iToA = i => {
  let current = i;

  let a = "";

  while (current > -1) {
    let digit = current % 26;
    a = alpha[digit] + "" + a;

    //This is not a straight number base conversion, we need to
    //treat A as
    current = Math.floor(current / 26) - 1;
  }

  return a;
};

const aToI = a => {
  let index = (alpha.indexOf(a[0]) + 1) * Math.pow(26, a.length - 1) - 1;

  for (let i = a.length - 1; i > 0; i--) {
    index += (alpha.indexOf(a[i]) + 1) * Math.pow(26, a.length - i - 1);
  }

  return index;
};

/*
 ** 获取叶子节点数组
 */
const toLeaf = (arr = []) => {
  let tmp = []
  arr.forEach(item => {
      if (item.children) {
          tmp = tmp.concat(toLeaf(item.children))
      } else {
          tmp.push(item)
      }
  })
  return tmp
}
/*
 ** 获取最大深度
 */
const getMaxRow = (config) => {
  if (config) {
      return config.map(item => {
          return getMaxRow(item.children) + 1
      }).sort((a, b) => b - a)[0]
  } else {
      return 0
  }
}
/*
 ** 根据数据结结构层级关系计算复合表头的跨行、跨列数
 */
const calCrossSpan = (arr = [], maxRow, level = 0) => {
  if (maxRow === undefined) {
    maxRow = getMaxRow(arr)
  }

  if (arr) {
    return arr.map((config) => {
      if (config.children) {
        let colspan = 0
        const children = calCrossSpan(config.children, maxRow - 1, level + 1)

        children.forEach((item) => {
          colspan += item.colspan
        })

        return {
          level,
          rowspan: 1,
          colspan,
          ...config,
          children
        }
      } else {
        return {
          level,
          rowspan: maxRow,
          colspan: 1,
          ...config
        }
      }
    })
  }
}

export {
  toLeaf,
  getMaxRow,
  calCrossSpan
}