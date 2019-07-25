/*
 * @CreateTime: Sep 5, 2017 8:51 AM
 * @Author: zhangzh
 * @Contact: zhang910818@163.com
 * @Last Modified By: zhangzh
 * @Last Modified Time: Oct 13, 2017 10:02 AM
 * @Description: 将基本图层的点图层改为矢量图层
 */
import ol from "openlayers";
import AbstractVectorLayer from "./AbstractVectorLayer";

class VectorTileThematicLayer extends AbstractVectorLayer {
  /**
   * Creates an instance of VectorThematicLayer.
   * @param {Integer} id
   * @param {String} name
   * @param {String} url
   * @param {Integer} index
   * @param {Boolean} visible
   * @param {Integer} parent 父节点ID，用于构造树结构
   * @param {Object} config 存储图标等配置
   * @param {String} geometryType 图层类型，分为点、线、面
   * @param {Array} layerConfigs 矢量图层样式配置
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
    geometryType,
    layerConfigs,
    map
  ) {
    // 矢量图层
    var projection = (map && map.getView().getProjection()) || "EPSG:4326";
    var layer = new ol.layer.VectorTile({
      source: new ol.source.VectorTile({
        format: new ol.format.MVT({
          // featureClass: ol.Feature
        }),
        projection: projection,
        url: url
      })
    });

    super(
      id,
      name,
      type,
      realname,
      index,
      visible,
      layer,
      layerConfigs,
      geometryType,
      map
    );

    // vector tile 高亮显示
    this._selectedId = null;
    var that = this;
    layer.setStyle(function(feature, resolution) {
      return that.selectedId && feature.get("代码") === that.selectedId
        ? that.highStyleFunction(feature)
        : that.styleFunction(feature);
    });

    this._parent = parent;
    for (let key in config) {
      this[key] = config[key];
    }
    this._canQuery = true;
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

  set selectedId(val) {
    this._selectedId = val;
  }
  get selectedId() {
    return this._selectedId;
  }

  setSelectId(feature) {
    if (feature) {
      this._selectedId = feature.get("代码");
    } else {
      this._selectedId = null;
    }
    this.layer.changed();
  }
}

export default VectorTileThematicLayer;
