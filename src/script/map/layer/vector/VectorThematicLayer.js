/*
 * @CreateTime: Sep 5, 2017 8:51 AM
 * @Author: zhangzh
 * @Contact: zhang910818@163.com
 * @Last Modified By: zhangzh
 * @Last Modified Time: Oct 13, 2017 10:02 AM
 * @Description: 将基本图层的点图层改为矢量图层
 */
import ol from "openlayers";
import { asynData } from "../../../service/commonService";

class VectorThematicLayer extends ol.layer.Vector {
  /**
   * Creates an instance of VectorThematicLayer.
   * @param {Integer} id
   * @param {String} name
   * @param {String} url
   * @param {Integer} index
   * @param {Boolean} visible
   * @param {Integer} parent 父节点ID，用于构造树结构
   * @param {Object} config 存储图标等配置
   * @param {Boolean} canQuery 是否可以查看
   * @param {String} geometryType 图层类型，分为点、线、面
   * @param {Array} layerConfigs 矢量图层样式配置
   * @param {Array} zjLayerConfig 矢量注记图层样式配置
   * @param {Object} map 地图对象
   *
   * @memberof VectorThematicLayer
   */
  constructor(
    id,
    name,
    type,
    realname,
    url,
    index,
    visible,
    parent,
    config,
    canQuery,
    geometryType,
    layerConfigs,
    zjLayerConfig,
    map
  ) {
    super(
      id,
      name,
      type,
      realname,
      index,
      visible,
      layerConfigs,
      geometryType,
      map
    );
    this._url = url;

    if (zjLayerConfig) {
      this.zjLayer = new ol.layer.Vector(
        id,
        name + "注记",
        type,
        realname + "Annotation",
        index,
        visible,
        zjLayerConfig,
        "annotation",
        map
      );
    }
    for (let key in config) {
      this[key] = config[key];
    }

    var layerUrl = `${url}/${
      this.layerIds
    }/query?where=1=1&f=pjson&outFields=*`;
    let that = this;
    asynData(layerUrl).then(function(data) {
      var format = new ol.format.EsriJSON();
      // var features = format.readFeatures(data);
      var features = [];
      var zjFeatures = [];
      _.forEach(data.features, item => {
        if (item.geometry.x != "NaN" && item.geometry.y != "NaN") {
          var feature = format.readFeature(item);
          var zjFeature = format.readFeature(item);
          features.push(feature);
          zjFeatures.push(zjFeature);
        }
      });
      if (features && features.length > 0) {
        that.layer.getSource().addFeatures(features);
        that.zjLayer.layer.getSource().addFeatures(zjFeatures);
      }
    });

    this._parent = parent;
    this._canQuery = canQuery === undefined ? false : canQuery;
  }

  set visible(val) {
    this._visible = val;
    this.layer && this.layer.setVisible && this.layer.setVisible(this._visible);
    if (this.zjLayer) {
      this.zjLayer.visible = val;
    }
  }
  get visible() {
    return this._visible;
  }

  get parent() {
    return this._parent;
  }

  set parent(val) {
    this._parent = val;
  }

  set canQuery(val) {
    this._canQuery = val;
  }
  get canQuery() {
    return this._canQuery;
  }
}

export default VectorThematicLayer;
