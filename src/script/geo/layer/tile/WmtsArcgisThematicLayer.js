/*
 * @CreateTime: Jul 1, 2017 10:13 AM
 * @Author: zhangzh
 * @Contact: zhang910818@163.com
 * @Last Modified By: zhangzh
 * @Last Modified Time: Oct 13, 2017 11:37 AM
 * @Description: 湖北省WMTS底图服务加载
 */

import WmtsLayer from "./WmtsLayer";

/**
 * 采用ol.source.WMTS构造的底图图层
 *
 * @class WmtsArcgisThematicLayer
 * @extends {WmtsLayer}
 */
class WmtsArcgisThematicLayer extends WmtsLayer {
  /**
   * Creates an instance of WmtsArcgisThematicLayer.
   * @param {Number} id 图层ID
   * @param {String} name 图层名称
   * @param {Number} index 图层展示顺序
   * @param {boolean} visible 图层可见性
   * @param {Object | Array} layerConfigs WMTS配置参数
   * @memberof WmtsArcgisThematicLayer
   */
  constructor(id, name, type, realname, index, visible, layerConfigs) {
    super(id, name, type, realname, index, visible, layerConfigs);
  }

  set visible(val) {
    this._visible = val;
  }

  get visible() {
    return this._visible;
  }

  setOwnVisible(value = false) {
    this.layer.setVisible(value);
  }
}

export default WmtsArcgisThematicLayer;
