/*
 * @CreateTime: Sep 5, 2017 8:51 AM
 * @Author: zhangzh
 * @Contact: zhang910818@163.com
 * @Last Modified By: zhangzh
 * @Last Modified Time: Oct 13, 2017 10:02 AM
 * @Description: 将基本图层的点图层改为矢量图层
 */
import VectorThematicLayer from './VectorThematicLayer'
import '../../../service/mygifler'

class VectorGifThematicLayer extends VectorThematicLayer {
    /**
     * Creates an instance of VectorGifThematicLayer.
     * @param {Integer} id
     * @param {String} name
     * @param {String} url
     * @param {Integer} index
     * @param {Boolean} visible
     * @param {Integer} parent 父节点ID，用于构造树结构
     * @param {Array} layerIds
     * @param {Object} config 存储图标等配置
     * @param {Boolean} canQuery 是否可以查看
     * @param {String} geometryType 图层类型，分为点、线、面
     * @param {Array} layerConfigs 矢量图层样式配置
     * @param {Array} zjLayerConfig 矢量注记图层样式配置
     * @param {Object} map 地图对象
     *
     * @memberof VectorGifThematicLayer
     */
    constructor(id, name, type, realname, url, index, visible, parent, config, canQuery, geometryType, layerConfigs, zjLayerConfig, map) {
        super(id, name, type, realname, index, visible, parent, config, canQuery, geometryType, layerConfigs, zjLayerConfig, map);

        if (this.isGif && this.gifSrc) {
            var canvasEle = document.createElement('CANVAS');
            gifler(this.gifSrc).animate(canvasEle);

            var superStyleFunction = this.styleFunction;

            this._styleFunction = function (feature) {
                var data = canvasEle.toDataURL();
                return superStyleFunction.call(this, feature, false, data);
            }

            this._highStyleFunction = function (feature) {
                var data = canvasEle.toDataURL();
                return superStyleFunction.call(this, feature, true, data);
            }
        }
    }

    set visible(val) {
        this._visible = val;
        this.layer && this.layer.setVisible && this.layer.setVisible(this._visible);
        if (this.zjLayer) {
            this.zjLayer.visible = val;
        }

        if(val) { // 可见则添加features，调用addFeatures方法，该方法由具体的调用者赋值
            this.addFeatures && this.addFeatures(this);
        } else { // 不可见则清除数据
            this.layer.getSource().clear();
            this.zjLayer && this.zjLayer.layer.getSource().clear();
        }

        // 如果为动态GIF图标，则需不断循环改变feature style
        if (val && this.isGif) {
            // requestNextAnimationFrame方法兼容性不好，还是采用setTimeout方法
            var interval = 200;
            let that = this;
            var redraw = function() {
                // 如果当前图层不可见，则不再循环展示GIF图标
                if (!that.visible) return;
                that.layer.setStyle(that.styleFunction);
                setTimeout(redraw, interval);
            };
            setTimeout(redraw, interval);
        }
    }
    get visible() {
        return this._visible;
    }

}

export default VectorGifThematicLayer;
