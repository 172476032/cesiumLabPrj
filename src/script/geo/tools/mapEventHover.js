/*
 * @CreateTime: Nov 28, 2017 9:37 AM
 * @Author: zhangzh
 * @Contact: zhang910818@163.com
 * @Last Modified By: zhangzh
 * @Last Modified Time: Nov 28, 2017 7:12 PM
 * @Description: 地图鼠标移动事件处理类
 */
import ol from 'openlayers'
import config from '../../config'


/**
 * 内部变量定义
 */
var map_; // 地图对象
var txtOverlay_ = new ol.Overlay({ // 展示hover时的提示文字
    offset: [10, -20]
}); // 名称overlay
var lastHoverFeature_; // 上一次高亮对象
var leastHoverLayer_; // 上一次高亮图层
var isMapMoving_ = false; // 记录地图是否在移动
var mapElement_; // 地图DOM
var lastTime_; //

/**
 * hover feature时更改style
 * @param {ol.Feature} feature
 * @param {ol.layer.Vector | ol.layer.VectorTile} layer
 */
function highLightFeatureStyle(feature, layer) {
    if (feature === lastHoverFeature_) {
        return;
    }

    if (lastHoverFeature_ && leastHoverLayer_) {
        if (feature instanceof ol.Feature) {
            lastHoverFeature_.setStyle(leastHoverLayer_.styleFunction);
        } else {
            leastHoverLayer_.setSelectId();
        }
    }

    // 防止鼠标移动过快，导致渲染不及时，41为 1000/24 ms
    let nowTime = (new Date()).getTime();
    // lastTime_ && console.log(nowTime - lastTime_, 'ms');
    if(lastTime_ && nowTime - lastTime_ < 41) {
        lastTime_ = nowTime;
        return;
    }
    lastTime_ = nowTime;

    let thematicLayers = getSelectedLayerList().filter(thematicLayer => {
        return thematicLayer.layer === layer;
    });

    if (thematicLayers && thematicLayers.length > 0) {
        let thematicLayer = thematicLayers[0];
        if (feature instanceof ol.Feature) {
            feature.setStyle(thematicLayer.highStyleFunction);
        } else {
            thematicLayer.setSelectId(feature);
        }
        lastHoverFeature_ = feature;
        leastHoverLayer_ = thematicLayer;
    } else {
        lastHoverFeature_ = null;
        leastHoverLayer_ = null;
    }
}

/**
 * 辅助函数
 * 获取当前被勾选的图层列表
 */
function getSelectedLayerList() {
    //由于湖北省WMTS地图服务不能查询，所以需要筛选ThematicLayer图层
    var selectedThematicLayers = config.$STORE.getters.selectedThematicLayers;
    var result = selectedThematicLayers.filter(item => {
        return item.visible;
    });
    return result;
}

/**
 * 显示提示文字
 * @param {String} featureNote 文本
 * @param {Array} coordinate 鼠标地图坐标
 */
function showTxtOverlay(featureNote, coordinate) {
    let container = txtOverlay_.getElement();
    if (!container) {
        container = document.createElement('div');
        txtOverlay_.setElement(container);
    }

    container.innerHTML = `<div class="cj-txt-overlay">${featureNote}</div>`;
    txtOverlay_.setPosition(coordinate);
}

/**
 * 鼠标移动事件
 * @param {ol.MapBrowserEvent} evt 地图事件对象
 */
function mousemoveHandler(evt) {
    if (isMapMoving_) {
        return;
    }
    let text, feature, curLayer;
    // 根据鼠标位置获取指定范围内（像素值）的对象
    map_.forEachFeatureAtPixel(evt.pixel, (f, layer) => {
        feature = f;
        curLayer = layer;
    }, {
        hitTolerance: 3
    });
    map_.getTarget().style.cursor = feature ? 'pointer' : ''; // 改变鼠标形状
    if (feature) { // 存在
        text = feature.get('河名');
        showTxtOverlay(text, evt.coordinate);
        highLightFeatureStyle(feature, curLayer);
    } else { // 不存在
        txtOverlay_ && txtOverlay_.setPosition();
        highLightFeatureStyle();
    }
}

/**
 * 地图移动结束事件
 * @param {ol.MapBrowserEvent} evt 地图事件对象
 */
function movestartHandler(evt) {
    // console.log('move start');
    isMapMoving_ = true;
}

/**
 * 地图移动结束事件
 * @param {ol.MapBrowserEvent} evt 地图事件对象
 */
function moveendHandler(evt) {
    // console.log('move end');
    isMapMoving_ = false;
}

/**
 * 鼠标移出地图DOM事件
 * @param {Event} evt DOM事件对象
 */
function moveleaveHandler(evt) {
    // 隐藏overlay
    txtOverlay_ && txtOverlay_.setPosition();
    // 清除highlight
    highLightFeatureStyle();
}

/**
 * 启动地图鼠标移动功能
 * @param {ol.Map} map 地图对象
 */
function active(map) {
    map_ = map;
    map_.addOverlay(txtOverlay_);
    map_.on('pointermove', mousemoveHandler);
    // 添加地图移动事件，修改地图移动时高亮闪烁的问题
    map_.on('movestart', movestartHandler);
    map_.on('moveend', moveendHandler);
    // 添加DOM对象事件，修改鼠标移出DOM高亮闪烁一直显示的问题
    mapElement_ = map_.getTargetElement();
    if (mapElement_.attachEvent) {
        mapElement_.attachEvent('onmouseleave', moveleaveHandler);
    } else {
        mapElement_.addEventListener('mouseleave', moveleaveHandler, false);
    }
}

/**
 * 停止地图鼠标移动功能
 */
function deactive() {
    map_.removeOverlay(txtOverlay_);
    // 清除地图事件
    map_.un('pointermove', mousemoveHandler);
    map_.un('movestart', movestartHandler);
    map_.un('moveend', moveendHandler);
    // 清除DOM节点事件
    if (mapElement_.attachEvent) {
        mapElement_.detachEvent('onmouseleave', moveleaveHandler);
    } else {
        mapElement_.removeEventListener('mouseleave', moveleaveHandler, false);
    }
    map_ = null;
}

/**
 * 暴露的方法
 */
export default {
    active,
    deactive
}
