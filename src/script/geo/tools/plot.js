import P from '../../plugin/p-ol3.debug'
import {
    drawingStyle,
    drawEndStyle,
    highlightStyle
} from './plotStyle'
import plotLayer from './plotLayer'
import plotConstant from './plotConstant'
import ol from 'openlayers'
import config from '../../config.js'


let state = {
    map: null,
    plotDraw: null,
    plotEdit: null,
    drawOverlay: null,
    popupOverlayer: null,
    constant: null,
    imgNode: null,
    curToolType: null,
    lastSelectFeature: null,
    imgOverlayer: null,
    changePopup: null
}

//删除选中的feature
const plotDelete = function (f) {
    var plotEdit = state.plotEdit;
    var drawOverlay = state.drawOverlay;
    if (drawOverlay && plotEdit && plotEdit.activePlot) {
        drawOverlay.getSource().removeFeature(plotEdit.activePlot);
        plotEdit.deactivate();
    }
    if (drawOverlay && f) {
        drawOverlay.getSource().removeFeature(f);
        plotEdit.deactivate();
    }
}



// 指定标绘类型，开始绘制
const plotActivate = function (type, imgNode) {
    locateOverlayer();
    mouseClickHandler2();

    var plotDraw = state.plotDraw;
    var plotEdit = state.plotEdit;
    var overlay = state.popupOverlayer;

    var constant = plotConstant.getPlotConstant(type);
    state.constant = constant;
    var drawType = constant.type;
    state.imgNode = imgNode;

    plotEdit.deactivate();
    plotDraw.activate(drawType);

    //添加鼠标移动事件，设置图形光标移动
    var map = state.map;
    state.imgOverlayer = null;
    if (constant.geometryType == "point") {
        var node = imgNode.cloneNode(true); //深度复制
        addOverlay2(node);
        map.getTarget().style.cursor = "pointer";
    } else {
        map.getTarget().style.cursor = "crosshair";
    }
    map.on('pointermove', mouseMoveHandler);
    map.on('singleclick', mouseClickHandler2);
}

const addOverlay2 = function (container) {
    var overlay = baseAddOverlay(container, false);
    state.imgOverlayer = overlay;
}

const mouseMoveHandler = function (e) {
    console.log("mouse move");
    var map = state.map;
    var overlay = state.imgOverlayer;
    var node = state.imgNode;
    if (overlay && node) {
        var pixel = e.pixel;
        var height = node.offsetHeight;
        var width = node.offsetWidth;
        pixel[0] -= width / 2;
        pixel[1] -= height / 2;
        var coordinate = map.getCoordinateFromPixel(pixel);
        overlay.setPosition(coordinate);
    }
}

const mouseMoveHandler2 = function (e) {
    var map = state.map;
    var drawOverlay = state.drawOverlay;
    var feature = map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
        return layer == drawOverlay ? feature : null;
    }, {
        hitTolerance: 5
    });
    map.getTarget().style.cursor = feature ? 'pointer' : ''; //改变鼠标形状
}

const mouseClickHandler2 = function (e) {
    console.log("plot mouse down!!");
    var map = state.map;
    var overlay = state.imgOverlayer;
    map.getTarget().style.cursor = "";
    map.un('pointermove', mouseMoveHandler);
    map.un('singleclick', mouseClickHandler2);
    if (overlay)
        map.removeOverlay(overlay);
}

const mouseClickHandler = function (e) {
    var plotDraw = state.plotDraw;
    var plotEdit = state.plotEdit;
    var map = state.map;
    var drawOverlay = state.drawOverlay;
    var curToolType = state.curToolType;

    console.log(state.lastSelectFeature);
    window.layer = state.lastSelectFeature;

    if (plotDraw.isDrawing()) {
        return;
    }
    var feature = map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        if (drawOverlay && layer == drawOverlay)
            return feature;
    }, {
        hitTolerance: 5
    });

    //高亮当前选中feature
    if (state.lastSelectFeature)
        state.lastSelectFeature.setStyle(drawEndStyle);
    state.lastSelectFeature = feature;
    if (feature) {
        feature.setStyle(highlightStyle);
    } else {

    }

    if (curToolType == TOOL_TYPE.SELECT) {
        //显示弹出框
        showPopup(feature);
    } else if (curToolType == TOOL_TYPE.EDIT) {
        if (feature) {
            // 开始编辑
            plotEdit.activate(feature);
        } else {
            plotEdit.destroyHelperDom();
            plotEdit.activePlot = null;
        }
    } else if (curToolType == TOOL_TYPE.VIEW) {
        //显示弹出框
        showPopup(feature);
    } else {

    }
}

const TOOL_TYPE = {
    SELECT: 'select',
    EDIT: 'edit',
    VIEW: 'view'
}

const plotToolInit = function () {
    state.plotEdit.deactivate();
    showPopup(null);
    if (state.lastSelectFeature)
        state.lastSelectFeature.setStyle(drawEndStyle);
    state.lastSelectFeature = null;
}

const plotSelect = function () {
    state.curToolType = TOOL_TYPE.SELECT;

    plotToolInit();
}

const plotEdit = function () {
    state.curToolType = TOOL_TYPE.EDIT;

    plotToolInit();
}

const plotView = function () {
    state.curToolType = TOOL_TYPE.VIEW;

    plotToolInit();
}

// 绘制结束后，添加到FeatureOverlay显示。
const onDrawEnd = function (event) {
    var drawOverlay = state.drawOverlay;
    var plotEdit = state.plotEdit;
    var plotDraw = state.plotDraw;

    var feature = event.feature;
    feature.set('type', state.constant.name);
    drawOverlay.getSource().addFeature(feature);
    console.log('feature', feature);
    window.f = feature;
    console.log('imgOverlayer', state.imgOverlayer);
    // console.log((new ol.format.GeoJSON).writeFeatures(drawOverlay.getSource().getFeatures()))

    // 开始编辑
    // plotEdit.activate(feature);
    // activeDelBtn();

    //显示弹出框
    showPopup(plotDraw.feature);
}

const showPopup = function (feature) {
    var popupOverlayer = state.popupOverlayer;
    if (feature) {
        if (state.changePopup && state.changePopup instanceof Function)
            state.changePopup(feature);

        // var coordinates = plotDraw.feature.getGeometry().flatCoordinates;
        // var coordinate = coordinates.splice(coordinates.length - 2, 2);
        var coordinate = feature.getGeometry().getFirstCoordinate();
        if (popupOverlayer) {
            popupOverlayer.setPosition(coordinate);
        }
    } else {
        if (popupOverlayer)
            popupOverlayer.setPosition(undefined);
    }
}

const baseAddOverlay = function (container, stopEvent) {
    if (stopEvent == undefined)
        stopEvent = true;
    var map = state.map;
    var overlay = new ol.Overlay(({
        element: container,
        autoPan: true,
        stopEvent: stopEvent,
        autoPanAnimation: {
            duration: 250
        }
    }));
    map.addOverlay(overlay);
    overlay.setPosition(undefined);
    return overlay;
}

const addOverlay = function (container) {
    var overlay = baseAddOverlay(container);
    state.popupOverlayer = overlay;
}

const locateOverlayer = function (position) {
    var overlay = state.popupOverlayer;
    if (!overlay)
        return;
    if (position) {
        overlay.setPosition(position);
        config['$STORE'].commit('SET_ANIMATE', {
            center: position
        });
    } else
        overlay.setPosition(undefined);
}

const active = function (map, changePopup) {
    state.map = map;
    state.changePopup = changePopup;
    // console.log("map", map);
    var drawOverlay = state.drawOverlay;
    var plotDraw = state.plotDraw;
    var plotEdit = state.plotEdit;
    // if (drawOverlay && plotDraw && plotEdit)
    //     return;

    // 绘制好的标绘符号，添加到FeatureOverlay显示。
    drawOverlay = new ol.layer.Vector({
        source: new ol.source.Vector()
    });
    drawOverlay.setZIndex(1200);
    drawOverlay.setStyle(drawEndStyle);
    // drawOverlay.setMap(map);
    map.addLayer(drawOverlay);

    // 初始化标绘绘制工具，添加绘制结束事件响应
    plotDraw = new P.PlotDraw(map, drawingStyle);
    plotDraw.on(P.Event.PlotDrawEvent.DRAW_END, onDrawEnd);

    // 初始化标绘编辑工具
    plotEdit = new P.PlotEdit(map);

    //鼠标点击选择事件
    map.on('click', mouseClickHandler);
    map.on('pointermove', mouseMoveHandler2);

    state.drawOverlay = drawOverlay;
    state.plotDraw = plotDraw;
    state.plotEdit = plotEdit;
    // var container = document.getElementById('plot-popup');
    // addOverlayer(container);
}

//移除popup overlay
const deactive = function () {
    deactive2();
    var map = state.map;
    if (!map)
        return;
    var popupOverlayer = state.popupOverlayer;
    map.removeOverlay(popupOverlayer);
}

//不移除popup overlay
const deactive2 = function () {
    var map = state.map;
    if (!map)
        return;
    var drawOverlay = state.drawOverlay;
    var popupOverlayer = state.popupOverlayer;
    var plotDraw = state.plotDraw;
    var plotEdit = state.plotEdit;

    map.un('pointermove', mouseMoveHandler);
    map.un('click', mouseClickHandler);
    map.un('pointermove', mouseMoveHandler2);
    map.removeLayer(drawOverlay);
    popupOverlayer.setPosition(undefined);
    plotDraw.deactivate();
    plotEdit.deactivate();

    //共享标绘、新建标绘事件、方法销毁
    plotLayer.deactive();
}

const getConstant = function () {
    return state.constant;
}

export default {
    active,
    deactive,
    deactive2,
    addOverlay,
    plotDelete,
    plotActivate,
    locateOverlayer,
    plotSelect,
    plotEdit,
    plotView,
    getConstant
}
