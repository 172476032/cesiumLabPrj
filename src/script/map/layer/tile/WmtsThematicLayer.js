/*
 * @CreateTime: Jul 1, 2017 10:13 AM
 * @Author: zhangzh
 * @Contact: zhang910818@163.com
 * @Last Modified By: zhangzh
 * @Last Modified Time: Oct 13, 2017 10:01 AM
 * @Description: WMTS服务加载
 */

import WmtsLayer from './WmtsLayer'


/**
 * 采用ol.source.WMTS构造的图层
 *
 * @class WmtsThematicLayer
 * @extends {WmtsLayer}
 */
class WmtsThematicLayer extends WmtsLayer {
    // /**
    //  * Creates an instance of WmtsThematicLayer.
    //  * @param {Number} id 图层ID
    //  * @param {String} name 图层名称
    //  * @param {Number} index 图层展示顺序
    //  * @param {boolean} visible 图层可见性
    //  * @param {Object | Array} layerConfigs WMTS配置参数
    //  * @memberof WmtsThematicLayer
    //  */
    // constructor(id, name, index, visible, layerConfigs, parent) {
    //     super(id, name, index, visible, layerConfigs);
    //     this._parent = parent;
    // }

    /**
     * Creates an instance of WmtsThematicLayer.
     * @param {Integer} id
     * @param {String} name
     * @param {String} url
     * @param {Integer} index
     * @param {Boolean} visible
     * @param {Integer} parent 父节点ID，用于构造树结构
     * @param {Boolean} canQuery 是否可以查看
     * @param {String} geometryType 图层类型，分为点、线、面
     * @param {Object} zjLayerConfig 注记图层
     *
     * @memberof WmtsThematicLayer
     */
    constructor(id, name, type, realname, url, index, visible, parent, config, canQuery, geometryType, layerConfigs, zjLayerConfig) {
        super(id, name, type, realname, index, visible, layerConfigs, geometryType);
        for (let key in config) {
            this[key] = config[key]
        }
        this._url = url;

        if (zjLayerConfig) {
            this.zjLayer = new WmtsLayer(id, name + '注记', type, realname + "Annotation", index, visible, zjLayerConfig, "annotation", this.isExtend);
        }

        this._parent = parent;
        this._canQuery = canQuery === undefined ? false : canQuery;
    }

    set visible(val) {
        this._visible = val;
        this.layer && this.layer.setVisible && this.layer.setVisible(this._visible);
        if (this.zjLayer) {
            this.zjLayer.visible = val;
        }
        if (this.otherLayer) {
            this.otherLayer.visible = val;
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

    set url(val) {
        this._url = val;
    }
    get url() {
        return this._url;
    }

    set canQuery(val) {
        this._canQuery = val;
    }
    get canQuery() {
        return this._canQuery;
    }

}

export default WmtsThematicLayer
