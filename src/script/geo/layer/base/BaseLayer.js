/**
 * @author lxf emailAddress
 * @description 地图底图类
 */
import AbstractLayer from "../AbstractLayer";
import config from "../../../config.js";
import TileLayer from "ol/layer/Tile";
import XYZ from 'ol/source/XYZ';
import {
  createXYZ,
  extentFromProjection
} from "ol/tilegrid"


/**
 * 采用ol.source.XYZ构造的底图图层
 *
 * @class BaseLayer
 * @extends {AbstractLayer}
 */
class BaseLayer extends AbstractLayer {
  constructor(id, name, type, realname, url, index, visible, layerConfigs) {
    var tileGrid = createXYZ({
      extent: extentFromProjection("EPSG:3857"),
      origin: layerConfigs && layerConfigs.origin
    });
    var layer = new TileLayer({
      source: new XYZ({
        // crossOrigin: 'Anonymous',
        tileGrid: tileGrid,
        url: url
      }),
      visible: visible
    });
    super(id, name, type, realname, url, index, visible, layer);
    if (layerConfigs && layerConfigs.url) {
      this.otherLayer = new TileLayer({
        source: new XYZ({
          url: layerConfigs.url
        }),
        visible: visible
      });
    }
  }

  set visible(val) {
    this._visible = val;
    //底图为独占模式，打开一个底图关闭其他底图
    if (val) {
      _.forEach(config["$STORE"].state.map.basemapList, (v, i) => {
        if (v != this) v.visible = false;
      });
      this.layer.setVisible(true);
      this.otherLayer && this.otherLayer.setVisible(true);
    } else {
      this.layer.setVisible(false);
      this.otherLayer && this.otherLayer.setVisible(false);
    }
  }

  get visible() {
    return this._visible;
  }

  setOwnVisible(value = false) {
    this.layer.setVisible(value);
  }
}

export default BaseLayer;
