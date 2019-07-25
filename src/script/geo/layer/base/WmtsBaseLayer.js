/*
 * @CreateTime: Jul 1, 2017 10:13 AM
 * @Author: zhangzh
 * @Contact: zhang910818@163.com
 * @Last Modified By: zhangzh
 * @Last Modified Time: Oct 13, 2017 11:37 AM
 * @Description: 湖北省WMTS底图服务加载
 */

import WmtsLayer from "../tile/WmtsLayer";
import config from "../../../config.js";

/**
 * 采用ol.source.WMTS构造的底图图层
 *
 * @class WmtsBaseLayer
 * @extends {WmtsLayer}
 */
class WmtsBaseLayer extends WmtsLayer {
  /**
   * Creates an instance of WmtsBaseLayer.
   * @param {Number} id 图层ID
   * @param {String} name 图层名称
   * @param {Number} index 图层展示顺序
   * @param {boolean} visible 图层可见性
   * @param {Object | Array} layerConfigs WMTS配置参数
   * @memberof WmtsBaseLayer
   */
  constructor(id, name, type, realname, index, visible, layerConfigs) {
    super(id, name, type, realname, index, visible, layerConfigs);
  }

  set visible(val) {
    this._visible = val;
    //底图为独占模式，打开一个底图关闭其他底图
    if (val) {
      _.forEach(config["$STORE"].state.map.basemapList, (v, i) => {
        if (v != this) v.visible = false;
      });
      this.layer.setVisible(true);
    } else {
      this.layer.setVisible(false);
    }
  }

  get visible() {
    return this._visible;
  }

  setOwnVisible(value = false) {
    this.layer.setVisible(value);
  }
}

export default WmtsBaseLayer;
