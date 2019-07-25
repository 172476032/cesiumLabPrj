import config from "../config";
import Vue from "vue";

function getValFromItem(item, info) {
  let regexp = /\${(\S*?)\}/g;
  let secName = /\￥(\S*?)\}/g;
  let val;
  if (item.values) {
    val = info[item.key];
    val = item.values[val] || val;
  } else {
    if (item.key && item.key.match(secName)) {
      // 存在￥}
      let name;
      let arrTotal = item.key.match(secName);
      for (var i = 0; i < arrTotal.length; i++) {
        let arrVal = arrTotal[i].substring(1, arrTotal[i].length - 1); // 取出￥}内的内容
        if (info[arrVal]) {
          name = info[arrVal];
        }
      }
      // console.log(name)
      val = name;
    } else if (item.key && item.key.match(regexp)) {
      // 存在${}
      let arrTotal2 = item.key.match(regexp);
      // console.log(arrTotal2)
      let arrVal2 = arrTotal2[0].substring(2, arrTotal2[0].length - 1);
      if (
        isNaN(info[arrVal2]) &&
        info[arrVal2] > parseInt(info[arrVal2]) &&
        info[arrVal2] < parseInt(info[arrVal2]) + 1
      ) {
        info[arrVal2] = info[arrVal2].toFixed(2); //限制小数点后两位
      }
      val =
        info[arrVal2] || info[arrVal2] == "Null"
          ? item.key.replace(regexp, function(match, p1, p2, p3) {
              return info[p1];
            })
          : "";
    } else {
      val = info[item.key];
    }
  }
  val = val == ("Null" || "null") ? "" : val;
  return val;
}

function getFirstName(config) {
  let secName = /\￥(\S*?)\}/g;
  let name = config.title;
  if (name.match(secName)) {
    let arrTotal = name.match(secName);
    name = arrTotal[0].substring(1, arrTotal[0].length - 1);
  }
  return name;
}

function getConfigByFeature(feature) {
  let locateDetailConfig = config["$STORE"].state.query.locateDetailConfig;
  let realname = feature.realname_;
  let curConfig = locateDetailConfig[realname];
  return curConfig;
}

function getNameFromItem(feature) {
  let curConfig = getConfigByFeature(feature);
  let info = feature.values_;
  let name;
  if (curConfig && curConfig.title) {
    let item = {
      key: curConfig.title
    };
    name = getValFromItem(item, info);
  } else {
    name =
      info.NAME ||
      info["名称"] ||
      info["水电站名称"] ||
      info["水库名称"] ||
      info["泵站名称"];
  }
  return name;
}

function getPosFromItem(feature) {
  let curConfig = getConfigByFeature(feature);
  let info = feature.values_;
  let position;
  if (curConfig && curConfig.position) {
    let item = {
      key: curConfig.position
    };
    position = getValFromItem(item, info);
    if (position) {
      position = position.trim();
    }
  }
  return position;
}

function getIconFromItem(feature) {
  let curConfig = getConfigByFeature(feature);
  if (curConfig && curConfig.icon) {
    return `cj-icon-layer-${curConfig.icon}`;
  } else {
    return "cj-icon-layer-villige";
  }
}

// function convertToAliases(item, fieldAliases) {
//     let result = {};
//     for (let key in item) {
//         if (fieldAliases[key]) {
//             result[fieldAliases[key]] = item[key];
//         } else {
//             result[key] = item[key];
//         }
//     }
//     return result;
// }

function getChildren(list, parentId) {
  let children = list.filter(o => {
    return o.id && o.parent === parentId;
  });
  children.forEach((item, index) => {
    let children = getChildren(list, item.id);
    // item.index = 10000 - item.id;
    if (children.length > 0) {
      // 使用vue.set() 赋值对象属性，否则不能触发computed
      Vue.set(item, "children", children);
    }
    // item.title = item.name;
    // item.children = getChildren(item.id);
  });
  return children;
}

var maxIndex = 1000;
var geometryTypeList = [0, 0, 0, 0, 0];

function setLayerIndex(v) {
  // v.index = --maxIndex;
  // 将图层类型geometryType分为四类
  // 1、注记图层，在最上面，zindex是800~1000
  // 2、点图层，在第二层级，zindex是600~800
  // 3、线图层，在第三层级，zindex是400~600
  // 4、面图层，在第四层级，zindex是200~400
  // 5、undefined图层，在第最低层，zindex是0~200
  switch (v.geometryType) {
    case "annotation":
      v.index = 1000 - geometryTypeList[0];
      geometryTypeList[0]++;
      break;
    case "point":
      v.index = 800 - geometryTypeList[1];
      geometryTypeList[1]++;
      break;
    case "line":
      v.index = 600 - geometryTypeList[2];
      geometryTypeList[2]++;
      break;
    case "polygon":
      v.index = 400 - geometryTypeList[3];
      geometryTypeList[3]++;
      break;
    default:
      v.index = 200 - geometryTypeList[4];
      geometryTypeList[4]++;
      break;
  }
}

/**
 * 公共函数
 * 设置图层显示顺序
 *
 * @param {Array} item 树节点
 * @param {Boolean} isRoot 是否为根节点
 */
function setZIndex(item, isRoot) {
  //当maxIndex小于100时，重新给它赋值，避免 < 0时，导致图层zindex为负时，图层不可见
  if (isRoot) {
    maxIndex = 1000;
    geometryTypeList = [0, 0, 0, 0, 0];
  }

  _.forEach(item, (v, i) => {
    // console.log("遍历图层，设置index: ", v);

    if (v.children && v.children.length != 0) {
      setZIndex(v.children, false);
    } else if (v.layer) {
      setLayerIndex(v);
      if (v.zjLayer) {
        setLayerIndex(v.zjLayer);
      }
      if (v.otherLayer) {
        setLayerIndex(v.otherLayer);
      }
    }
  });
}

function convertTreeData(data) {
  data.forEach((item, i) => {
    if (item.pId || item.pId == 0) {
      item.parent = item.pId;
      delete item.pId;
    }
    if (!item.order) {
      item.order = i;
    }
  }, this);
  // console.log(data);
  return getChildren(data, 0);
}

export {
  getValFromItem,
  getNameFromItem,
  getPosFromItem,
  getIconFromItem,
  getFirstName,
  getChildren,
  setZIndex,
  convertTreeData
  // convertToAliases
};
