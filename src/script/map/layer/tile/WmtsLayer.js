/*
 * @CreateTime: Jul 1, 2017 9:55 AM
 * @Author: zhangzh
 * @Contact: zhang910818@163.com
 * @Last Modified By: zhangzh
 * @Last Modified Time: Oct 13, 2017 4:27 PM
 * @Description: 湖北省WMTS服务加载
 */
import AbstractLayer from '../AbstractLayer'
import { createWmtsLayer, createSupermapWmtsLayer } from './WmtsLayerUtil'
import ol from 'openlayers';


class WmtsLayer extends AbstractLayer {
    constructor(id, name, type, realname, index, visible, layerConfigs, geometryType, isExtend) {
        //构造WMTS图层
        var layer = null;
        // var createLayerFunc = type == 'supermap-wmts' ? createSupermapWmtsLayer : (isExtend ? createExtendWmtsLayer : createWmtsLayer);
        var createLayerFunc = type == 'supermap-wmts' ? createSupermapWmtsLayer : createWmtsLayer;
        //如果为数组，则构造组图层，否则，构造单图层
        if (layerConfigs instanceof Array) {
            var groupLayers = [];
            layerConfigs.forEach(config => {
                groupLayers.push(createLayerFunc(config))
            });
            layer = new ol.layer.Group({
                layers: groupLayers
            });
        } else {
            layer = createLayerFunc(layerConfigs);
        }

        super(id, name, type, realname, undefined, index, visible, layer, geometryType);
        // this.visible = visible;
        this.layerConfigs = layerConfigs;

        this.isExtend = isExtend;
    }

    get isExtend() {
        return this._isExtend;
    }

    set isExtend(val) {
        this._isExtend = val;
    }
}

export default WmtsLayer
