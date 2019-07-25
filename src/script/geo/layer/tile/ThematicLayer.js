import AbstractLayer from '../AbstractLayer'
import _ from 'lodash'
import config from '../../../config.js'
import ImageArcGISRest from 'ol/source/ImageArcGISRest';
import ImageLayer from 'ol/layer/Image';
class ThematicLayer extends AbstractLayer {
  /**
   * Creates an instance of ThematicLayer.
   * @param {Integer} id
   * @param {String} name
   * @param {String} url
   * @param {Integer} index
   * @param {Boolean} visible
   * @param {Integer} parent 父节点ID，用于构造树结构
   * @param {Object} config 存储图标等配置
   * @param {Object} params 存储瓦片需设置的参数
   * @param {Boolean} canQuery 是否可以查看
   * @param {String} geometryType 图层类型，分为点、线、面
   *
   * @memberof ThematicLayer
   */
  constructor(id, name, type, realname, url, index, visible, parent, config, canQuery, geometryType) {
    var layer = url && new ImageLayer({
      source: new ImageArcGISRest({
        // crossOrigin:'Anonymous',
        url: url
      })
    });
    super(id, name, type, realname, url, index, visible, layer, geometryType);

    // this.visible = visible || false;
    this._parent = parent;
    for (let key in config) {
      this[key] = config[key]
    }
    this._canQuery = canQuery === undefined ? false : canQuery;
  }

  set visible(val) {
    this._visible = val;
    this.layer && this.layer.setVisible && this.layer.setVisible(this._visible);
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

export default ThematicLayer;
