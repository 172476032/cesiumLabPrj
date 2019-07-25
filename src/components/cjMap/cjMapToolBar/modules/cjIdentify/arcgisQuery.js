import config from '../../../../../script/config';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Icon from 'ol/style/Icon';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import Feature from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import Select from 'ol/interaction/Select';
import EsriJSON from 'ol/format/EsriJSON';
import Cesium from "cesium/Cesium";

//图层资源
import VectorSource from 'ol/source/Vector';
import {
  transform
} from 'ol/proj';
import {
  pointerMove
} from 'ol/events/condition';

let hitTolerance = 20, // 查询像素范围
  tolerance2dVal = 10,
  tolerance3dVal = 20,
  esriGeometryEnvelope = 'esriGeometryEnvelope',
  store, is3dMap,
  map, addedEntities = [],
  thatThis,
  identifyIconLayer,
  identifyGeomsLayer;
import bus from '@/script/bus.js';
import linstringicon from '@/assets/img/line.png';
import polygonicon from '@/assets/img/polygon.png';
import pointicon from '@/assets/img/pointicon.png';
import {
  getCentroidOfMultiPolygon,
  screenToLonlatCoords,
  getUuid
} from '@/script/mapUtils/myMaputils/myUtils.js';

/**
 * 激活地图点查询
 * @param {ol.Map} _map 地图对象
 * @param {Object} thatThis  
 */
const active = (thatThisp) => {
  is3dMap = thatThisp.is3dMap;
  map = thatThisp.map;
  store = thatThisp.$store;
  thatThis = thatThisp;
  //二维查询
  if (!is3dMap) {
    thatThis.map.getTargetElement().style.cursor = thatThis.$store.state.map.cursorType = 'url(/static/map/search.png),auto';
    //初始化用于渲染的的所有图层
    initLayers(map, thatThis.$store.state.map.renderLayers);
    let identifyClickEvt = map.on('click', queryMapPoint);
    store.state.map.mapEventHistory.unByKey.push(identifyClickEvt);
  } else { //三维查询
    //注册鼠标点击事件  //暂时全部注释,和查询逻辑有关,其实不需要这样
    // let identity3dHandler = new Cesium.ScreenSpaceEventHandler(window.Viewer.scene.canvas);
    // identity3dHandler.setInputAction((evt) => {
    //   console.log('evt: ', evt);
    //   queryObjByWs('', '', screenToGeoCords(window.Viewer, evt.position.x, evt.position.y));
    // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // store.state.map.identity3dHandler = identity3dHandler;
  }
};

//初始化需要用到的图层
const initLayers = (map, renderLayers) => {
  //如果map已经存在了其中一个图层，则认为2个图层均已创建过
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
      if (feature.get('type') == 'pointicon') {
        style = setImgStyle(pointicon, str, '#fff');
      } else if (feature.get('type') == 'linstringicon') {
        style = setImgStyle(linstringicon, str, '#fff');
      } else if (feature.get('type') == 'polygonicon') {
        style = setImgStyle(polygonicon, str, '#fff');
      }
      return style;
    }
  });
  identifyIconLayer.set('name', 'identifyIconLayer');
  map.addLayer(identifyIconLayer);
  map.set('identifyIconLayer', identifyIconLayer);
  renderLayers.push(identifyIconLayer);
  // 添加图层交互事件
  addPointerMoveEvt(identifyIconLayer);
  //identify:界面hover时绘制的图层
  identifyGeomsLayer = new VectorLayer({
    source: new VectorSource({}),
    zIndex: 9000,
    style: () => {
      return new Style({
        stroke: new Stroke({
          color: 'red',
          width: 5
        })
      });
    }
  });
  identifyGeomsLayer.set('name', 'identifyGeomsLayer');
  map.addLayer(identifyGeomsLayer);
  map.set('identifyGeomsLayer', identifyGeomsLayer);
  renderLayers.push(identifyGeomsLayer);
};

/**
 * 点击查询响应事件
 */
const queryMapPoint = () => {
  bus.$emit('setemptyResultFalse_true', true);
  bus.$emit('rest-search-text');
  //清除所有绘制结果
  store.dispatch('ALL_CLOSE_CLEAR');
  //恢复图层的样式
  var event = window.event || arguments[0];
  queryObjByWs(event.offsetX, event.offsetY);
};

const setImgStyle = (imgSrc, text, colr) => {
  return new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: imgSrc
    })
    // text: new ol.style.Text({
    //   text: text,
    //   offsetY: -24,
    //   fill: new ol.style.Fill({
    //     color: colr
    //   })
    // })
  });
};
const addPointerMoveEvt = (identifyIconLayer) => {
  let pointMoverInteraction = new Select({
    layers: [identifyIconLayer],
    condition: pointerMove,
    style: (f) => {
      let type = f.get('type'),
        style;
      if (type == 'pointicon') {
        style = setImgStyle(pointicon, 'str', '#fff');
      } else if (type == 'linstringicon') {
        style = setImgStyle(linstringicon, 'str', '#fff');
      } else if (type == 'polygonicon') {
        style = setImgStyle(polygonicon, 'str', '#fff');
      }
      return style;
    }
  });
  pointMoverInteraction.on('select', (e) => {
    console.log('e: ', e);
    if (e.selected.length > 0) {
      store.commit('SET_HOVERED_FEATURE', {
        type: 'overAllSearch',
        feature: e.selected[0]
      });
      //绘制要素
      identifyGeomsLayer.getSource().addFeature(e.selected[0].get('evtFeature'));
    } else {
      //修改为隐藏overlay的形式
      identifyGeomsLayer.getSource().clear();
      store.commit('SET_HOVERED_FEATURE', {
        type: 'overAllSearch',
        feature: null
      });
    }
  });
  map.addInteraction(pointMoverInteraction);
};
export const renderClikFeatures = (marker) => {
  identifyGeomsLayer.getSource().clear();
  identifyGeomsLayer.getSource().addFeature(marker);
};

/**
 * 点击查询，采用web service查询，速度较快
 * @param {Number} pixelX 查询点击X坐标
 * @param {Number} pixelY 查询点击Y坐标
 */
const queryObjByWs = (pixelX, pixelY, geometry) => {
  let selectTreeLayers, canQueryLayersConfigs = [],
    payload = {};
  if (!is3dMap) {
    // debugger
    //每次查询前清除所有已绘制图层
    store.state.map.renderLayers.forEach((layer) => {
      if (layer instanceof VectorLayer) {
        layer.getSource().clear();
      }
    });
    selectTreeLayers = store.state.map.selectTreeLayers;
    let mapBounds = getQueryBox(pixelX, pixelY);
    payload.geometry = mapBounds[0] + ',' + mapBounds[1] + ',' + mapBounds[2] + ',' + mapBounds[3];
    payload.tolerance = tolerance2dVal;

  } else {
    selectTreeLayers = store.state.map.select3dTreeLayers;
    payload.geometry = geometry
    payload.tolerance = tolerance3dVal;

  }
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



  //获取地图范围和canvas宽度和高度
  let mapSize = map.getSize(),
    leftBottom = map.getCoordinateFromPixel([0, mapSize[1]]),
    rightTop = map.getCoordinateFromPixel([mapSize[0], 0]);
  payload.mapExtent = leftBottom.concat(rightTop);
  payload.imageDisplay = mapSize.concat([96]);
  payload.f = 'pjson';
  payload.geometryType = esriGeometryEnvelope;
  payload.LayersConfigs = canQueryLayersConfigs;
  let promise = store.dispatch('LOAD_IDENTIFYLIST_DATA', payload);

  store.state.map.searchLoadStatus = true;
  store.state.map.searchCloseShow = false;
  //results:请求的原始结果 resArr：过滤每个promise查询结果内为undefined或者查询条数为0的后的结果 listData：解析后供视图展示的结果
  promise
    .then((results) => {
      //隐藏详情，展开查询列表
      bus.$emit('handleDetailBackBtnClickReSEACH');
      //处理返回的结果，过滤掉undefined或者为空的数据，并计算返回的要素条数
      let num = 0;
      let resArr = [];
      let spliceIndex = [];
      console.log('identify解析前的数据', results);
      _.forEach(results, (re, index) => {
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
      _.forEach(spliceIndex, (sp, index) => {
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
      // // debugger;
      let listData = [];
      //清除实体
      if (this.is3dMap) {
        window.Viewer.entities.removeAll()
      }
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
          if (!is3dMap) {
            featureInfo.marker = createFeatures(featureInfo, featureInfo.mapServerName);
          } else {
            rederIdentity3dMap(featureInfo)
          }
        });
        listData.push(mapserverInfo);
      });
      //给查询到的结果赋值给store，供界面展示结果
      console.log('解析后的identify查询结果', listData);
      let identifyListData = store.state.map.identifyListData;
      identifyListData.total = num;
      identifyListData.identifyList = listData;
    })
    .catch((err) => {
      console.log('err');
    })
    .finally(() => {
      //切换显示组件
      store.state.map.curDropDown = 'identifyContents';
      store.state.map.searchCloseShow = true;
      store.state.map.searchLoadStatus = false;
    });
};

const createFeatures = (feature, mapServerName) => {
  let marker,
    identifyIconFeatures = [];
  if (feature.geometryType == 'esriGeometryPoint') {
    marker = new Feature({
      geometry: new Point([feature.geometry.x, feature.geometry.y])
    });
    marker.set('type', 'pointicon'); //根据类型，渲染不同的图标
    marker.set('index', feature.id); //设置图标序号
    marker.set('mapServerName', mapServerName); //设置地图服务名称
    marker.set('property', feature);
    marker.set('evtFeature', marker);
    marker.set('center', [feature.geometry.x, feature.geometry.y]);
    identifyIconFeatures.push(marker);
  } else if (feature.geometryType == 'esriGeometryPolyline') {
    let center = feature.geometry.paths[0][Math.round(feature.geometry.paths[0].length / 2)];
    marker = new Feature({
      geometry: new Point([center[0], center[1]])
    });
    marker.set('type', 'linstringicon'); //根据类型，渲染不同的图标
    marker.set('index', feature.id); //设置图标序号
    marker.set('mapServerName', mapServerName); //设置地图服务名称
    marker.set('property', feature);
    marker.set('center', [center[0], center[1]]);

    marker.set('evtFeature', new EsriJSON().readFeature(feature));
    identifyIconFeatures.push(marker);
    //绘制点
  } else if (feature.geometryType == 'esriGeometryPolygon') {
    let centerPoint = getCentroidOfMultiPolygon(feature.geometry);
    console.log('centerPoint: ', centerPoint);
    marker = new Feature({
      geometry: new Point([centerPoint[0], centerPoint[1]])
    });
    marker.set('type', 'polygonicon'); //根据类型，渲染不同的图标
    marker.set('index', feature.id); //设置图标序号
    marker.set('mapServerName', mapServerName); //设置地图服务名称
    marker.set('property', feature);
    marker.set('center', [centerPoint[0], centerPoint[1]]);
    marker.set('evtFeature', new EsriJSON().readFeature(feature));
    identifyIconFeatures.push(marker);
  }
  identifyIconLayer.getSource().addFeatures(identifyIconFeatures);
  return marker;
};
/**
 * 辅助函数
 * 根据点击的屏幕坐标，获取地理真实查询范围
 * @param {Number} offsetX 屏幕X坐标
 * @param {Number} offsetY 屏幕Y坐标
 */
const getQueryBox = (offsetX, offsetY, width, height) => {
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


//////////----三维相关方法
//屏幕坐标转3857的坐标，ol坐标系下面
const screenToGeoCords = (viewer, screenX, screenY) => {
  let letfBottomP = screenToLonlatCoords(viewer, screenX - tolerance3dVal, screenY + tolerance3dVal).lonlat;
  let rightTopP = screenToLonlatCoords(viewer, screenX + tolerance3dVal, screenY - tolerance3dVal).lonlat;
  let leftBottom3857 = transform([letfBottomP[0], letfBottomP[1]], 'EPSG:4326', 'EPSG:3857');
  let rightTop3857 = transform([rightTopP[0], rightTopP[1]], 'EPSG:4326', 'EPSG:3857');
  console.log('letfBottom: ', letfBottomP, rightTopP, leftBottom3857, rightTop3857);
  return leftBottom3857.concat(rightTop3857).join(',');
};

//渲染三维地球查询出来的要素
const rederIdentity3dMap = (featureInfo) => {
  let entity,
    addedEntities = [];
  if (featureInfo.geometryType == "esriGeometryPoint") {
    let cords = transform([featureInfo.geometry.x, featureInfo.geometry.y], 'EPSG:3857', 'EPSG:4326');
    console.log('cords: ', cords);
    entity = {
      id: featureInfo.name + getUuid(),
      position: Cesium.Cartesian3.fromDegrees(cords[0], cords[1]),
      billboard: {
        image: "../../../../../../static/map/pointicon.png"
      }
    };
    window.Viewer.entities.add(entity);
    addedEntities.push(entity)
  } else if (featureInfo.geometryType == "esriGeometryPolyline") {
    let karr = [],
      klen = featureInfo.geometry.paths[0].length;
    for (let k = 0; k < klen; k++) {
      let cords = transform(featureInfo.geometry.paths[0][k], 'EPSG:3857', 'EPSG:4326');
      karr.push(cords[0]);
      karr.push(cords[1]);
    }
    console.log('karr: ', karr);
    //添加面
    entity = {
      id: featureInfo.name + getUuid(),
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(karr),
        width: 5,
        material: Cesium.Color.RED,
        clampToGround: true
      }
    };
    //添加图标
    let center = transform(featureInfo.geometry.paths[0][Math.floor(featureInfo.geometry.paths[0].length / 2)], 'EPSG:3857', 'EPSG:4326');
    let billboard = {
      id: featureInfo.name + "-" + k,
      position: Cesium.Cartesian3.fromDegrees(center[0], center[1]),
      billboard: {
        image: '../../../../../../static/map/themeLayers/河流.png'
      }
    }
    window.Viewer.entities.add(entity);
    window.Viewer.entities.add(billboard);
    addedEntities.push(entity)
    addedEntities.push(billboard)
  } else if (featureInfo.geometryType == "esriGeometryPolygon") {
    for (let p = 0; p < featureInfo.geometry.rings.length; p++) {
      let pilen = featureInfo.geometry.rings[p].length,
        piarr = [];
      for (let pi = 0; pi < pilen; pi++) {
        let cords = transform(featureInfo.geometry.rings[p][pi], 'EPSG:3857', 'EPSG:4326');
        piarr.push(cords[0]);
        piarr.push(cords[1]);
      }
      entity = {
        name: featureInfo.name + getUuid(),
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(piarr),
          material: Cesium.Color.RED
        }
      }
    }
    window.Viewer.entities.add(entity);
    addedEntities.push(entity)
  }
}

/**
 * viewer
 * lonlat:[112,32]
 * imgSrc:"../../../../static/map/layertree/水库.png"
 * tetx:"asas"
 */
const addBillBoard = (viewer, lonlat, imgSrc, text, fontsize, scale) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lonlat[0], lonlat[1]),
    billboard: {
      image: this.drawCanvas(imgSrc, text, fontsize), // default: undefined
      show: true, // default
      // pixelOffset: new Cesium.Cartesian2(0, -50), // default: (0, 0)
      eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0), // default
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT, // default
      verticalOrigin: Cesium.VerticalOrigin.CENTER, // default: CENTER
      scale: scale, // default: 1.0
      // color: Cesium.Color.LIME, // default: WHITE
      // rotation: Cesium.Math.PI_OVER_FOUR, // default: 0.0
      alignedAxis: Cesium.Cartesian3.ZERO // default
      // width: 100, // default: undefined
      // height: 25 // default: undefined
    }
  });
}
const drawCanvas = (img, text, fontsize) => {
  let imgEl = document.createElement("img"),
    canvas = document.createElement("canvas"), //创建canvas标签
    ctx = canvas.getContext("2d");
  imgEl.src = img;
  ctx.fillStyle = "#99f";
  ctx.font = fontsize + "px Arial";
  canvas.width = ctx.measureText(text).width + fontsize * 2; //根据文字内容获取宽度
  canvas.height = fontsize * 2; // fontsize * 1.5
  ctx.drawImage(imgEl, fontsize / 2, fontsize / 2, fontsize, fontsize);
  ctx.fillStyle = "red";
  ctx.font = fontsize + "px Calibri,sans-serif";
  ctx.shadowOffsetX = 1; //阴影往左边偏，横向位移量
  ctx.shadowOffsetY = 0; //阴影往左边偏，纵向位移量
  ctx.shadowColor = "#fff"; //阴影颜色
  ctx.shadowBlur = 1; //阴影的模糊范围
  ctx.fillText(text, (fontsize * 7) / 4, (fontsize * 4) / 3);
  return canvas;
}

export default {
  active
};
