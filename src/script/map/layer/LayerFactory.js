/*
 * @CreateTime: Oct 13, 2017 9:25 AM
 * @Author: zhangzh
 * @Contact: zhang910818@163.com
 * @Last Modified By: zhangzh
 * @Last Modified Time: Oct 13, 2017 4:25 PM
 * @Description: 图层生产工厂类
 */

import ThematicLayer from "./tile/ThematicLayer";
import VectorThematicLayer from "./vector/VectorThematicLayer";
import VectorGifThematicLayer from "./vector/VectorGifThematicLayer";
import VectorTileThematicLayer from "./vector/VectorTileThematicLayer";
import WmtsThematicLayer from "./tile/WmtsThematicLayer";
import BaseLayer from "./base/BaseLayer";
import BaiduBaseLayer from "./base/BaiduBaseLayer";
import WmtsBaseLayer from "./base/WmtsBaseLayer";
import WmtsArcgisTheLayer from "./tile/WmtsArcgisThematicLayer";
import WmtsLayer from "./tile/WmtsLayer";

// ESPG:4490 ESPG:4326
const scaleDenominatorsAll = [
  590995186.1175001,
  295497593.05875003,
  147748796.52937502,
  73874398.264687508,
  36937199.132343754,
  18468599.566171877,
  9234299.7830859385,
  4617149.8915429693,
  2308574.9457714846,
  1154287.4728857423,
  577143.73644287116,
  288571.86822143558,
  144285.93411071779,
  72142.967055358895,
  36071.483527679447,
  18035.741763839724,
  9017.8708819198619,
  4508.9354409599309,
  2254.4677204799655,
  1127.2338602399827,
  563.61693011999137
];

const scaleDenominatorsAllSupermap = [
  295829355.4545657,
  147914677.72728285,
  73957338.86364143,
  36978669.43182071,
  18489334.715910356,
  9244667.357955178,
  4622333.678977589,
  2311166.8394887946,
  1155583.4197443973,
  577791.7098721986,
  288895.8549360993,
  144447.92746804966,
  72223.96373402483,
  36111.981867012415,
  18055.990933506208,
  9027.995466753104,
  4513.997733376552,
  2256.998866688276,
  1128.499433344138,
  564.249716672069
];

// const scaleDenominatorsAllSupermap = [5.590822640287176E8, 2.795411320143588E8,
//         1.397705660071794E8, 6.98852830035897E7, 3.494264150179485E7, 1.7471320750897426E7,
//         8735660.375448713, 4367830.187724357, 2183915.0938621783, 1091957.5469310891,
//         545978.7734655446, 272989.3867327723, 136494.69336638614, 68247.34668319307,
//         34123.673341596535, 17061.836670798268, 8530.918335399134];

/**
 * 加工完善WMTS配置
 *
 * @param {Object} v
 */
function processWmtsConfig(config, type) {
  if (!config.offsetZoom && config.offsetZoom != 0) {
    config.offsetZoom = 5;
  }
  if (!config.scaleDenominators) {
    let endZoom = config.endZoom || 16;
    let length = endZoom - config.offsetZoom + 1;
    let scaleAll =
      type == "supermap-wmts" ?
      scaleDenominatorsAllSupermap :
      scaleDenominatorsAll;
    // let scaleAll = scaleDenominatorsAll;
    config.scaleDenominators = new Array(length);
    for (let i = 0; i < length; i++) {
      config.scaleDenominators[i] = scaleAll[i + config.offsetZoom];
    }
  }
  if (!config.originCoord) {
    config.originCoord = [-180, 90];
  }
  if (!config.bottomLeft) {
    config.bottomLeft = [-180.0, -90.0];
  }
  if (!config.topRight) {
    config.topRight = [180.0, 90.0];
  }
  if (!config.matrixSet) {
    config.matrixSet = "default028mm";
  }
  if (!config.style) {
    config.style = "default";
  }
  if (!config.equatorialRadius) {
    // 6378137 6370984
    config.equatorialRadius = type === "supermap-wmts" ? 6378137 : 6370984;
  }
}

/**
 * 加工完善WMTS 图层配置
 * 解决配置文件中存在大量重复配置项的问题
 *
 * @param {Object} v
 */
function processLayerConfig(v) {
  ["layerConfigs", "zjLayerConfig", "otherLayerConfigs"].forEach(configName => {
    let layerConfigs = v[configName];
    if (layerConfigs) {
      if (layerConfigs instanceof Array) {
        layerConfigs.forEach(config => {
          processWmtsConfig(config, v.type);
        });
      } else {
        processWmtsConfig(layerConfigs, v.type);
      }
    }
  });
}

/**
 * 生产专题图层
 */
function createThematicLayer(v, map) {
  // 完善WMTS配置
  processLayerConfig(v);
  let thematicLayer;

  if (v.type === "vector-tile") {
    thematicLayer = new VectorTileThematicLayer(
      v.id,
      v.layer_name,
      v.type,
      v.real_name,
      v.url,
      v.index,
      v.visible,
      v.parent,
      v.config,
      v.geometryType,
      v.layerConfigs,
      map
    );
  } else if (v.type === "vector-gif") {
    thematicLayer = new VectorGifThematicLayer(
      v.id,
      v.layer_name,
      v.type,
      v.real_name,
      v.url,
      v.index,
      v.visible,
      v.parent,
      v.config,
      v.can_query,
      v.geometryType,
      v.layerConfigs,
      v.zjLayerConfig,
      map
    );
  } else if (v.type === "vector") {
    thematicLayer = new VectorThematicLayer(
      v.id,
      v.layer_name,
      v.type,
      v.real_name,
      v.url,
      v.index,
      v.visible,
      v.parent,
      v.config,
      v.can_query,
      v.geometryType,
      v.layerConfigs,
      v.zjLayerConfig,
      map
    );
  } else if (v.layerConfigs) {
    thematicLayer = new WmtsThematicLayer(
      v.id,
      v.layer_name,
      v.type,
      v.real_name,
      v.url,
      v.index,
      v.visible,
      v.parent,
      v.config,
      v.can_query,
      v.geometryType,
      v.layerConfigs,
      v.zjLayerConfig
    );
  } else {
    // arcgis rest 服务
    thematicLayer = new ThematicLayer(
      v.id,
      v.layer_name,
      v.type,
      v.real_name,
      v.url,
      v.index,
      v.visible,
      v.parent,
      v.config,
      v.can_query,
      v.geometryType
    );
  }
  return thematicLayer;
}

/**
 * 生产底图图层
 */
function createBaseLayer(v, map) {
  // debugger;
  // 完善WMTS配置
  if (v.type == "arcgis-wmts" || v.type == "supermap-wmts") {
    processLayerConfig(v);
  }

  let baseLayer;
  if (v.type == "arcgis-wmts") {
    //加载arcgis WMTS底图服务  备注：金沙江项目地图走这个方法，切片的WMTS服务
    baseLayer = new WmtsBaseLayer(
      v.id,
      v.layer_name,
      v.type,
      v.real_name,
      v.index,
      v.visible,
      v.layerConfigs
    );
  } else if (v.type == "baidu-wmts") {
    baseLayer = new BaiduBaseLayer(
      v.id,
      v.layer_name,
      v.type,
      v.real_name,
      v.url,
      v.index,
      v.visible,
      v.layerConfigs
    );
  } else {
    baseLayer = new BaseLayer(
      v.id,
      v.layer_name,
      v.type,
      v.real_name,
      v.url,
      v.index,
      v.visible,
      v.layerConfigs
    );
  }
  return baseLayer;
}

export default {
  createBaseLayer,
  createThematicLayer
};
