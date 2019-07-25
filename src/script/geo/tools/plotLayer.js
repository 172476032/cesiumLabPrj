import axios from 'axios'
import ol from 'openlayers'
import {
    drawingStyle,
    drawEndStyle,
    highlightStyle
} from './plotStyle'
import plotTool from './plot'
import config from '../../config.js'
import _ from "lodash"

let state = {
    map: null,
    plotLayer: null,
    tabName: null,
    lastSelectFeature: null,
    changePopup: null,
    changePlotData: null
}

//销毁事件，清除图层
const deactive = function () {
    if (state.plotLayer) {
        state.map.removeLayer(state.plotLayer);
    }
    removeQueryFunc();
}

const addPlotLayer = function (features) {
    var vector = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(features)
        }),
        style: drawEndStyle
    });
    state.map.addLayer(vector);
    vector.setZIndex(1200);
    state.plotLayer = vector;
}

//添加查询功能
const addQueryFunc = function () {
    var map = state.map;
    map.on('singleclick', mouseClickHandler);
    map.on('pointermove', mouseMoveHandler);
}

//移除查询功能
const removeQueryFunc = function () {
    var map = state.map;
    state.lastSelectFeature = null;
    map.un('singleclick', mouseClickHandler);
    map.on('pointermove', mouseMoveHandler);
    plotTool.locateOverlayer();
}

// 鼠标移动事件
const mouseMoveHandler = function (e) {
    var map = state.map;
    var plotLayer = state.plotLayer;
    var feature = map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
        return layer == plotLayer ? feature : null;
    }, {
        hitTolerance: 5
    });
    map.getTarget().style.cursor = feature ? 'pointer' : ''; //改变鼠标形状
}

//鼠标点击查询
const mouseClickHandler = function (e) {
    var map = state.map;
    var plotLayer = state.plotLayer;

    var feature = map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        if (plotLayer && plotLayer == layer)
            return feature;
    }, {
        hitTolerance: 5
    });

    //高亮当前选中feature
    if (state.lastSelectFeature)
        state.lastSelectFeature.setStyle(drawEndStyle);
    if (feature) {
        feature.setStyle(highlightStyle);
        //显示popup
        if (state.changePopup instanceof Function)
            state.changePopup(feature);
        plotTool.locateOverlayer(e.coordinate);
    } else {

        plotTool.locateOverlayer();
    }
    state.lastSelectFeature = feature;
}

//根据features构造table展示数据
const getDataFromFeatures = function () {
    var features = state.plotLayer.getSource().getFeatures();
    var data = [];
    console.log(features)
    for (let i = 0; i < features.length; i++) {
        var iconid = features[i].get('iconid');
        var name = features[i].get('name');
        var users = features[i].get('users');
        data.push({
            'iconid': iconid,
            'name': name,
            'users': users
        });
    }
    return data;
}

//共享标绘
const sharePlot = function () {
    config['$APP'].$$http("GET_SHARE_PLOT").then(data => {
        let resultData = {
                type: "FeatureCollection",
                crs: {
                    type: "name",
                    properties: {
                        name: "EPSG:3857"
                    }
                }
            },
            features1 = [];
        _.forEach(data, item => {
            let geo = eval(`(${item.data})`);
            geo.properties.iconid = item.iconid;
            geo.properties.users = item.users;
            geo.properties.name = item.name;
            geo.properties.descstr = item.descstr;
            geo.properties.share = item.share
            features1.push(geo)
        })
        resultData.features = features1;
        let features = resultData
        addPlotLayer(features);
        console.log(features)
        data = getDataFromFeatures();
        var callback = state.changePlotData;
        if (callback && callback instanceof Function) {
            callback.call(this, 'share', data);
        }
    })
    addQueryFunc();
}

//我的标绘
const privatePlot = function () {
    config['$APP'].$$http("GET_ALL_PLOT").then(data => {
        let resultData = {
                type: "FeatureCollection",
                crs: {
                    type: "name",
                    properties: {
                        name: "EPSG:3857"
                    }
                }
            },
            features1 = [];
        _.forEach(data, item => {
            if (!item.data) return;
            let geo = eval(`(${item.data})`);
            geo.properties.iconid = item.iconid;
            geo.properties.users = item.users;
            geo.properties.name = item.name;
            geo.properties.descstr = item.descstr;
            geo.properties.share = item.share
            features1.push(geo)
        })
        resultData.features = features1;
        let features = resultData
        addPlotLayer(features);
        console.log(features)
        data = getDataFromFeatures();
        var callback = state.changePlotData;
        if (callback && callback instanceof Function) {
            callback.call(this, 'private', data);
        }
    })
    //添加查询功能
    addQueryFunc();
}

//激活共享标绘或我的标绘
const active = function (map, tabName, changePopup, changePlotData) {
    // if(tabName == state.tabName)
    //     return;
    if (state.tabName == "newPlot") {
        plotTool.deactive2(); //不移除popup overlay
    }
    if (state.tabName && tabName == "newPlot") {
        plotTool.active(map, changePopup);
    }

    state.tabName = tabName;
    state.map = map;
    state.changePopup = changePopup;
    state.changePlotData = changePlotData;

    deactive();
    switch (tabName) {
        case "sharePlot": //共享标绘
            sharePlot();
            break;
        case "privatePlot": //我的标绘
            privatePlot();
            break;
        case "newPlot": //新建标绘

            break;
    }
}

export default {
    active,
    deactive
}
