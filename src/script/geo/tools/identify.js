/**
 * 点击地图要素查询相应要素属性信息
 * created by lxf
 * 2017-5-8
 */
import _ from "lodash";
import { getArrayString } from "../mapUtil";
import AbstractLayer from "../layer/AbstractLayer";
import eventBus from "../../plugin/eventBus";
import turf from "turf";
import config from "../../config.js";
import ol from "openlayers";
import { asynData } from "../../service/commonService";
import axios from "axios";

var map; //定义全局地图变量，所有操作都在map上进行
var IDENTIFIED_LAYER_BASE_INDEX = 1000;
const bufferDis = 3;
var history;
var identifiedLayers; //每次点击查询时清除上一次查询结果图层
var identifiedFeatures = {}; //记录用户查询到的所有要素，按图层类型（与水利相关则排名靠前）和匹配度排序
var identifiedLayerOrder = []; //记录图层顺序，用于结果排序
var resultFeatureDict = {}; //左侧结果面板数据feature字典{feature.num_:{hover:boolean,f:ol.feature}}
var lastHighlightMarker; //上一次高亮的元素，用于移除hover时取消高亮
var layerSourceChangeCounter = 0; //标识layerchange回调函数出发次数，当layerSourceChangeCounter == _.size(identifiedLayers)时加载marker图层
var hoverLayer; //hover时高亮图形
var queryType; //查询类型，如点查询，线查询，面查询等
var drawInteraction; //绘图交互器
var doubleClickZoomInteraction; //鼠标双击地图放大交互器
var identifyTextCount = 0;
var starttime, endtime;
var identifiedLayerObjectidOrder = {}; // 属性查询时保存后台事先排序
var isZoomToExtent = false;

const highlightFeatureStyle = new ol.style.Style({
  // fill: new Fill({
  //     color: [255, 0, 0, 0.2]
  // }),
  stroke: new ol.style.Stroke({
    color: [255, 0, 0, 0.2],
    width: 2
  })
  // image: new ol.style.Circle({
  //     radius: 5,
  //     fill: new Fill({
  //         color: 'red'
  //     })
  // })
});
const hoverFeatureStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: "red",
    width: 2
  })
  // image: new ol.style.Circle({
  //     radius: 5,
  //     fill: new Fill({
  //         color: 'red'
  //     })
  // })
});
var markerLayer = new ol.layer.Vector({
  zIndex: IDENTIFIED_LAYER_BASE_INDEX + 100,
  style: feature => {
    feature = feature instanceof ol.Feature ? feature : this;
    //设置marker序号为1-10
    var n = feature.num_;
    n = n % 10 > 0 ? n % 10 : 10;
    var str = n + "\n";
    return new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: "/src/assets/img/icon.svg"
      }),
      text: new ol.style.Text({
        text: str,
        offsetY: -12,
        fill: new ol.style.Fill({
          color: "#fff"
        })
      }),
      zIndex: -feature.num_ //设置显示顺序
    });
  }
});

/**
 * 添加绘图交互器
 *
 */
function addInteraction() {
  var geometryFunction;
  var value;
  if (queryType === "rect") {
    value = "Circle";
    geometryFunction = function(coordinates, optGeometry) {
      var extent = ol.extent.boundingExtent(coordinates);
      var geometry = optGeometry || new ol.style.Polygon(null);
      geometry.setCoordinates([
        [
          ol.extent.getBottomLeft(extent),
          ol.extent.getBottomRight(extent),
          ol.extent.getTopRight(extent),
          ol.extent.getTopLeft(extent),
          ol.extent.getBottomLeft(extent)
        ]
      ]);
      return geometry;
    };
  } else if (queryType == "polygon") {
    value = "Polygon";
  } else if (queryType == "line") {
    value = "LineString";
  }
  var source = new ol.source.Vector({});

  var drawVector = new o.layer.Vector({
    source: source
  });
  drawInteraction = new ol.interaction.Draw({
    source: source,
    type: /** @type {ol.geom.GeometryType} */ (value),
    geometryFunction: geometryFunction,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(255, 255, 255, 0.2)"
      }),
      stroke: new ol.style.Stroke({
        color: "rgba(0, 0, 0, 0.5)",
        lineDash: [10, 10],
        width: 2
      })
      // ,
      // image: new ol.style.Circle({
      //     radius: 5,
      //     stroke: new Stroke({
      //         color: 'rgba(0, 0, 0, 0.7)'
      //     }),
      //     fill: new Fill({
      //         color: 'rgba(255, 255, 255, 0.2)'
      //     })
      // })
    })
  });
  map.addInteraction(drawInteraction);
  map.addLayer(drawVector);

  var listener = drawInteraction.on(
    "drawend",
    function(evt) {
      var feature = evt.feature;
      console.log(feature);

      //开始查询
      let identifyExtent;
      if (queryType == "rect") {
        identifyExtent = feature.getGeometry().getExtent();
        identifyFeature(identifyExtent, "esriGeometryEnvelope");
      } else if (queryType == "polygon") {
        identifyExtent = feature.getGeometry().getCoordinates();
        let resultStr = getArrayString(identifyExtent);
        identifyFeature("{rings:" + resultStr + "}", "esriGeometryPolygon");
      } else if (queryType == "line") {
        identifyExtent = feature.getGeometry().getCoordinates();
        let resultStr = getArrayString(identifyExtent);
        identifyFeature("{paths:[" + resultStr + "]}", "esriGeometryPolyline");
      }

      //清除绘图交互器
      map.removeInteraction(drawInteraction);
      map.removeLayer(drawVector);
      map.unByKey(listener);
      var index = history.removeInteraction.indexOf(drawInteraction);
      index > -1 && history.removeInteraction.splice(index, 1);
      index = history.removeLayer.indexOf(drawVector);
      index > -1 && history.removeLayer.splice(index, 1);

      setTimeout(function() {
        drawInteraction = undefined;
      }, 1000);
    },
    this
  );

  //添加到history对象中
  history.removeInteraction.push(drawInteraction);
  history.removeLayer.push(drawVector);
}

/**
 * 处理鼠标单击事件
 *
 * @param {mouseclick event} e
 */
function identify(e) {
  if (drawInteraction) return;
  let clickedMarker = getFeatureAtPixel(e.pixel, markerLayer);
  //判定用户是点击的marker点
  if (markerLayer && clickedMarker) {
    if (_.has(resultFeatureDict, clickedMarker.num_)) {
      eventBus.emit(
        "toolbar-identified-clickmarker",
        resultFeatureDict[clickedMarker.num_].f
      );
    }
    return;
  }
  if (queryType == "rect" || queryType == "polygon" || queryType == "line") {
    //框选
    addInteraction();
  } else if (queryType == "point") {
    //点选
    let identifyExtend = convertPixelToExtent(map, e.pixel);
    identifyFeature(identifyExtend, "esriGeometryPoint");
  }
  // console.log("history: ", history);
}

function convertPixelToExtent(map, pixel) {
  var minPixelX = pixel[0] - bufferDis;
  var maxPixelX = pixel[0] + bufferDis;
  var minPixelY = pixel[1] - bufferDis;
  var maxPixelY = pixel[1] + bufferDis;

  var buttomLeftCoord = map.getCoordinateFromPixel([minPixelX, minPixelY]);
  var topRightCoord = map.getCoordinateFromPixel([maxPixelX, maxPixelY]);

  var queryExtend = buttomLeftCoord;
  queryExtend = queryExtend.concat(topRightCoord);

  return queryExtend;
}

/**
 * 清除上一次查询结果
 *
 */
function clearResult() {
  !!identifiedLayers &&
    _.size(identifiedLayers) > 0 &&
    _.forEach(identifiedLayers, (v, i) => {
      map.removeLayer(v);
      var index = history.removeLayer.indexOf(v);
      index > -1 && history.removeLayer.splice(index, 1);
    });
  identifiedFeatures = {};
  identifiedLayerOrder = [];
  identifiedLayerObjectidOrder = {};
  markerLayer.setSource(null);
  resultFeatureDict = {};
  layerSourceChangeCounter = 0;
}

/**
 * 处理用户点击图层而非点击marker的查询
 * 几何查询
 * @param {Array} identifyExtend 查询范围
 */
function identifyFeature(identifyExtend, geometryType) {
  isZoomToExtent = false; // 几何查询会不会将地图缩放到指定范围

  starttime = new Date().getTime();
  geometryType = geometryType || "esriGeometryEnvelope";
  let tolerance = 2;
  if (geometryType.indexOf("esriGeometryPoint") > -1) {
    tolerance = 8;
  }

  //清除上一次查询结果
  clearResult();

  //等待
  config["$STORE"].commit("SHOW_WAITE_MARKER");
  let identifiedLayers = [];
  // let selectedLayers = _.map(CjLayer.selectedLayerList, 'layer');
  //获取地图范围和canvas宽度和高度
  let mapSize = map.getSize();
  let leftBottom = map.getCoordinateFromPixel([0, mapSize[1]]);
  let rightTop = map.getCoordinateFromPixel([mapSize[0], 0]);
  let mapExtent = leftBottom.concat(rightTop);
  let imageDisplay = mapSize.concat([96]);

  _.forEach(getSelectedLayerList(), (v, i) => {
    let url;
    if (v.canQuery) {
      // let source = v.layer.getSource();
      // url = source.getUrl ? source.getUrl() : source.urls[0];
      url = v.url;
      var layerVisible = v.layer instanceof ol.layer.Vector ? "all" : "visible";
      //20170708 zzh，改写该接口，由于几何查询时，地图服务存在多个图层，并非只有0图层，且服务设置了分级显示
      //采用query接口，可以同时进行服务的几何查询和属性查询，但只能针对一个图层
      //采用identify接口，可以针对服务的多个图层进行查询，而且可以只查询可见图层的对象
      // url += '/0/query?geometry=' + identifyExtend + '&f=pjson&geometryType=' + geometryType;
      url +=
        "/identify?geometry=" +
        identifyExtend +
        "&f=pjson&geometryType=" +
        geometryType +
        "&layers=" +
        layerVisible +
        "&tolerance=" +
        tolerance +
        "&mapExtent=" +
        mapExtent +
        "&imageDisplay=" +
        imageDisplay;
    } else if (v.toString() == "imgLayer") {
      let srcUrl = v.url;
      let urls = srcUrl.split("FeatureServer/");
      url =
        urls[0] +
        "MapServer/identify?geometry=" +
        identifyExtend +
        "&f=pjson&geometryType=" +
        geometryType +
        "&layers=visible:" +
        urls[1].split("/")[0] +
        "&tolerance=" +
        tolerance +
        "&mapExtent=" +
        mapExtent +
        "&imageDisplay=" +
        imageDisplay;
    }
    if (url) {
      let identifiedLayer = createIdentifiedLayer(
        url,
        IDENTIFIED_LAYER_BASE_INDEX++,
        v.name,
        v.realname,
        v.geometryType,
        "EsriJSON1"
      );
      identifiedLayers.push(identifiedLayer);
      history.removeLayer.push(identifiedLayer);
    }
  });
  //设置查询范围
  map.getLayers().extend(identifiedLayers);
}

/**
 * 获得EsriJson格式的数据
 * 通过identify接口或query接口获取的数据结构解析
 * @param {String} layerUrl
 * @param {String} geometryType
 * @returns
 */
function getEsriJson(layerUrl, geometryType, layerName, realname) {
  let features = [];
  let format = new ol.format.EsriJSON({
    geometryName: "geometry"
  });
  let layerSource = new ol.source.Vector({
    format: format
  });
  //向arcgis server发送identify或query请求，获取数据，转换为ol.feature对象
  asynData("GET_DATA_BY_URL", {
    url: layerUrl
  })
    .then(function(data) {
      if (data.results && data.results.length > 0) {
        // 将别名翻译为真实名称，与属性列表保持一致
        var layerIds = [];
        data.results.forEach(item => {
          if (layerIds.indexOf(item.layerId) == -1) {
            layerIds.push(item.layerId);
          }
        });

        var requests = [];
        layerIds.forEach(layerId => {
          let curUrl = layerUrl.split("identify?")[0] + layerId + "?f=json";
          let request = asynData("GET_DATA_BY_URL", {
            url: curUrl
          }).then(function(curData) {
            return curData;
          });
          requests.push(request);
        });

        axios.all(requests).then(responses => {
          responses.forEach(curData => {
            data.results.forEach(item => {
              if (item.layerId == curData.id) {
                var attributes = {};
                curData.fields.forEach(fieldItem => {
                  if (item.attributes[fieldItem.alias]) {
                    attributes[fieldItem.name] =
                      item.attributes[fieldItem.alias] == "Null"
                        ? null
                        : item.attributes[fieldItem.alias];
                  } else if (item.attributes[fieldItem.name]) {
                    attributes[fieldItem.name] =
                      item.attributes[fieldItem.name];
                  }
                });
                item.attributes = attributes;
                let feature = format.readFeature(item);
                feature.layerName_ = item.layerName;
                feature.realname_ = realname;
                // if (item.foundFieldName) {
                //     feature.foundFieldName_ = item.foundFieldName;
                //     feature.value_ = item.value;
                // }
                features.push(feature);
              }
            });
          });
          addFeatureIntoSource(layerSource, features, geometryType);
        });
      } else if (data.results && data.results.length == 0) {
        addFeatureIntoSource(layerSource, features, geometryType);
      } else {
        let curFeatures = format.readFeatures(data);
        features = features.concat(curFeatures);

        addFeatureIntoSource(layerSource, features, geometryType);
      }
    })
    .catch(function(err) {
      console.error(err);
      config["$APP"].$Notice.warn({
        title: "查询" + layerName + "图层出错"
      });
      addFeatureIntoSource(layerSource, features, geometryType);
    });

  return layerSource;
}

/**
 * 将features添加到layerSource中
 * 触发layerSource的on:change方法
 *
 * @param {sourceVector } layerSource 图层数据源
 * @param {Array[ol.Features]} features 要素对象
 * @param {String} geometryType 要素类型
 */
function addFeatureIntoSource(layerSource, features, geometryType) {
  features = _.filter(features, f => {
    if (!f.getGeometry()) return false;
    if (geometryType == "point") {
      let geometry = f.getGeometry();
      if (
        geometry instanceof ol.geom.Point ||
        geometry instanceof ol.geom.MultiPoint
      ) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  });
  layerSource.addFeatures(features);
}

/**
 * 创建查询图层
 *
 * @param {String} layerUrl 查询URL
 * @param {List} extend 查询范围
 * @param {Integer} layerIndex 图层显示z-index
 * @param {String} layerName 图层名称
 * @returns
 */
function createIdentifiedLayer(
  layerUrl,
  layerIndex,
  layerName,
  realname,
  geometryType,
  format
) {
  let layerSource = getEsriJson(layerUrl, geometryType, layerName, realname);

  let layer = new ol.layer.Vector({
    zIndex: layerIndex,
    source: layerSource,
    style: (feature, resolution) => {
      return highlightFeatureStyle;
    }
  });
  let cjLayer = new AbstractLayer(
    undefined,
    layerName,
    undefined,
    realname,
    undefined,
    layerIndex,
    true,
    layer,
    geometryType
  );

  //添加feature及其marker
  identifiedLayerOrder.push(layerName);
  layerSource.on("change", e => {
    endtime = new Date().getTime();
    console.log(layerName, "耗时：", (endtime - starttime) / 1000, "秒");
    console.log("layersource change", layerName);
    addIdentifiedFeatures(layerSource, cjLayer);
  });

  //待优化，等解决plot升级至openlayers4之后，即可覆盖ol.AssertionError类捕获openlayers地图操作错误
  setTimeout(function() {
    config["$STORE"].commit("HIDE_WAITE_MARKER");
  }, 3000);

  return layer;
}

/**
 * 辅助函数
 * 当前被勾选的图层 列表
 */
const getSelectedLayerList = function() {
  //由于湖北省WMTS地图服务不能查询，所以需要筛选ThematicLayer图层
  var selectedThematicLayers = config["$STORE"].getters.selectedThematicLayers;
  var result = _.filter(selectedThematicLayers, item => {
    return item.canQuery;
  });
  console.log(result);
  return result;
};

/**
 * 添加查询出来的要素集合，供构建左侧查询结果面板和marker图层使用
 *
 * @param {any} resultLayers 查询结果要素高亮图层
 */
function addIdentifiedFeatures(source, cjLayer) {
  layerSourceChangeCounter++;
  let layerName = cjLayer.name;
  let realname = cjLayer.realname;
  if (source instanceof ol.source.Vector) {
    _.forEach(source.getFeatures(), (f, i) => {
      f.num_ = i + 1;
      if (!identifiedFeatures[layerName]) {
        identifiedFeatures[layerName] = {
          cjLayer: cjLayer,
          features: []
        };
      }
      f.layerName_ = layerName;
      f.realname_ = realname;
      let curFeatures = identifiedFeatures[layerName].features;

      if (queryType == "text") {
        // 后台已排好序
        let item = identifiedLayerObjectidOrder[layerName];
        let i;
        let curId = f.get(item.idname);
        let objectid = item.objectid;
        for (i = 0; i < objectid.length; i++) {
          if (objectid[i] == curId) break;
        }
        if (i >= curFeatures.length) {
          curFeatures.push(f);
        } else {
          curFeatures.splice(i, 0, f);
        }
      } else {
        curFeatures.push(f);
      }
    });
  }
  if (
    (queryType == "text" && layerSourceChangeCounter == identifyTextCount) ||
    (queryType != "text" &&
      layerSourceChangeCounter === _.size(getSelectedLayerList()))
  ) {
    try {
      layerSourceChangeCounter = 0;
      eventBus.emit("toolbar-identify-show-result"); //左侧结果面板显示到查询结果一栏
      if (queryType != "text") {
        setPageTotal(); //设置分页总数
      }
      setPageData(); //设置分页
    } catch (e) {
      console.error(e, layerSourceChangeCounter);
    }
    config["$STORE"].commit("HIDE_WAITE_MARKER");
  }
}

/**
 * 设置分页总数
 *
 */
function setPageTotal() {
  let count = 0;
  _.forEach(identifiedFeatures, (v, k) => {
    count += v.features.length;
  });
  if (count == 0) {
    config["$APP"].$Notice.info({
      title: "查询结果为空"
    });
  }
  config["$STORE"].commit("SET_PAGE_TOTAL", count); //设置总数
}

/**
 * 设置分页数据，左侧面板和右侧地图数据
 *
 */
function setPageData() {
  let resultListData = [];
  let _markerSource = new ol.source.Vector();
  let geoJsonFormat = new ol.format.GeoJSON();
  let featureNum = 1;
  let pageNum = config["$STORE"].state.query.pageNum;
  let pageSize = config["$STORE"].state.query.pageSize;
  let startNum = (pageNum - 1) * pageSize + 1;
  let endNum = pageNum * pageSize + 1;
  let minX, maxX, minY, maxY;
  minX = minY = Number.MAX_VALUE;
  maxX = maxY = Number.MIN_VALUE;
  _.forEach(identifiedLayerOrder, layerName => {
    let v = identifiedFeatures[layerName];
    if (v) {
      let features = v.features;
      let layer = v.cjLayer;
      _.forEach(features, (f, index) => {
        let node = _.filter(resultListData, item => {
          return item.name == layerName;
        });
        if (node && node.length > 0) {
          node = node[0];
        } else {
          node = {
            name: layerName,
            layer: layer,
            children: []
          };
          resultListData.push(node);
        }
        let children = node.children;

        if (
          (queryType != "text" &&
            featureNum >= startNum &&
            featureNum < endNum) ||
          queryType == "text"
        ) {
          let item = {
            f: f,
            hover: f.hover
          };
          children.push(item);
          resultFeatureDict[featureNum] = item;

          let geoJson = geoJsonFormat.writeFeatureObject(f);
          // let center = turf.centerOfMass(geoJson);
          let center = turf.pointOnSurface(geoJson);
          let feature = geoJsonFormat.readFeature(center);
          feature.num_ = featureNum;
          f.num_ = featureNum;
          f.marker = feature;
          f.hover = false;
          _markerSource.addFeature(feature);

          //计算范围
          let extent = f.getGeometry().getExtent();
          if (minX > extent[0]) {
            minX = extent[0];
          }
          if (minY > extent[1]) {
            minY = extent[1];
          }
          if (maxX < extent[2]) {
            maxX = extent[2];
          }
          if (maxY < extent[3]) {
            maxY = extent[3];
          }
        }
        featureNum++;
      });
    }
  });

  markerLayer.setSource(_markerSource);
  eventBus.emit("toolbar-identify-commit-result", resultListData);

  //切换到指定范围
  endtime = new Date().getTime();
  console.log("查询耗时：", (endtime - starttime) / 1000, "秒");
  if (isZoomToExtent) {
    if (minX !== minY && maxX !== maxY) {
      console.log([minX, minY, maxX, maxY]);
      setTimeout(function() {
        config["$STORE"].commit("SET_ANIMATE", {
          center: [(minX + minY) / 2, (maxX + maxY) / 2],
          extent: [[minX, minY], [maxX, maxY]],
          offset: [-200, 0]
        });
      }, 1000);
    }
  }
}

/**
 * 创建左侧面板查询结果集
 *
 * @returns
 */
function createResultListData() {
  let resultListData = [];
  _.forEach(identifiedFeatures, (v, k) => {
    let node = {};
    node.name = k;
    node.layer = v.cjLayer;
    let children = [];
    _.forEach(v.features, (f, i) => {
      let item = {
        f: f,
        hover: f.hover
      };
      children.push(item);
      resultFeatureDict[f.num_] = item;
    });
    node.children = children;
    resultListData.push(node);
  });
  return resultListData;
}

/**
 * 添加marker图层，只在工具初始化时加载一次，每次查询setSource即可
 *
 */
function setMarkerLayerSource() {
  let _markerSource = new ol.source.Vector();
  let geoJsonFormat = new ol.format.GeoJSON();
  let featureNum = 1;
  _.forEach(identifiedFeatures, (featureByLayer, i) => {
    _.forEach(featureByLayer.features, (f, i) => {
      let geoJson = geoJsonFormat.writeFeatureObject(f);
      // let center = turf.centerOfMass(geoJson);
      let center = turf.pointOnSurface(geoJson);
      let feature = geoJsonFormat.readFeature(center);
      feature.num_ = featureNum;
      f.num_ = featureNum++;
      f.marker = feature;
      f.hover = false;
      // feature.attachFeature_ = f;
      _markerSource.addFeature(feature);
    });
  });
  markerLayer.setSource(_markerSource);
}

/**
 *
 * 点击应该返回用户勾选的所有图层中选中的点，目前实现单一图层identify
 * @param {any} pixel
 * @param {any} identifyLayer
 */
function getFeatureAtPixel(pixel, identifyLayer) {
  if (!identifyLayer) return;
  let f = map.forEachFeatureAtPixel(pixel, (feature, layer) => {
    if (identifyLayer && identifyLayer == layer) return feature;
  });
  return f;
}

/**
 *
 * 点击应该返回用户勾选的所有图层中选中的点
 * @param {any} pixel
 * @param {any} identifyLayers
 */
function getFeatureAtPixelByLayers(pixel, identifyLayers) {
  let _identifiedFeatures = [];

  if (identifyLayers && _.size(identifyLayers) > 0) {
    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
      if (_.includes(identifyLayers, layer)) _identifiedFeatures.push(feature);
    });
  } else {
    map.forEachFeatureAtPixel(pixel, (feature, layer) => {
      _identifiedFeatures.push(feature);
    });
  }

  return _identifiedFeatures;
}

/**
 * 高亮鼠标hover的marker
 * @param {mouseclick event} e
 */
function highlightHoverMarker(e) {
  let pixel = map.getEventPixel(e.originalEvent);
  let hit = map.hasFeatureAtPixel(pixel, layer => {
    return layer == markerLayer;
  });
  map.getTarget().style.cursor = hit ? "pointer" : ""; //改变鼠标形状
  if (hit) {
    let hitMarker = map.forEachFeatureAtPixel(pixel, (feature, layer) => {
      if (markerLayer && markerLayer == layer) return feature;
    });
    if (
      hitMarker &&
      hitMarker.num_ &&
      _.has(resultFeatureDict, hitMarker.num_)
    ) {
      if (lastHighlightMarker && lastHighlightMarker.f.marker == hitMarker)
        return;
      !!lastHighlightMarker &&
        eventBus.emit("toolbar-identify-cancel-hover", lastHighlightMarker);
      lastHighlightMarker = resultFeatureDict[hitMarker.num_];
      eventBus.emit("toolbar-identify-hover-marker", lastHighlightMarker);
      // console.log(lastHighlightMarker.f);
      // hoverFeature(lastHighlightMarker.f);
    }
  } else {
    !!lastHighlightMarker &&
      eventBus.emit("toolbar-identify-cancel-hover", lastHighlightMarker);
    // !!lastHighlightMarker && hoverFeature();
    lastHighlightMarker = null;
  }
}

/**
 * 高亮图形
 *
 * @param {ol.Feature} feature
 */
function hoverFeature(feature) {
  if (!hoverLayer || !hoverLayer.getSource()) return;
  hoverLayer.getSource().clear();
  !!feature && hoverLayer.getSource().addFeature(feature);
}

/**
 * 根据文本查询
 * 属性查询
 * @param {String} keywords
 * @returns
 */
function doSearch(keywords) {
  isZoomToExtent = true; // 属性查询会将地图缩放到指定范围

  starttime = new Date().getTime();
  identifyTextCount = 0;
  //清除上一次查询结果
  clearResult();

  //等待
  config["$STORE"].commit("SHOW_WAITE_MARKER");
  let identifiedLayers = [];

  let pageNum = config["$STORE"].state.query.pageNum;
  let pageSize = config["$STORE"].state.query.pageSize;
  asynData("GET_IDENTIFY_TEXT", null, null, {
    keywords: keywords,
    pagesize: pageSize,
    pagenum: pageNum
  })
    .then(res => {
      // console.log(res)
      let total = res.total;
      let results = res.results;
      config["$STORE"].commit("SET_PAGE_TOTAL", total); //设置总数
      if (!total > 0) {
        config["$STORE"].commit("HIDE_WAITE_MARKER");
        config["$APP"].$Notice.info({
          title: "未查询到相关结果"
        });
        return;
      }
      let realnames = [];
      let itemMap = {}; // 按图层分类
      var themeLayerList = config["$STORE"].getters.themeLayerList;
      _.forEach(results, item => {
        let realname = item.url; // 没毛病
        var layerName = item.name;
        var url;
        for (let i = 0; i < themeLayerList.length; i++) {
          if (realname == themeLayerList[i].realname) {
            layerName = themeLayerList[i].name;
            url = themeLayerList[i].url;
            break;
          }
        }
        if (!itemMap[realname]) {
          itemMap[realname] = {
            url: url,
            name: layerName,
            objectid: [],
            idname: item.idname,
            layerid: item.layerid
          };
          realnames.push(realname);
        }
        itemMap[realname].objectid.push(item.objectid);
      });

      _.forEach(realnames, realname => {
        let item = itemMap[realname];
        identifiedLayerObjectidOrder[item.name] = {
          objectid: item.objectid,
          idname: item.idname
        };
      });

      identifyTextCount = realnames.length;
      _.forEach(realnames, realname => {
        let item = itemMap[realname];
        let queryUrl =
          item.url +
          "/" +
          item.layerid +
          "/query?where=" +
          item.idname +
          " in (" +
          item.objectid +
          ")&f=json&outFields=*";
        // console.log(queryUrl);
        let identifiedLayer = createIdentifiedLayer(
          queryUrl,
          IDENTIFIED_LAYER_BASE_INDEX++,
          item.name,
          realname,
          item.geometryType,
          "EsriJSON"
        );
        identifiedLayers.push(identifiedLayer);
        history.removeLayer.push(identifiedLayer);
      });

      // //设置查询范围
      map.getLayers().extend(identifiedLayers);
    })
    .catch(function(err) {
      console.error(err);
      config["$APP"].$Notice.error({
        title: "提示",
        desc: "获取数据错误！"
      });
      config["$STORE"].commit("HIDE_WAITE_MARKER");
    });
}

/**
 * 初始化地图事件
 */
function initialize() {
  if (map) {
    let singleclick = map.on("singleclick", identify);
    let pointermove = map.on("pointermove", highlightHoverMarker);
    markerLayer.setSource(null);
    map.addLayer(markerLayer);

    hoverLayer = new ol.layer.Vector({
      zIndex: IDENTIFIED_LAYER_BASE_INDEX + 99,
      source: new ol.source.Vector(),
      style: hoverFeatureStyle
    });
    map.addLayer(hoverLayer);

    //查询时删除鼠标双击放大地图事件
    var interactions = map.getInteractions().getArray();
    doubleClickZoomInteraction = _.find(interactions, o => {
      return o instanceof ol.interaction.DoubleClickZoom;
    });
    doubleClickZoomInteraction &&
      map.removeInteraction(doubleClickZoomInteraction);

    history = {
      unByKey: [singleclick, pointermove],
      removeLayer: [markerLayer, hoverLayer],
      removeInteraction: []
    };
  }
}

function active(_map, type) {
  if (config["$STORE"].state.isHideSwipe)
    config["$STORE"].commit("TOGGLE_SWIPE");
  deactive();
  map = _map;
  queryType = type;
  initialize();
}

function deactive() {
  if (!map) return;
  _.forEach(history, (v, k) => {
    _.forEach(v, (item, key) => {
      // map[k].call(map, item);
      map[k](item);
    });
  });
  doubleClickZoomInteraction && map.addInteraction(doubleClickZoomInteraction);

  history = undefined;
  map = undefined;
  queryType = undefined;
  doubleClickZoomInteraction = undefined;
  config["$STORE"].commit("SET_CURSOR_TYPE", "grab");
  eventBus.emit("toolbar-identify-deactive", true);
}

function getQueryType() {
  return queryType;
}

export default {
  active,
  deactive,
  hoverFeature,
  doSearch,
  setPageData,
  getQueryType
};
