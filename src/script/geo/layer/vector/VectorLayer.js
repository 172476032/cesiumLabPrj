/*
 * @CreateTime: Sep 5, 2017 8:51 AM
 * @Author: zhangzh
 * @Contact: zhang910818@163.com
 * @Last Modified By: zhangzh
 * @Last Modified Time: Oct 13, 2017 10:02 AM
 * @Description: 将基本图层的点图层改为矢量图层
 */
import AbstractVectorLayer from "./AbstractVectorLayer";
import _ from "lodash";
import sourceVector from "ol/source/vector";
import layerVector from "ol/layer/vector";

class VectorLayer extends AbstractVectorLayer {
  /**
   * Creates an instance of VectorLayer.
   * @param {Integer} id
   * @param {String} name
   * @param {Integer} index
   * @param {Boolean} visible
   * @param {String} geometryType 图层类型，分为点、线、面
   * @param {Array} layerConfigs 矢量图层样式配置
   * @param {Object} map 地图对象
   *
   * @memberof VectorLayer
   */
  constructor(
    id,
    name,
    type,
    realname,
    index,
    visible,
    layerConfigs,
    geometryType,
    map
  ) {
    // 矢量图层
    var layer = new layerVector({
      source: new sourceVector({})
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
  }
}

export default VectorLayer;
