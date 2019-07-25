import config from '../../../../script/config';
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
import axios from "axios"
import bus from "@/script/bus.js";
import {
  locationToExtentByFeatureType
} from "@/script/mapUtils/myMaputils/myUtils.js";
import linstringicon from "@/assets/img/line.png";
import polygonicon from "@/assets/img/polygon.png";
import pointicon from "@/assets/img/pointicon.png";
import {
  setImgStyle,
  setPointStyle,
  changeImgStyle,
  getCentroidOfMultiPolygon
} from "@/script/mapUtils/myMaputils/myUtils.js";
var thatThis;
let store, map, overAllSearchMapservices;
let seachIconLayer, seachGeomsLayer, seachClickIconLayer, seachClickGeomsLayer;
//初始化需要用到的图层
const initLayers = (map, renderLayers) => {
  //如果map已经存在了其中一个图层，则认为四个图层均已创建过
  if (map.get("seachIconLayer") != undefined) {
    return
  }
  //identify：查询后绘制的marker图层
  seachIconLayer = new VectorLayer({
    source: new VectorSource({}),
    zIndex: 10000,
    style: feature => {
      feature = feature instanceof Feature ? feature : this;
      let style;
      let str;
      //设置marker序号为1-10
      if (feature.get("index")) {
        str = feature.get("index").toString() + "\n";
      }
      if (feature.get("type") == "pointIcon") {
        style = setImgStyle1(pointicon, str, "#fff");
      } else if (feature.get("type") == "linestringIcon") {
        style = setImgStyle1(linstringicon, str, "#fff");
      } else if (feature.get("type") == "polygonIcon") {
        style = setImgStyle1(polygonicon, str, "#fff");
      }
      return style;
    }
  });
  seachIconLayer.set("name", "seachIconLayer")
  map.addLayer(seachIconLayer);
  map.set("seachIconLayer", seachIconLayer);
  renderLayers.push(seachIconLayer)
  //identify:界面hover时绘制的图层
  seachGeomsLayer = new VectorLayer({
    source: new VectorSource({}),
    zIndex: 9000,
    style: feature => {
      feature = feature instanceof Feature ? feature : this;
      let geom = feature.getGeometry();
      let name = feature.get("featurename") ? feature.get("featurename") : feature.get("name").split("_")[2];
      let style;
      if (geom instanceof Point) {
        style = setPointStyle1(name, geom.getCoordinates());
      } else if (geom instanceof LineString) {
        style = new Style({
          stroke: new Stroke({
            color: "red",
            width: 5
          })
        });
      } else if (geom instanceof Polygon) {
        style = new Style({
          stroke: new Stroke({
            color: "red",
            width: 5
          })
        });
      }
      return style;
    }
  });
  seachGeomsLayer.set("name", "seachGeomsLayer")
  map.addLayer(seachGeomsLayer);
  map.set("seachGeomsLayer", seachGeomsLayer);
  renderLayers.push(seachGeomsLayer)
  //identify：地图图标click时绘制的marker图层
  seachClickIconLayer = new VectorLayer({
    source: new VectorSource({}),
    zIndex: 10000,
    style: feature => {
      feature = feature instanceof Feature ? feature : this;
      let style;
      let str;
      //设置marker序号为1-10
      if (feature.get("index")) {
        str = feature.get("index").toString() + "\n";
      }
      let icon;
      switch (feature.get("type")) {
        case "pointIcon":
          icon = pointicon;
          break;
        case "linestringIcon":
          icon = linstringicon;
          break;
        case "polygonIcon":
          icon = polygonicon;
          break;
      }
      style = changeImgStyle1(icon, str, "#fff", "yellow");
      store.commit("SET_HOVERED_FEATURE", {
        type: "overAllSearch",
        feature: feature
      });
      return style;
    }
  });
  seachClickIconLayer.set("name", "seachClickIconLayer")
  map.addLayer(seachClickIconLayer);
  map.set("seachClickIconLayer", seachClickIconLayer);
  renderLayers.push(seachClickIconLayer)
  //identify:地图图标click时绘制的线图层
  seachClickGeomsLayer = new VectorLayer({
    source: new VectorSource({}),
    zIndex: 9000,
    style: feature => {
      feature = feature instanceof Feature ? feature : this;
      let geom = feature.getGeometry();
      let name = feature.get("featurename") ? feature.get("featurename") : feature.get("name").split("_")[2];
      let style;
      if (geom instanceof Point) {
        style = setPointStyle1(name, geom.getCoordinates());
      } else if (geom instanceof LineString) {
        style = new Style({
          stroke: new Stroke({
            color: "red",
            width: 5
          })
        });
      } else if (geom instanceof Polygon) {
        style = new Style({
          stroke: new Stroke({
            color: "red",
            width: 5
          })
        });
      }
      return style;
    }
  });
  seachClickGeomsLayer.set("name", "seachClickGeomsLayer")
  map.addLayer(seachClickGeomsLayer);
  map.set("seachClickGeomsLayer", seachClickGeomsLayer);
  renderLayers.push(seachClickGeomsLayer)
};

const setImgStyle1 = (imgSrc, text, colr) => {
  return new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: imgSrc
    }),
    // text: new ol.style.Text({
    //   text: text,
    //   offsetY: -24,
    //   fill: new ol.style.Fill({
    //     color: colr
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
const setPointStyle1 = (text, center) => {
  return new Style({
    image: new CircleStyle({
      center: center,
      radius: 5,
      stroke: new Stroke({
        color: "red",
        width: 2
      })
    }),
    // text: new ol.style.Text({
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
const overAllSeach = (seachText, thatthisp) => {
  thatThis = thatthisp;
  //初始化用于渲染的的所有图层
  initLayers(thatthisp.map, thatthisp.$store.state.map.seachRenderLayers);
  store = thatthisp.$store;
  map = thatthisp.map;
  overAllSearchMapservices = store.state.map.overAllSearchMapservices
  let seachMapNames = _.map(overAllSearchMapservices, v => {
    return v.name;
  });
  console.log("服务的名称: ", seachMapNames);

  let axiosAll = _.map(overAllSearchMapservices, v => {
    return axios.get(`${v.url}${seachText}`);
  });
  console.log("axiosAll: ", axiosAll);
  store.state.map.searchLoadStatus = true;
  store.state.map.searchCloseShow = false;

  axios.all(axiosAll).then(results => {
     //隐藏详情，展开查询列表
    bus.$emit("on-detailBackBtn_seachList");
    //处理返回的结果，过滤掉undefined或者为空的数据，并计算返回的要素条数
    let num = 0;
    let resArr = [];
    let spliceIndex = [];
    console.log("identify解析前的数据", results);
    _.forEach(results, (re, index) => {
      if (re.error == undefined) {
        if (re != undefined && re.data.results && re.data.results.length != 0) {
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
      // thatThis.$Message.info("无查询结果");
      store.state.map.seachNorltShow = true;
      console.log(' store.state.map.seachNorltShow: ', store.state.map.seachNorltShow);
      //清除上次的查询结果
      store.state.map.seachListData.seachList = [];
      return;
    } else {
      store.state.map.seachNorltShow = false;
      console.log(' store.state.map.seachNorltShow: ', store.state.map.seachNorltShow);
    }
    console.log("查询的要素条数:", num);
    console.log("删除前", seachMapNames);
    //删除索引为spliceIndex的图层名称
    let oldnum = seachMapNames.length;
    let newnum = 0;
    _.forEach(spliceIndex, (sp, index) => {
      if (index == 0) {
        seachMapNames.splice(spliceIndex[index], 1);
        newnum = seachMapNames.length;
      } else {
        seachMapNames.splice(spliceIndex[index] - (oldnum - newnum), 1);
        newnum = seachMapNames.length;
      }
    });
    store.state.map.seachOldMapNames = seachMapNames;
    console.log("删除后", seachMapNames);
    //对查询的结果进行解析
     let listData = [];
    _.forEach(resArr, (item, index) => {
      let mapserverInfo = {};
      mapserverInfo.featureInfo = [];
      mapserverInfo.Name = seachMapNames[index];
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
    console.log("解析后的identify查询结果", listData);
    let seachListData = store.state.map.seachListData;
    seachListData.total = num;
    seachListData.seachList = listData;
    // store.state.map.identifyshow = true;
    renderIdentifyIconLayer(listData);
     map.getView().animate({
      center:config["MAP_VIEW"].center,
      zoom:config["MAP_VIEW"].zoom
    })
  }).catch(error => {
    console.log('error: ', error);

  }).finally(() => {
    //隐藏loading动画
    store.state.map.searchLoadStatus = false;
    store.state.map.searchCloseShow = true;
  });
};
//绘制要素到地图，利用解析后的结果listDate
const renderIdentifyIconLayer = listData => {
  var identifyIconFeatures = [];
  seachIconLayer
    .getSource()
    .clear();
  _.forEach(listData, listItem => {
    let featureInfo = listItem.featureInfo;
    let mapServerName = listItem.Name;
    _.forEach(featureInfo, (feature, index) => {
      //绘制点注记
      if (feature.geometryType == "esriGeometryPoint") {
        let marker = new Feature({
          geometry: new Point([feature.geometry.x, feature.geometry.y])
        });
        marker.set("type", "pointIcon"); //根据类型，渲染不同的图标
        marker.set("index", feature.id); //设置图标序号
        marker.set("mapServerName", mapServerName); //设置地图服务名称
        marker.set("name", mapServerName + "_icon_" + feature.name + "_" + feature.id); //设置要素的唯一标示：地图服务名称+"_icon"+id
        marker.set("property", feature);
        identifyIconFeatures.push(marker);
      } else if (feature.geometryType == "esriGeometryPolyline") {
        let center = feature.geometry.paths[0][Math.round(feature.geometry.paths[0].length / 2)];
        let marker = new Feature({
          geometry: new Point([center[0], center[1]])
        });
        marker.set("type", "linestringIcon"); //根据类型，渲染不同的图标
        marker.set("index", feature.id); //设置图标序号
        marker.set("mapServerName", mapServerName); //设置地图服务名称
        marker.set("name", mapServerName + "_icon_" + feature.name + "_" + feature.id); //设置要素的唯一标示：地图服务名称+"_icon"+id
        marker.set("property", feature);
        identifyIconFeatures.push(marker);
      } else if (feature.geometryType == "esriGeometryPolygon") {
        let centerPoint = getCentroidOfMultiPolygon(feature.geometry);
        console.log("centerPoint: ", centerPoint);
        let marker = new Feature({
          geometry: new Point([centerPoint[0], centerPoint[1]])
        });
        marker.set("type", "polygonIcon"); //根据类型，渲染不同的图标
        marker.set("index", feature.id); //设置图标序号
        marker.set("mapServerName", mapServerName); //设置地图服务名称
        marker.set("name", mapServerName + "_icon_" + feature.name + "_" + feature.id); //设置要素的唯一标示：地图服务名称+"_icon"+id
        marker.set("property", feature);
        identifyIconFeatures.push(marker);
      }
    });
  });
  //添加新要素之前注册事件
  let rendererIdentifyGeometryEvt = map.on("pointermove", rendererIdentifyGeometry);
  store.state.map.mapEventHistory.unByKey.push(rendererIdentifyGeometryEvt);
  seachIconLayer
    .getSource()
    .addFeatures(identifyIconFeatures);
  console.log("图标要素：", identifyIconFeatures);
};
//鼠标pointer到图标要素是设置图标样式
const setPointerStyle = (feature, img, color, str) => {
   console.log('feature: ', feature);
  /*之前那的标注20190415
  feature.setStyle(
    new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: img,
        color: color
      }),
      text: new ol.style.Text({
        text: str,
        offsetY: -24,
        fill: new ol.style.Fill({
          color: "#fff"
        })
      })
    })
  );*/
  //修改为弹出overlay的形式20190415
  store.commit("SET_HOVERED_FEATURE", {
    type: "overAllSearch",
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
       text: new ol.style.Text({
         text: str,
         offsetY: -24,
         fill: new ol.style.Fill({
           color: "#fff"
         })
       })
     })
   );*/
  //修改为隐藏overlay的形式
  store.commit("SET_HOVERED_FEATURE", {
    type: "overAllSearch",
    feature: null
  });
};
const rendererIdentifyGeometry = mapevt => {
  // alert(1);
  let identifyRenderFeatures = [];
  let featuresAtPixel = map.getFeaturesAtPixel(mapevt.pixel);
  // console.log("鼠标pointer到的featuresAtPixel: ", featuresAtPixel);

  if (featuresAtPixel == null || featuresAtPixel[0].getId() == "modalFeature") {
    //恢复地图的点查询事件
    // map.getTargetElement().style.cursor = "Crosshair";seachIco
    // map.getTargetElement().style.cursor = "url(/static/map/search.png),auto";
     // store.state.map.mapEventHistory.unByKey.push(queryMapPointEvt);
    let rendererIdentifyGeometryEvt = map.on("pointermove", rendererIdentifyGeometry);
    store.state.map.mapEventHistory.unByKey.push(rendererIdentifyGeometryEvt);

    map.un("click", showIdentifyInfo);
    //清楚已绘制的图形
    seachGeomsLayer
      .getSource()
      .clear();
    //pointer后恢复图层的样式到原始状态
    _.forEach(
      seachIconLayer
      .getSource()
      .getFeatures(),
      ft => {
        let str;
        let img;
        let feature = ft.get("property");
        if (ft.get("index")) {
          str = ft.get("index").toString() + "\n";
        }
         if (feature.geometryType == "esriGeometryPoint") {
          img = pointicon;
        } else if (feature.geometryType == "esriGeometryPolyline") {
          img = linstringicon;
        } else if (feature.geometryType == "esriGeometryPolygon") {
          img = polygonicon;
        }
        rePointerStyle(ft, img, str);
      }
    );
    return;
  } else {
    // map.getTargetElement().style.cursor = "pointer";
    // map.un("click", queryMapPoint);
    let showIdentifyInfoEvt = map.on("click", showIdentifyInfo);
    store.state.map.mapEventHistory.unByKey.push(showIdentifyInfoEvt);
  }
  //悬浮在图标上时
  _.forEach(featuresAtPixel, ft => {
     //设置样式
    let str;
    if (ft.get("index")) {
      str = ft.get("index").toString() + "\n";
    }
    //对图标要素进行处理
    if (ft.get("property") == undefined) {
      return;
    }
    //得到图标的坐标
    let markerCor = ft.getGeometry().getCoordinates();
    let feature = ft.get("property");
    // console.log("需要渲染的要素", feature);
    let mapServerName = ft.get("mapServerName");
    // console.log(feature);
    if (feature.geometryType == "esriGeometryPoint") {
      let marker = new Feature({
        geometry: new Point([feature.geometry.x, feature.geometry.y])
      });
      marker.set("name", mapServerName + "_feature_" + feature.name + "_" + feature.id); //设置要素的唯一标示：地图服务名称+_feature+id
      identifyRenderFeatures.push(marker);
      //设置样式
      setPointerStyle(ft, pointicon, "yellow", str);
    } else if (feature.geometryType == "esriGeometryPolyline") {
      // console.log("ahhafeature: ", feature, "markerCor", markerCor);
      let marker = new Feature({
        geometry: new Point(markerCor)
      });
      marker.set("name", mapServerName + "_feature_" + feature.name + "_" + feature.id); //设置要素的唯一标示：地图服务名称+_feature+id
      identifyRenderFeatures.push(marker);
      // console.log(feature.geometry.paths);
      let linestring = new Feature({
        geometry: new LineString(feature.geometry.paths[0])
      });
      linestring.set("name", mapServerName + "_feature_" + feature.name + "_" + feature.id); //设置要素的唯一标示：地图服务名称+_feature+id
      identifyRenderFeatures.push(linestring);
      //设置样式
      setPointerStyle(ft, linstringicon, "yellow", str);
    } else if (feature.geometryType == "esriGeometryPolygon") {
      let marker = new Feature({
        geometry: new Point(markerCor)
      });
      marker.set("name", mapServerName + "_feature_" + feature.name + "_" + feature.id); //设置要素的唯一标示：地图服务名称+_feature+id
      identifyRenderFeatures.push(marker);
      console.log("feature.geometry.rings: ", feature.geometry.rings);
      let multiPolygon = new Feature({
        geometry: new Polygon(feature.geometry.rings)
      });
      multiPolygon.set("name", mapServerName + "_feature_" + feature.name + "_" + feature.id); //设置要素的唯一标示：地图服务名称+_feature+id
      identifyRenderFeatures.push(multiPolygon);
      //设置样式
      setPointerStyle(ft, polygonicon, "yellow", str);
    }
  });
  //添加新要素之前清除其他要素
  seachGeomsLayer
    .getSource()
    .clear();
  seachGeomsLayer
    .getSource()
    .addFeatures(identifyRenderFeatures);
  // console.log("鼠标触碰显示要素：", identifyRenderFeatures);
};
//鼠标点击identify图标时绘制要素
export const renderClikFeatures = (featureone, feature, mapServerName) => {
  console.log("featureone: ", featureone);
  //得到图标的坐标
  // let markerCor = featureone.getGeometry().getCoordinates();
  //点击时绘制线
  let features = [];
  if (feature == undefined) {
    return
  }
  if (feature.geometryType == "esriGeometryPoint") {
    let marker = new Feature({
      geometry: new Point([feature.geometry.x, feature.geometry.y])
    });
    marker.set("name", mapServerName + "_icon_" + feature.name + "_" + feature.id);
    features.push(marker);
  } else if (feature.geometryType == "esriGeometryPolyline") {
    // let marker = new Feature({ geometry: new Point(markerCor) });
    // marker.set(
    //   "name",
    //   mapServerName + "_icon_" + feature.name + "_" + feature.id
    // );
    // features.push(marker);
    // console.log(feature.geometry.paths);
    let linestring = new Feature({
      geometry: new LineString(feature.geometry.paths[0])
    });
    linestring.set("name", mapServerName + "_icon_" + feature.name + "_" + feature.id);
    features.push(linestring);
  } else if (feature.geometryType == "esriGeometryPolygon") {
    // let marker = new Feature({ geometry: new Point(markerCor) });
    // marker.set(
    //   "name",
    //   mapServerName + "_icon_" + feature.name + "_" + feature.id
    // );
    // features.push(marker);
    let multiPolygon = new Feature({
      geometry: new Polygon(feature.geometry.rings)
    });
    multiPolygon.set("name", mapServerName + "_icon_" + feature.name + "_" + feature.id);
    features.push(multiPolygon);
  }

  //点击时重新绘制图标
  let str;
  let identifyClickIconFeatures = [];
  if (featureone instanceof Feature) {
    str = featureone.get("index").toString() + "\n";
  } else {
    str = featureone;
  }
  if (feature.geometryType == "esriGeometryPoint") {
    let marker = new Feature({
      geometry: new Point([feature.geometry.x, feature.geometry.y])
    });
    marker.set("type", "pointIcon"); //根据类型，渲染不同的图标
    marker.set("index", feature.id); //设置图标序号
    marker.set("mapServerName", mapServerName); //设置地图服务名称
    marker.set("name", mapServerName + "_icon_" + feature.name + "_" + feature.id); //设置要素的唯一标示：地图服务名称+"_icon"+id
    marker.set("property", feature);
    identifyClickIconFeatures.push(marker);
    features.push(marker);
    //设置样式
  } else if (feature.geometryType == "esriGeometryPolyline") {
    let center = feature.geometry.paths[0][Math.round(feature.geometry.paths[0].length / 2)];
    let marker = new Feature({
      geometry: new Point([center[0], center[1]])
    });
    marker.set("type", "linestringIcon"); //根据类型，渲染不同的图标
    marker.set("index", feature.id); //设置图标序号
    marker.set("mapServerName", mapServerName); //设置地图服务名称
    marker.set("name", mapServerName + "_icon_" + feature.name + "_" + feature.id); //设置要素的唯一标示：地图服务名称+"_icon"+id
    marker.set("property", feature);
    identifyClickIconFeatures.push(marker);
    features.push(marker);
  } else if (feature.geometryType == "esriGeometryPolygon") {
    let centerPoint = getCentroidOfMultiPolygon(feature.geometry);
    let marker = new Feature({
      geometry: new Point([centerPoint[0], centerPoint[1]])
    });
    marker.set("type", "polygonIcon"); //根据类型，渲染不同的图标
    marker.set("index", feature.id); //设置图标序号
    marker.set("mapServerName", mapServerName); //设置地图服务名称
    marker.set("name", mapServerName + "_icon_" + feature.name + "_" + feature.id); //设置要素的唯一标示：地图服务名称+"_icon"+id
    marker.set("property", feature);
    identifyClickIconFeatures.push(marker);
    features.push(marker);
  }
  seachClickGeomsLayer
    .getSource()
    .clear();
  seachClickGeomsLayer
    .getSource()
    .addFeatures(features);
  seachClickIconLayer
    .getSource()
    .clear();
  seachClickIconLayer
    .getSource()
    .addFeatures(identifyClickIconFeatures);
  return features;
};
const showIdentifyInfo = mapevt => {
  let featureone = map.getFeaturesAtPixel(mapevt.pixel)[0];
  let feature = map.getFeaturesAtPixel(mapevt.pixel)[0].get("property");
  let mapServerName = featureone.get("mapServerName");
  //重新绘制线要素
  renderClikFeatures(featureone, feature, mapServerName);
  //触发identify详情展示
  bus.$emit("on-showSeachAllInfo", {
    mapServerName: featureone.get("mapServerName"),
    property: featureone.get("property")
  });
   bus.$emit("on-search-list-click-show-modal", {
    mapServerName:feature.mapServerName,
    featureName: feature.featureName,
    attributes: feature.attributes
  });
};
export {
  overAllSeach
};
