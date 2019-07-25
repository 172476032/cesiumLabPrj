import config from '../../../../../script/config';
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Icon from 'ol/style/Icon';
import Point from "ol/geom/Point"
import LineString from "ol/geom/LineString"
import Polygon from "ol/geom/Polygon"
import Feature from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
//图层资源
import VectorSource from 'ol/source/Vector';
import {
  transform
} from "ol/proj"

console.log('config: ', config);
var hitTolerance = 20; // 查询像素范围
var tolerance = 10;
var esriGeometryEnvelope = 'esriGeometryEnvelope';
console.log('config["$STORE"]: ', config['$STORE']);
let store, map;
var thatThis;
import bus from '@/script/bus.js';
import linstringicon from '@/assets/img/line.png';
import polygonicon from '@/assets/img/polygon.png';
import pointicon from '@/assets/img/pointicon.png';
import {
  screenToLonlatCoords
} from '@/script/mapUtils/myMaputils/myUtils.js';
import Cesium from 'cesium/Cesium';

import {
  setImgStyle,
  setPointStyle,
  changeImgStyle,
  getCentroidOfMultiPolygon
} from '@/script/mapUtils/myMaputils/myUtils.js';
//所有的图层：
let identifyIconLayer, identifyGeomsLayer, identifyClickIconLayer, identifyClickGeomsLayer;

const setImgStyle1 = (imgSrc, text, colr) => {
  return new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: imgSrc
    })
    // text: new Text({
    //   text: text,
    //   offsetY: -24,
    //   fill: new ol.style.Fill({
    //     color: colr
    //   })
    // })
  });
};

const setPointStyle1 = (text, center) => {
  return new Style({
    image: new CircleStyle({
      center: center,
      radius: 5,
      stroke: new Stroke({
        color: 'red',
        width: 2
      })
    })
    // text: new Text({
    //   text: text,
    //   offsetY: -65,
    //   // placement: "point",
    //   font: "200px",
    //   padding: [5, 8, 5, 8],
    //   fill: new ol.style.Fill({
    //     color: "red"
    //   }),
    //   backgroundFill: new ol.style.Fill({
    //     color: "white"
    //   }),
    //   backgroundStroke: new Stroke({
    //     color: "blue"
    //   })
    // })
  });
};

const changeImgStyle1 = (imgSrc, text, oldColr, newColor) => {
  return new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: imgSrc,
      color: newColor //区别在此
    })
  });
};

//初始化需要用到的图层
const initLayers = (map, renderLayers) => {
  //如果map已经存在了其中一个图层，则认为四个图层均已创建过
  if (map.get('identifyIconLayer') != undefined) {
    return;
  }
  //identify：查询后绘制的marker图层
  identifyIconLayer = new VectorLayer({
    source: new VectorSource({}),
    zIndex: 10000,
    style: (feature) => {
      feature = feature instanceof Feature ? feature : this;
      let style;
      let str;
      //设置marker序号为1-10
      if (feature.get('index')) {
        str = feature.get('index').toString() + '\n';
      }
      if (feature.get('type') == 'pointIcon') {
        style = setImgStyle1(pointicon, str, '#fff');
      } else if (feature.get('type') == 'linestringIcon') {
        style = setImgStyle1(linstringicon, str, '#fff');
      } else if (feature.get('type') == 'polygonIcon') {
        style = setImgStyle1(polygonicon, str, '#fff');
      }
      return style;
    }
  });
  identifyIconLayer.set('name', 'identifyIconLayer');
  map.addLayer(identifyIconLayer);
  map.set('identifyIconLayer', identifyIconLayer);
  renderLayers.push(identifyIconLayer);
  //identify:界面hover时绘制的图层
  identifyGeomsLayer = new VectorLayer({
    source: new VectorSource({}),
    zIndex: 9000,
    style: (feature) => {
      feature = feature instanceof Feature ? feature : this;
      let geom = feature.getGeometry();
      let name = feature.get('featurename') ? feature.get('featurename') : feature.get('name').split('_')[2];
      let style;
      if (geom instanceof Point) {
        style = setPointStyle1(name, geom.getCoordinates());
      } else if (geom instanceof LineString) {
        style = new Style({
          stroke: new Stroke({
            color: 'red',
            width: 5
          })
        });
      } else if (geom instanceof Polygon) {
        style = new Style({
          stroke: new Stroke({
            color: 'red',
            width: 5
          })
        });
      }
      return style;
    }
  });
  identifyGeomsLayer.set('name', 'identifyGeomsLayer');
  map.addLayer(identifyGeomsLayer);
  map.set('identifyGeomsLayer', identifyGeomsLayer);
  renderLayers.push(identifyGeomsLayer);
  //identify：地图图标click时绘制的marker图层
  identifyClickIconLayer = new VectorLayer({
    source: new VectorSource({}),
    zIndex: 10000,
    style: (feature) => {
      feature = feature instanceof Feature ? feature : this;
      let style;
      let str;
      //设置marker序号为1-10
      if (feature.get('index')) {
        str = feature.get('index').toString() + '\n';
      }
      let icon;
      switch (feature.get('type')) {
        case 'pointIcon':
          icon = pointicon;
          break;
        case 'linestringIcon':
          icon = linstringicon;
          break;
        case 'polygonIcon':
          icon = polygonicon;
          break;
      }
      style = changeImgStyle1(icon, str, '#fff', 'yellow');
      return style;
    }
  });
  identifyClickIconLayer.set('name', 'identifyClickIconLayer');
  map.addLayer(identifyClickIconLayer);
  map.set('identifyClickIconLayer', identifyClickIconLayer);
  renderLayers.push(identifyClickIconLayer);
  //identify:地图图标click时绘制的线图层
  identifyClickGeomsLayer = new VectorLayer({
    source: new VectorSource({}),
    zIndex: 9000,
    style: (feature) => {
      feature = feature instanceof Feature ? feature : this;
      let geom = feature.getGeometry();
      let name = feature.get('featurename') ? feature.get('featurename') : feature.get('name').split('_')[2];
      let style;
      if (geom instanceof Point) {
        style = setPointStyle1(name, geom.getCoordinates());
      } else if (geom instanceof LineString) {
        style = new Style({
          stroke: new Stroke({
            color: 'red',
            width: 5
          })
        });
      } else if (geom instanceof Polygon) {
        style = new Style({
          stroke: new Stroke({
            color: 'red',
            width: 5
          })
        });
      }
      return style;
    }
  });
  identifyClickGeomsLayer.set('name', 'identifyClickGeomsLayer');
  map.addLayer(identifyClickGeomsLayer);
  map.set('identifyClickGeomsLayer', identifyClickGeomsLayer);
  renderLayers.push(identifyClickGeomsLayer);
};
//屏幕坐标转3857的坐标，ol坐标系下面
const screenToGeoCords = (viewer, screenX, screenY) => {
  let tolerance = 20;
  let letfBottomP = screenToLonlatCoords(viewer, screenX - tolerance, screenY + tolerance).lonlat;
  let rightTopP = screenToLonlatCoords(viewer, screenX + tolerance, screenY - tolerance).lonlat;
  let leftBottom3857 = transform([letfBottomP[0], letfBottomP[1]], 'EPSG:4326', 'EPSG:3857');
  let rightTop3857 = transform([rightTopP[0], rightTopP[1]], 'EPSG:4326', 'EPSG:3857');
  console.log('letfBottom: ', letfBottomP, rightTopP, leftBottom3857, rightTop3857);
  return leftBottom3857.concat(rightTop3857).join(',');
};
/**
 * 激活地图点查询
 * @param {ol.Map} _map 地图对象
 * @param {boolean} isTextQuery 是否是根据属性查询
 */
const active = (thatthisp) => {
  //设置鼠标的样式
  thatthisp.map.getTargetElement().style.cursor =
    "url(/static/map/search.png),auto";
  map = thatthisp.map;
  store = thatthisp.$store;
  thatThis = thatthisp;
  //初始化用于渲染的的所有图层
  initLayers(map, thatthisp.$store.state.map.renderLayers);
  // debugger;
  let identifyClickEvt = map.on('click', queryMapPoint);
  store.state.map.mapEventHistory.unByKey.push(identifyClickEvt);


  //三维的查询从这你开始
  if (store.state.map.is3dMap) {
    //注册鼠标点击事件
    let identity3dHandler = new Cesium.ScreenSpaceEventHandler(window.Viewer.scene.canvas);
    identity3dHandler.setInputAction((evt) => {
      console.log('evt: ', evt);
      queryObjByWs('', '', screenToGeoCords(window.Viewer, evt.position.x, evt.position.y));
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    store.state.map.identity3dHandler = identity3dHandler;
  }
};
/**
 * 点击查询响应事件
 */
const queryMapPoint = () => {
  bus.$emit('setemptyResultFalse_true', true);
  identifyIconLayer.getSource().clear();
  //恢复图层的样式
  var event = window.event || arguments[0];
  queryObjByWs(event.offsetX, event.offsetY);
};

/**
 * 点击查询，采用web service查询，速度较快
 * @param {Number} pixelX 查询点击X坐标
 * @param {Number} pixelY 查询点击Y坐标
 */
const queryObjByWs = (pixelX, pixelY, geometry) => {
  //每次查询前清除所有已绘制图层
  store.state.map.renderLayers.forEach((layer) => {
    if (layer instanceof VectorLayer) {
      layer.getSource().clear();
    }
  });
  let payload = {};
  // 遍历可查询 可见图层 并获取canQueryLayersConfigs内排序的图层名称数组
  let selectTreeLayers = store.state.map.selectTreeLayers;
  console.log('selectTreeLayers: ', selectTreeLayers);
  let canQueryLayersConfigs = [];
  //每次点击查询清除图层列表名称，防止重复
  store.state.map.identifyMapNames = [];
  _.forEach(selectTreeLayers, (themeLayer) => {
    if (themeLayer.canquery == true) {
      canQueryLayersConfigs.push({
        url: themeLayer.url,
        type: themeLayer.type
      });
      store.state.map.identifyMapNames.push(themeLayer.name);
    }
  });
  console.log('勾选并且后台配置为可查询的图层列表：', selectTreeLayers);
  //

  //获得点击的范围【三维模拟二维的identity，参数主要区别就在参数geometry，再次更改】
  if (store.state.map.is3dMap) {
    payload.geometry = geometry;
  } else {
    var mapBounds = getQueryBox(pixelX, pixelY);
    payload.geometry = mapBounds[0] + ',' + mapBounds[1] + ',' + mapBounds[2] + ',' + mapBounds[3];
  }

  //获取地图范围和canvas宽度和高度
  let mapSize = map.getSize();
  let leftBottom = map.getCoordinateFromPixel([0, mapSize[1]]);
  let rightTop = map.getCoordinateFromPixel([mapSize[0], 0]);
  payload.mapExtent = leftBottom.concat(rightTop);
  payload.imageDisplay = mapSize.concat([96]);

  payload.f = 'pjson';
  payload.tolerance = tolerance;
  payload.geometryType = esriGeometryEnvelope;
  payload.LayersConfigs = canQueryLayersConfigs;
  let promise = store.dispatch('LOAD_IDENTIFYLIST_DATA', payload);
  store.state.map.searchLoadStatus = true;
  //results:请求的原始结果 resArr：过滤每个promise查询结果内为undefined或者查询条数为0的后的结果 listData：解析后供视图展示的结果
  promise.then((results) => {
    //隐藏详情，展开查询列表
    bus.$emit('handleDetailBackBtnClickReSEACH');
    //处理返回的结果，过滤掉undefined或者为空的数据，并计算返回的要素条数
    let num = 0;
    let resArr = [];
    let spliceIndex = [];
    console.log('identify解析前的数据', results);
    _.map(results, (re, index) => {
      if (re.error == undefined) {
        if (re != undefined && re.data.results.length != 0) {
          //过滤每个promise查询结果内为undefined或者查询条数为0的条数
          resArr.push(re.data);
          num += re.data.results.length;
        } else {
          spliceIndex.push(index);
        }
      } else {
        spliceIndex.push(index);
      }
    });
    if (num == 0) {
      thatThis.$Message.info('无查询结果');
      store.state.map.norltShow = true;
      //清除上次的查询结果
      store.state.map.identifyListData.identifyList = [];
      return;
    }
    console.log('查询的要素条数:', num);
    console.log('删除前', store.state.map.identifyMapNames);
    //删除索引为spliceIndex的图层名称
    let identifyMapNames = store.state.map.identifyMapNames;
    let oldnum = identifyMapNames.length;
    let newnum = 0;
    _.map(spliceIndex, (sp, index) => {
      if (index == 0) {
        identifyMapNames.splice(spliceIndex[index], 1);
        newnum = identifyMapNames.length;
      } else {
        identifyMapNames.splice(spliceIndex[index] - (oldnum - newnum), 1);
        newnum = identifyMapNames.length;
      }
    });
    store.state.map.identifyOldMapNames = store.state.map.identifyMapNames;
    console.log('删除后', store.state.map.identifyMapNames);
    //对查询的结果进行解析
    // debugger;
    let listData = [];
    _.forEach(resArr, (item, index) => {
      let mapserverInfo = {};
      mapserverInfo.featureInfo = [];
      mapserverInfo.Name = identifyMapNames[index];
      let result = item.results;
      _.forEach(result, (r, index) => {
        let featureInfo = {};
        featureInfo.name = r.value; //给要素赋属性值
        featureInfo.id = index + 1;
        featureInfo.geometry = r.geometry;
        featureInfo.attributes = r.attributes;
        featureInfo.geometryType = r.geometryType;
        featureInfo.layerId = r.layerId;
        featureInfo.layerName = r.layerName;
        featureInfo.mapServerName = mapserverInfo.Name;
        mapserverInfo.featureInfo.push(featureInfo);
      });
      listData.push(mapserverInfo);
    });
    //给查询到的结果赋值给store，供界面展示结果
    console.log('解析后的identify查询结果', listData);
    let identifyListData = store.state.map.identifyListData;
    identifyListData.total = num;
    identifyListData.identifyList = listData;
    store.state.map.identifyshow = true;
    renderIdentifyIconLayer(listData);
    //渲染三维地球查询出来的要素
    rederIdentity3dMap(listData);
  }).catch((err) => {
    console.log("查询出错")
  }).finally(() => {
    //隐藏loading动画
    store.state.map.searchLoadStatus = false;
  });;
};
//渲染三维地球查询出来的要素
const rederIdentity3dMap = (listData) => {
  let len = listData.length;
  console.log('listDatassssssss: ', listData);
  for (let i = 0; i < len; i++) {
    let flen = listData[i].featureInfo.length;
    for (let j = 0; j < flen; j++) {
      let fe = listData[i].featureInfo[j];
      let entity,
        arr = [];
      debugger;
      if (fe.geometryType == "esriGeometryPoint") {
        let cords = transform([fe.geometry.x, fe.geometry.y], 'EPSG:3857', 'EPSG:4326');
        console.log('cords: ', cords);
        entity = {
          id: fe.name + j,
          position: Cesium.Cartesian3.fromDegrees(cords[0], cords[1]),
          billboard: {
            image: '../../../static/map/pointicon.png'
          }
        };
        window.Viewer.entities.add(entity);
      } else if (fe.geometryType == "esriGeometryPolyline") {
        let karr = [],
          klen = fe.geometry.paths[0].length;
        for (let k = 0; k < klen; k++) {
          let cords = transform(fe.geometry.paths[0][k], 'EPSG:3857', 'EPSG:4326');
          karr.push(cords[0]);
          karr.push(cords[1]);
        }
        console.log('karr: ', karr);
        //添加面
        entity = {
          id: fe.name + j,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(karr),
            width: 5,
            material: Cesium.Color.RED,
            clampToGround: true
          }
        };
        //添加图标
        let center = transform(fe.geometry.paths[0][Math.floor(fe.geometry.paths[0].length / 2)], 'EPSG:3857', 'EPSG:4326');
        let billboard = {
          id: fe.name + "-" + j,
          position: Cesium.Cartesian3.fromDegrees(center[0], center[1]),
          billboard: {
            image: '../../../static/map/themeLayers/河流.png'
          }
        }
        window.Viewer.entities.add(entity);
        window.Viewer.entities.add(billboard);

      } else if (fe.geometryType == "esriGeometryPolygon") {
        for (let p = 0; p < fe.geometry.rings.length; p++) {
          let pilen = fe.geometry.rings[p].length,
            piarr = [];
          for (let pi = 0; pi < pilen; pi++) {
            let cords = transform(fe.geometry.rings[p][pi], 'EPSG:3857', 'EPSG:4326');
            piarr.push(cords[0]);
            piarr.push(cords[1]);
          }
          entity = {
            name: fe.name + j,
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(piarr),
              material: Cesium.Color.RED
            }
          }
        }
        window.Viewer.entities.add(entity);

      }
    }

    // window.Viewer.entities.add({
    //   id: ""
    // })
  }
};
//drawFeature()

//绘制要素到地图，利用解析后的结果listDate
const renderIdentifyIconLayer = (listData) => {
  var identifyIconFeatures = [];
  identifyIconLayer.getSource().clear();
  _.forEach(listData, (listItem) => {
    let featureInfo = listItem.featureInfo;
    let mapServerName = listItem.Name;
    _.forEach(featureInfo, (feature, index) => {
      //绘制点注记
      if (feature.geometryType == 'esriGeometryPoint') {
        let marker = new Feature({
          geometry: new Point([feature.geometry.x, feature.geometry.y])
        });
        marker.set('type', 'pointIcon'); //根据类型，渲染不同的图标
        marker.set('index', feature.id); //设置图标序号
        marker.set('mapServerName', mapServerName); //设置地图服务名称
        marker.set('name', mapServerName + '_icon_' + feature.name + '_' + feature.id); //设置要素的唯一标示：地图服务名称+"_icon"+id
        marker.set('property', feature);
        identifyIconFeatures.push(marker);
      } else if (feature.geometryType == 'esriGeometryPolyline') {
        let center = feature.geometry.paths[0][Math.round(feature.geometry.paths[0].length / 2)];
        let marker = new Feature({
          geometry: new Point([center[0], center[1]])
        });
        marker.set('type', 'linestringIcon'); //根据类型，渲染不同的图标
        marker.set('index', feature.id); //设置图标序号
        marker.set('mapServerName', mapServerName); //设置地图服务名称
        marker.set('name', mapServerName + '_icon_' + feature.name + '_' + feature.id); //设置要素的唯一标示：地图服务名称+"_icon"+id
        marker.set('property', feature);
        identifyIconFeatures.push(marker);
      } else if (feature.geometryType == 'esriGeometryPolygon') {
        let centerPoint = getCentroidOfMultiPolygon(feature.geometry);
        console.log('centerPoint: ', centerPoint);
        let marker = new Feature({
          geometry: new Point([centerPoint[0], centerPoint[1]])
        });
        marker.set('type', 'polygonIcon'); //根据类型，渲染不同的图标
        marker.set('index', feature.id); //设置图标序号
        marker.set('mapServerName', mapServerName); //设置地图服务名称
        marker.set('name', mapServerName + '_icon_' + feature.name + '_' + feature.id); //设置要素的唯一标示：地图服务名称+"_icon"+id
        marker.set('property', feature);
        identifyIconFeatures.push(marker);
      }
    });
  });
  //添加新要素之前注册事件
  let rendererIdentifyGeometryEvt = map.on('pointermove', rendererIdentifyGeometry);
  store.state.map.mapEventHistory.unByKey.push(rendererIdentifyGeometryEvt);
  identifyIconLayer.getSource().addFeatures(identifyIconFeatures);
  console.log('图标要素：', identifyIconFeatures);
};
//鼠标pointer到图标要素是设置图标样式
const setPointerStyle = (feature, img, color, str) => {
  debugger;
  console.log('feature: ', feature);
  /*之前那的标注20190415
  feature.setStyle(
    new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: img,
        color: color
      }),
      text: new Text({
        text: str,
        offsetY: -24,
        fill: new ol.style.Fill({
          color: "#fff"
        })
      })
    })
  );*/
  //修改为弹出overlay的形式20190415
  store.commit('SET_HOVERED_FEATURE', {
    type: 'overAllSearch',
    feature: feature
  });
};
//鼠标pointer到图标后，离开图标时设置样式
const rePointerStyle = (feature, img, str) => {
  /* feature.setStyle(
     new Style({
       image: new Icon({
         anchor: [0.5, 1],
         src: img
       }),
       text: new Text({
         text: str,
         offsetY: -24,
         fill: new ol.style.Fill({
           color: "#fff"
         })
       })
     })
   );*/
  //修改为隐藏overlay的形式
  store.commit('SET_HOVERED_FEATURE', {
    type: 'overAllSearch',
    feature: null
  });
};
const rendererIdentifyGeometry = (mapevt) => {
  // alert(1);
  let identifyRenderFeatures = [];
  let featuresAtPixel = map.getFeaturesAtPixel(mapevt.pixel);
  // console.log("鼠标pointer到的featuresAtPixel: ", featuresAtPixel);

  if (featuresAtPixel == null || featuresAtPixel[0].getId() == 'modalFeature') {
    //恢复地图的点查询事件
    // map.getTargetElement().style.cursor = "Crosshair";seachIco
    map.getTargetElement().style.cursor = 'url(/static/map/search.png),auto';
    let queryMapPointEvt = map.on('click', queryMapPoint);
    store.state.map.mapEventHistory.unByKey.push(queryMapPointEvt);
    let rendererIdentifyGeometryEvt = map.on('pointermove', rendererIdentifyGeometry);
    store.state.map.mapEventHistory.unByKey.push(rendererIdentifyGeometryEvt);

    map.un('click', showIdentifyInfo);
    //清楚已绘制的图形
    identifyGeomsLayer.getSource().clear();
    //pointer后恢复图层的样式到原始状态
    _.map(identifyIconLayer.getSource().getFeatures(), (ft) => {
      let str;
      let img;
      let feature = ft.get('property');
      if (ft.get('index')) {
        str = ft.get('index').toString() + '\n';
      }
      if (feature.geometryType == 'esriGeometryPoint') {
        img = pointicon;
      } else if (feature.geometryType == 'esriGeometryPolyline') {
        img = linstringicon;
      } else if (feature.geometryType == 'esriGeometryPolygon') {
        img = polygonicon;
      }
      rePointerStyle(ft, img, str);
    });
    return;
  } else {
    map.getTargetElement().style.cursor = 'pointer';
    map.un('click', queryMapPoint);
    let showIdentifyInfoEvt = map.on('click', showIdentifyInfo);
    store.state.map.mapEventHistory.unByKey.push(showIdentifyInfoEvt);
  }
  //悬浮在图标上时
  _.map(featuresAtPixel, (ft) => {
    //设置样式
    let str;
    if (ft.get('index')) {
      str = ft.get('index').toString() + '\n';
    }
    //对图标要素进行处理
    if (ft.get('property') == undefined) {
      return;
    }
    //得到图标的坐标
    let markerCor = ft.getGeometry().getCoordinates();
    let feature = ft.get('property');
    // console.log("需要渲染的要素", feature);
    let mapServerName = ft.get('mapServerName');
    // console.log(feature);
    if (feature.geometryType == 'esriGeometryPoint') {
      let marker = new Feature({
        geometry: new Point([feature.geometry.x, feature.geometry.y])
      });
      marker.set('name', mapServerName + '_feature_' + feature.name + '_' + feature.id); //设置要素的唯一标示：地图服务名称+_feature+id
      identifyRenderFeatures.push(marker);
      //设置样式
      setPointerStyle(ft, pointicon, 'yellow', str);
    } else if (feature.geometryType == 'esriGeometryPolyline') {
      // console.log("ahhafeature: ", feature, "markerCor", markerCor);
      let marker = new Feature({
        geometry: new Point(markerCor)
      });
      marker.set('name', mapServerName + '_feature_' + feature.name + '_' + feature.id); //设置要素的唯一标示：地图服务名称+_feature+id
      identifyRenderFeatures.push(marker);
      // console.log(feature.geometry.paths);
      let linestring = new Feature({
        geometry: new LineString(feature.geometry.paths[0])
      });
      linestring.set('name', mapServerName + '_feature_' + feature.name + '_' + feature.id); //设置要素的唯一标示：地图服务名称+_feature+id
      identifyRenderFeatures.push(linestring);
      //设置样式
      setPointerStyle(ft, linstringicon, 'yellow', str);
    } else if (feature.geometryType == 'esriGeometryPolygon') {
      let marker = new Feature({
        geometry: new Point(markerCor)
      });
      marker.set('name', mapServerName + '_feature_' + feature.name + '_' + feature.id); //设置要素的唯一标示：地图服务名称+_feature+id
      identifyRenderFeatures.push(marker);
      console.log('feature.geometry.rings: ', feature.geometry.rings);
      let multiPolygon = new Feature({
        geometry: new Polygon(feature.geometry.rings)
      });
      multiPolygon.set('name', mapServerName + '_feature_' + feature.name + '_' + feature.id); //设置要素的唯一标示：地图服务名称+_feature+id
      identifyRenderFeatures.push(multiPolygon);
      //设置样式
      setPointerStyle(ft, polygonicon, 'yellow', str);
    }
  });
  //添加新要素之前清除其他要素
  identifyGeomsLayer.getSource().clear();
  identifyGeomsLayer.getSource().addFeatures(identifyRenderFeatures);
  // console.log("鼠标触碰显示要素：", identifyRenderFeatures);
};
//鼠标点击identify图标时绘制要素
export const renderClikFeatures = (featureone, feature, mapServerName) => {
  console.log('featureone: ', featureone);
  //得到图标的坐标
  // let markerCor = featureone.getGeometry().getCoordinates();
  //点击时绘制线
  let features = [];
  if (feature.geometryType == 'esriGeometryPoint') {
    let marker = new Feature({
      geometry: new Point([feature.geometry.x, feature.geometry.y])
    });
    marker.set('name', mapServerName + '_icon_' + feature.name + '_' + feature.id);
    features.push(marker);
  } else if (feature.geometryType == 'esriGeometryPolyline') {

    let linestring = new Feature({
      geometry: new LineString(feature.geometry.paths[0])
    });
    linestring.set('name', mapServerName + '_icon_' + feature.name + '_' + feature.id);
    features.push(linestring);
  } else if (feature.geometryType == 'esriGeometryPolygon') {

    let multiPolygon = new Feature({
      geometry: new Polygon(feature.geometry.rings)
    });
    multiPolygon.set('name', mapServerName + '_icon_' + feature.name + '_' + feature.id);
    features.push(multiPolygon);
  }

  //点击时重新绘制图标
  let str;
  let identifyClickIconFeatures = [];
  if (featureone instanceof Feature) {
    str = featureone.get('index').toString() + '\n';
  } else {
    str = featureone;
  }
  if (feature.geometryType == 'esriGeometryPoint') {
    let marker = new Feature({
      geometry: new Point([feature.geometry.x, feature.geometry.y])
    });
    marker.set('type', 'pointIcon'); //根据类型，渲染不同的图标
    marker.set('index', feature.id); //设置图标序号
    marker.set('mapServerName', mapServerName); //设置地图服务名称
    marker.set('name', mapServerName + '_icon_' + feature.name + '_' + feature.id); //设置要素的唯一标示：地图服务名称+"_icon"+id
    marker.set('property', feature);
    identifyClickIconFeatures.push(marker);
    features.push(marker);
    //设置样式
  } else if (feature.geometryType == 'esriGeometryPolyline') {
    let center = feature.geometry.paths[0][Math.round(feature.geometry.paths[0].length / 2)];
    let marker = new Feature({
      geometry: new Point([center[0], center[1]])
    });
    marker.set('type', 'linestringIcon'); //根据类型，渲染不同的图标
    marker.set('index', feature.id); //设置图标序号
    marker.set('mapServerName', mapServerName); //设置地图服务名称
    marker.set('name', mapServerName + '_icon_' + feature.name + '_' + feature.id); //设置要素的唯一标示：地图服务名称+"_icon"+id
    marker.set('property', feature);
    identifyClickIconFeatures.push(marker);
    features.push(marker);
  } else if (feature.geometryType == 'esriGeometryPolygon') {
    let centerPoint = getCentroidOfMultiPolygon(feature.geometry);
    let marker = new Feature({
      geometry: new Point([centerPoint[0], centerPoint[1]])
    });
    marker.set('type', 'polygonIcon'); //根据类型，渲染不同的图标
    marker.set('index', feature.id); //设置图标序号
    marker.set('mapServerName', mapServerName); //设置地图服务名称
    marker.set('name', mapServerName + '_icon_' + feature.name + '_' + feature.id); //设置要素的唯一标示：地图服务名称+"_icon"+id
    marker.set('property', feature);
    identifyClickIconFeatures.push(marker);
    features.push(marker);
  }
  identifyClickGeomsLayer.getSource().clear();
  identifyClickGeomsLayer.getSource().addFeatures(features);
  identifyClickIconLayer.getSource().clear();
  identifyClickIconLayer.getSource().addFeatures(identifyClickIconFeatures);
  //缩放至要显示的要素范围内

  return features;
};
const showIdentifyInfo = (mapevt) => {
  let featureone = map.getFeaturesAtPixel(mapevt.pixel)[0];
  let feature = map.getFeaturesAtPixel(mapevt.pixel)[0].get('property');
  let mapServerName = featureone.get('mapServerName');
  //重新绘制线要素
  renderClikFeatures(featureone, feature, mapServerName);
  //触发identify详情展示
  bus.$emit('showIdentifyInfo', {
    mapServerName: featureone.get('mapServerName'),
    property: featureone.get('property')
  });
};

/**
 * 辅助函数
 * 根据点击的屏幕坐标，获取地理真实查询范围
 * @param {Number} offsetX 屏幕X坐标
 * @param {Number} offsetY 屏幕Y坐标
 */
const getQueryBox = (offsetX, offsetY, width, height) => {
  debugger;
  width = width || hitTolerance;
  height = height || hitTolerance;
  var leftBottomPoint = [offsetX - width / 2, offsetY + height / 2];
  var rightTopPoint = [offsetX + width / 2, offsetY - height / 2];
  var bbox = map.getCoordinateFromPixel(leftBottomPoint).concat(map.getCoordinateFromPixel(rightTopPoint));
  // if (bbox[0] < -180) {
  //   bbox[0] = -180;
  // }
  // if (bbox[1] < -90) {
  //   bbox[1] = -90;
  // }
  // if (bbox[2] > 180) {
  //   bbox[2] = 180;
  // }
  // if (bbox[3] > 90) {
  //   bbox[3] = 90;
  // }
  return bbox;
};

export default {
  active
};
