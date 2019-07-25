 import _ from "lodash";
 import turf from "turf";
 import moment from "moment";
 import echarts from "echarts";
 //地图
 import Map from "ol/Map";
 //图层 
 import VectorLayer from 'ol/layer/Vector';
 //图层资源
 import VectorSource from 'ol/source/Vector';
 //要素
 import Point from "ol/geom/Point"
 import Feature from 'ol/Feature';
 //样式
 import Stroke from "ol/style/Stroke";
 import Style from "ol/style/Style";
 import Fill from "ol/style/Fill";
 import CircleStyle from "ol/style/Circle";
 import Icon from 'ol/style/Icon';
 import Text from 'ol/style/Text';
 import GeoJSON from 'ol/format/GeoJSON';

 //投影
 import {
   transform,
 } from "ol/proj"
 import {
   getCenter
 } from "ol/extent"



 export const getCenterpointOfLineString = path => {
   if (path) {
     let turfPointCollection = [];
     _.map(path, point => {
       let turfPoint = turf.point([-97.522259, 35.4691]);
       turfPointCollection.push(turfPoint);
     });
     var features = turf.featureCollection(turfPointCollection);
     return turf.center(features);
   }
 };

 /**
  * 根据要素的extent定位到要素所在的位置
  * @param {*} map
  * @param {*} extent
  */
 export const locationToExtent = (map, extent) => {
   let view = map.getView();
   let resolution = view.getResolutionForExtent(extent, map.getSize());
   let center = getCenter(extent);
   let zoom = view.getZoomForResolution(resolution);
   view.animate({
     // resolution: resolution,
     center: center,
     zoom: zoom - 0.5
   });
 };
 /**
  * 根据要素的不同的要素类型定位到要素所在的位置，点要素可设置定位的级别
  * @param {*} map
  * @param {*} extent
  * @param {*} isPolygon  如果为false 则zoom必须提供
  * @param {*} zoom
  */
 export const locationToExtentByFeatureType = (map, extent, isPolygon, zoom) => {
   let view = map.getView();
   let resolution = view.getResolutionForExtent(extent, map.getSize());
   let center = getCenter(extent);
   let setzoom;
   isPolygon
     ?
     (setzoom = view.getZoomForResolution(resolution)) :
     (setzoom = zoom);
   view.animate({
     // resolution: resolution,
     center: center,
     zoom: setzoom - 0.5
   });
 };

 export const createHeatLayer = () => {
   // alert(1);
   let promise = this.$store.dispatch("LOAD_HEATLAYER_DATA", {
     heatLayerDataUrl: item.heatLayerDataUrl
   });
   let st_time = "2018-01-07";
   promise.then(res => {
     console.log(res);
     if (res.code == "200") {
       let data = res.data[st_time];
       const vector = new ol.layer.Heatmap({
         gradient: ["#00f", "#0ff", "#0f0", "#ff0", "#f00"],
         blur: 55,
         radius: 30,
         shadow: 2500,
         source: new VectorSource({
           wrapX: false
         })
       });
       this.$store.getters.map.addLayer(vector);
       //创建要素
       let features = [];
       _.map(data, value => {
         var _feature = new Feature({
           geometry: new Point([value.longitude, value.latitude]),
           // data: data,
           weight: data.temperature
         });
         features.push(_feature);
       });
       //将要素添加到热力图层的source中
       vector.getSource().addFeatures(features);
       this.$data.testshow = true;
       var blur = document.getElementById("blur");
       var radius = document.getElementById("radius");
       blur.addEventListener("input", function () {
         vector.setBlur(parseInt(blur.value, 10) * 10);
       });

       radius.addEventListener("input", function () {
         vector.setRadius(parseInt(radius.value, 10) * 10);
       });
     } else {
       alert("无数据");
     }
   });
 };
 /**
  * 根据最大值、最小值按照分割段数求数组，防止渲染的时候最大值和最小值与数组最大和最小相等引起的颜色不匹配问题，最大值增加0.01，最小值减少0.01
  * @param {*} maxValue
  * @param {*} minValue
  * @param {*} num 分割段数
  */
 const getRangeByMaxAndMinValue = (maxValue, minValue, num) => {
   let rangeArr = [];
   rangeArr.push(parseFloat((minValue - 0.01).toFixed(2)));
   let intervalValue = (maxValue - minValue) / num; //间隔值
   for (let i = 0; i < num - 1; i++) {
     //保留2位小数
     let value = parseFloat((minValue + intervalValue * (i + 1)).toFixed(2));
     rangeArr.push(value);
   }
   rangeArr.push(parseFloat((maxValue + 0.01).toFixed(2)));
   return rangeArr;
 };
 /**
  * 同上一个方法，优化了小数点保留位数
  * @param {*} maxValue 
  * @param {*} minValue 
  * @param {*} num 
  * @param {*} decimalPointNum 小数点保留位数
  */
 const getRangeByMaxAndMinValue_decimalPointNum = (maxValue, minValue, num, decimalPointNum) => {
   console.log('maxValue, minValue, num, decimalPointNum: ', maxValue, minValue, num, decimalPointNum);
   //对maxValue, minValue进行判断，加入其中之一为null，则认为最大和最小值相等
   minValue == null ? minValue = maxValue : null;
   maxValue == null ? maxValue = minValue : null;
   let rangeArr = [];
   rangeArr.push(parseFloat((minValue - 0.000001).toFixed(decimalPointNum)));
   let intervalValue = (maxValue - minValue) / num; //间隔值
   for (let i = 0; i < num - 1; i++) {
     //保留2位小数
     let value = parseFloat((minValue + intervalValue * (i + 1)).toFixed(decimalPointNum));
     rangeArr.push(value);
   }
   rangeArr.push(parseFloat((maxValue + 0.000001).toFixed(decimalPointNum)));
   return rangeArr;
 };

 //////////////////////////地图无关的方法
 /**
  * 根据给定的月份查询这个月的开始和结束时间
  * @param {} year
  * @param {*} month
  */
 const getMonthDateRange = (year, month) => {
   // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
   // array is 'year', 'month', 'day', etc
   let startDate = moment([year, month - 1]);
   // Clone the value before .endOf()
   let endDate = moment(startDate).endOf("month");
   // just for demonstration:
   // console.log(startDate.toDate());
   // console.log(endDate.toDate());
   // make sure to call toDate() for plain JavaScript date type
   let startTime = year + "-" + month + "-" + startDate._d.getDate();
   let endTime = year + "-" + month + "-" + endDate._d.getDate();

   return {
     startTime: startTime,
     endTime: endTime
   };
 };
 /**
  * 二分法
  * @param {*} arr 
  * @param {*} findVal 
  * @param {*} leftIndex 
  * @param {*} rightIndex 
  */
 const binarySearch = (arr, findVal, leftIndex, rightIndex) => {
   if (leftIndex > rightIndex) {
     var find = leftIndex - 1;
     return find;
   }
   var midIndex = Math.floor((leftIndex + rightIndex) / 2);
   var midVal = arr[midIndex];
   if (midVal > findVal) {
     return binarySearch(arr, findVal, leftIndex, midIndex - 1);
   } else if (midVal < findVal) {
     return binarySearch(arr, findVal, midIndex + 1, rightIndex);
   } else {
     var find = midIndex + 1;
     return find;
   }
 };
 /**
  * 判断一个数字在某一个区间内 https://blog.csdn.net/u011277123/article/details/53389401
  * 10-20：reward取值2，  <10:取值0  >100:取值7
  * 应用：图例code取给定的样式
  * @param {*} arr 数组：代表范围 var range = [10,20,31,56,89,100];
  * @param {*} reward 数组： 范围所代表的的code值 var reward = [1,2,3,4,5,6,7];
  * @param {*} rewardfindVal
  * @param {*} leftIndex
  * @param {*} rightIndex
  */
 const findCodeFromArrayExtent = (arr, reward, rewardfindVal) => {
   let index = binarySearch(arr, rewardfindVal, 0, arr.length - 1);
   return reward[index + 1];
 };
 //上一种方法的优化，见test.js ([9.982069, 11.651723, 13.321377, 14.99103, 16.660683, 18.330337, 19.999991], [1, 2, 3, 4, 5, 6], 19.79164)
 //
 const findCodeFromArrayExtentBetter = (arr, reward, rewardfindVal) => {
   // console.log("开始计算")
   let index = arr.findIndex(v => {
     return v == rewardfindVal
   })
   if (index != -1) {
     return reward[index - 1]
   } else {
     let index = binarySearch(arr, rewardfindVal, 0, arr.length - 1);
     return reward[index];
   }
 };

 /**
  *设置线或者面的图标
  *
  * @returns
  */
 const setLabelStyle = text => {
   return new Style({
     stroke: new Stroke({
       color: "red",
       width: 5
     }),
     text: new Text({
       text: text,
       offsetY: -65,
       // placement: "point",
       font: "200px",
       padding: [3, 5, 3, 5],
       fill: new Fill({
         color: "red"
       }),
       backgroundFill: new Fill({
         color: "white"
       }),
       backgroundStroke: new Stroke({
         color: "blue"
       })
     })
   });
 };
 /**
  * 可传入offset
  */
 const setLabelStyle2 = (text, offsetX, offsetY) => {
   return new Style({
     stroke: new Stroke({
       color: "red",
       width: 5
     }),
     text: new Text({
       text: text,
       offsetY: offsetY,
       offsetX: offsetX,
       // placement: "point",
       font: "200px",
       padding: [3, 5, 3, 5],
       fill: new Fill({
         color: "red"
       }),
       backgroundFill: new Fill({
         color: "white"
       }),
       backgroundStroke: new Stroke({
         color: "blue"
       })
     })
   });
 };

 /**
  *设置点的样式，包括一个点位置(圆心)、点标注
  *
  * @param {*} text
  * @returns
  */
 const setPointStyle = (text, center) => {
   return new Style({
     image: new CircleStyle({
       center: center,
       radius: 5,
       stroke: new Stroke({
         color: "red",
         width: 2
       })
     }),
     text: new Text({
       text: text,
       offsetY: -65,
       // placement: "point",
       font: "200px",
       padding: [5, 8, 5, 8],
       fill: new Fill({
         color: "red"
       }),
       backgroundFill: new Fill({
         color: "white"
       }),
       backgroundStroke: new Stroke({
         color: "blue"
       })
     })
   });
 };

 const setTextStyle = text => {
   return new Text({
     text: text,
     offsetY: -25,
     // placement: "point",
     font: "200px",
     padding: [3, 5, 3, 5],
     fill: new Fill({
       color: "red"
     }),
     backgroundFill: new Fill({
       color: "white"
     }),
     backgroundStroke: new Stroke({
       color: "blue"
     })
   });
 };
 const setTextStyleToBigMarker = text => {
   return new Text({
     text: text,
     offsetY: -15,
     // placement: "point",
     font: "200px",
     padding: [3, 5, 3, 5],
     fill: new Fill({
       color: "red"
     }),
     backgroundFill: new Fill({
       color: "white"
     }),
     backgroundStroke: new Stroke({
       color: "blue"
     }),

   });
 };

 /**
  *根据图片路径、展示内容、颜色设置图标，用于改变图标的样式
  *
  * @param {*} imgSrc
  * @param {*} text
  * @param {*} colr
  * @returns
  */
 const setImgStyle = (imgSrc, text, colr) => {
   return new Style({
     image: new Icon({
       anchor: [0.5, 1],
       src: imgSrc
     }),
     text: new Text({
       text: text,
       offsetY: -24,
       fill: new Fill({
         color: colr
       })
     })
   });
 };

 /**
  *根据图片路径、展示内容、原始颜色、现在颜色设置图标，用于改变图片的颜色样式，相对于setImgStyle方法来使用
  *两者区别只是改变了ol.style.Icon的颜色配置
  * @param {*} imgSrc
  * @param {*} text
  * @param {*} oldColr
  * @param {*} newColor
  * @returns
  */
 const changeImgStyle = (imgSrc, text, oldColr, newColor) => {
   return new Style({
     image: new Icon({
       anchor: [0.5, 1],
       src: imgSrc,
       color: newColor //区别在此
     }),
     text: new Text({
       text: text,
       offsetY: -24,
       fill: new Fill({
         color: oldColr
       })
     })
   });
 };

 //面要素闪烁,注意：不需要时要及时清除postcompose事件，因为radius一直在增加，节省内存，如果对应的面所在的图层清除了，也会取消postcompose事件，可以不调用此方法
 let polygonFlashEvent;
 const polygonFlash = (map, polygon) => {
   let radius = 0;
   console.log("radius: ", radius);
   polygonFlashEvent = map.on("postcompose", function () {
     // 增大半径，最大20
     radius++;
     radius = radius % 10;
     let color, width;
     if (radius < 5) {
       color = "yellow";
       width = 5;
     } else {
       color = "yellow";
       width = -12;
     }
     polygon.setStyle(
       new Style({
         stroke: new Stroke({
           width: width,
           color: color
         })
       })
     );
   });
 };
 let polygonFlashEvent2;
 const polygonFlash2 = (map, polygon) => {
   let radius = 0;
   console.log("radius: ", radius);
   polygonFlashEvent2 = map.on("postcompose", function () {
     // 增大半径，最大20
     radius++;
     radius = radius % 50;
     let color, width;
     if (radius < 25) {
       color = "yellow";
       width = 5;
     } else {
       color = "yellow";
       width = -12;
     }
     polygon.setStyle(
       new Style({
         stroke: new Stroke({
           width: width,
           color: color
         })
       })
     );
   });
   return polygonFlashEvent2
 };
 let featureFlashEvent;
 const featureFlash = (map, feature) => {
   let style = feature.getStyle();
   let radius = 0;
   console.log("radius: ", radius);
   featureFlashEvent = map.on("postcompose", function () {
     // 增大半径，最大20
     radius++;
     radius = radius % 10;
     let color, width;
     if (radius < 5) {
       color = "yellow";
       width = 5;
     } else {
       color = "yellow";
       width = -12;
     }
     polygon.setStyle(
       new Style({
         stroke: new Stroke({
           width: width,
           color: color
         })
       })
     );
   });
 };
 const stopPolygonFlash = map => {
   map.un("postcompose");
 };
 //点击时绘制闪烁的图标icon
 let markerFlashEvent;
 const markerFlash = (map, marker, imgPath, scale) => {
   let radius = 0;
   // console.log("radius: ", radius);
   markerFlashEvent = map.on("postcompose", function () {
     // 增大半径，最大20
     radius++;
     radius = radius % 50;
     var color, opacity;
     if (radius < 25) {
       opacity = 1
     } else {
       opacity = 0
     }
     marker.setStyle(new Style({
       image: new Icon({
         anchor: [0.5, 0.8],
         src: imgPath,
         opacity: opacity,
         scale: scale
       })
     }));
   });
   return markerFlashEvent
 };
 //点击时绘制闪烁的圆形Circle样式
 let circleFlashEvent;
 const circleFlash = (map, point) => {
   let radius = 0;
   console.log("radius: ", radius);
   circleFlashEvent = map.on("postcompose", function () {
     // 增大半径，最大20
     radius++;
     radius = radius % 50;
     var opacity;
     if (radius < 25) {
       opacity = 0
     } else {
       opacity = 1
     }
     point.setStyle(new Style({
       image: new CircleStyle({
         center: transform(point.getGeometry().getCoordinates(), "EPSG:4326", "EPSG:3857"),
         radius: 6,
         stroke: new Stroke({
           color: 'rgba(220,20,60, ' + opacity + ')', //红色
           width: 2
         }),
         fill: new Fill({
           color: 'rgba(255,255,0, ' + opacity + ')', //黄色
         })
       })
     }));
   });
   return circleFlashEvent;
 };
 //地图模态层的实现
 const createModalLayer = zoneCoord => {
   let boundCoord = [
     [
       [-180, -90],
       [180, -90],
       [180, 90],
       [-180, 90],
       [-180, -90]
     ]
   ];
   let boundGeo = turf.polygon(boundCoord),
     zoneGeo = turf.polygon(zoneCoord);
   let modalJson = turf.difference(boundGeo, zoneGeo);
   let features = new GeoJSON().readFeatures(modalJson);
   //设置模态层的id，当前值默认模态层为一个面，turf的different返回的是多个面
   features[0].setId("modalFeature");
   let modalLayer = new VectorLayer({
     renderMode: "image", //image, vector
     source: new VectorSource({
       features: features
     }),
     style: new Style({
       fill: new Fill({
         color: "rgba(255, 255, 255, 0.4)"
       })
     }),
     zIndex: 100
   });
   modalLayer.set("name", "modalLayer")
   return modalLayer;
 };
 /**
  * 对layer使用set设置name的图层进行查找，获得该图层对象
  */
 const getLayerFromSetname = (map, layerOfSetname) => {
   let allLayers = map.getLayers();
   allLayers.forEach(layer => {
     if (layer.get("name") && layer.get("name") == layerOfSetname) {
       return layer;
     } else {
       return undefined;
     }
   });
 };
 /**
  * 策略：给每条线段进行编号，每个断面和相应的线段相匹配，可以把断面的id赋给所需监测的线段
  */
 const getAlongPoint = (lineCoords, distance, unit) => {
   let line = turf.lineString(lineCoords);
   let options = {
     units: unit
   };
   return turf.along(line, distance);
 };

 //柱状图层的实现
 /**
  * data:[{xdata:"Mon",seriesData:120},{{xdata:"Mon",seriesData:120}}]
  *
  *
  *
  */
 let _createBarOption = data => {
   return {
     tooltip: {
       trigger: "axis",
       axisPointer: {
         // 坐标轴指示器，坐标轴触发有效
         type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
       }
     },
     xAxis: {
       type: "category"
       // show: false
     },
     yAxis: {
       type: "value"
       // show: false
     },
     series: [{
       data: data,
       type: "bar"
     }]
   };
 };
 const createBarChart = data => {
   let el = document.createElement("canvas");
   let bar = echarts.init(el, null, {
     height: 50,
     width: 20,
     renderer: "canvas"
   });
   let option = _createBarOption(data);
   bar.setOption(option);
   return bar.getDom();
 };
 /**
  * 彻底删除图层，只针对图层名称为layerName和用map.set("layerName")设置了属性的图层
  * @param {*} map
  * @param {*} layerName
  */
 const removeLayerBySameName = (map, layerName) => {
   if (map instanceof Map) {
     let layer = map.get(layerName);
     // console.log("删除的图层layer: ", layer);
     if (layer) {
       map.removeLayer(layer);
       map.unset(layerName);
     }
   }
 };
 /**
  * //获取最近7天日期 :getDay(0);//当天日期  getDay(-7);//7天前日期
  * @param {*} day
  */
 const getDay = day => {
   let today = new Date();
   let targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
   today.setTime(targetday_milliseconds); //注意，这行是关键代码
   let tYear = today.getFullYear();
   let tMonth = today.getMonth();
   let tDate = today.getDate();
   tMonth = doHandleMonth(tMonth + 1);
   tDate = doHandleMonth(tDate);
   return tYear + "-" + tMonth + "-" + tDate;
 };
 const doHandleMonth = month => {
   let m = month;
   if (month.toString().length == 1) {
     m = "0" + month;
   }
   return m;
 };

 /**
  * 
  * @param {*} curDate new Date()  当前日期
  * @param {*} day 前n天传-n  后n天传n
  * 例如getPreOrNextDay(new Date(),2)代表后2天
  * getPreOrNextDay(new Date(), -2) 代表前2天
  */
 const getPreOrNextDay = (curDate, day) => {
   let targetday_milliseconds = curDate.getTime() + 1000 * 60 * 60 * 24 * day;
   curDate.setTime(targetday_milliseconds); //注意，这行是关键代码
   let tYear = curDate.getFullYear();
   let tMonth = curDate.getMonth();
   let tDate = curDate.getDate();
   tMonth = doHandleMonth(tMonth + 1);
   tDate = doHandleMonth(tDate);
   return tYear + "-" + tMonth + "-" + tDate;
 };
 /**
  * 
  * @param {
    *
  }
  curDate curDate new Date() 当前日期
  * @param {*} month 桶前后日期
  */
 const getPreOrNextMonth = (curDate, month) => {
   curDate.setDate(curDate.getDate()); //获取Day天后的日期
   var y = curDate.getFullYear();
   var m;
   if (curDate.getMonth() + month + 1 > 12) {
     y = y + 1;
     m = curDate.getMonth() + month - 11; //获取当前月份的日期 d
     if (m < 10) {
       m = "0" + String(m)
     }
   } else {
     m = curDate.getMonth() + month + 1; //获取当前月份的日期 d
     if (m < 10) {
       m = "0" + String(m)
     }
   }
   var d = curDate.getDate();
   return y + "-" + m + "-" + d;
 }

 /**
  * Mon Jan 01 2018 00: 00: 00 GMT + 0800(中国标准时间)  转 2018-01-01
  */
 const getFormatDate_YMD = date => {
   let seperator1 = "-";
   let year = date.getFullYear();
   let month = date.getMonth() + 1;
   let strDate = date.getDate();
   if (month >= 1 && month <= 9) {
     month = "0" + month;
   }
   if (strDate >= 0 && strDate <= 9) {
     strDate = "0" + strDate;
   }
   let currentdate = year + seperator1 + month + seperator1 + strDate;
   return currentdate;
 };
 /**
  *
  var newDate = new Date（）；
  1
  返回的Date格式：

  Wed Dec 13 2017 16: 00: 00 GMT + 0800(中国标准时间)
  1
  而且是object类型的

  所需求的格式为

  2017 - 12 - 13 16: 00: 00
  * 
  */
 const formatDate_YMDHMS = (date) => {
   var y = date.getFullYear();
   var m = date.getMonth() + 1;
   m = m < 10 ? ('0' + m) : m;
   var d = date.getDate();
   d = d < 10 ? ('0' + d) : d;
   var h = date.getHours();
   var minute = date.getMinutes();
   minute = minute < 10 ? ('0' + minute) : minute;
   var second = date.getSeconds();
   second = second < 10 ? ('0' + second) : second;
   return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
 };


 /**
  * Mon Jan 01 2018 00: 00: 00 GMT + 0800(中国标准时间)  转 2018-01
  */
 const getFormatDate_YM = date => {
   let seperator1 = "-";
   let year = date.getFullYear();
   let month = date.getMonth() + 1;
   if (month >= 1 && month <= 9) {
     month = "0" + month;
   }

   let currentdate = year + seperator1 + month;
   return currentdate;
 };


 /**
  * 移除地图上的所有overlays
  * @param {*} map 
  */
 const removeAllOverlay = (map) => {
   if (map) {
     let overlays = map.getOverlays();
     if (overlays.getLength() > 0) {
       overlays.forEach(overlay => {
         map.removeOverlay(overlay)
       })
     }
   }
 }
 /**
  * 隐藏地图上所有的overlayers
  * @param {*} map 
  */
 const hideAllOverlay = (map) => {
   if (map) {
     let overlays = map.getOverlays();
     if (overlays.getLength() > 0) {
       overlays.forEach(overlay => {
         overlay.setPosition(undefined)
       })
     }
   }
 }
 /**
  * 移除所有的图层
  * 注意：map.getLayers拿不到layerGrop创建的图层，
  * 要移除所有的图层, 需要把map.getLayerGrop拿到的图层仪器移除
  * @param {*} map 
  */
 const removeAllLayers = (map) => {
   if (map) {
     let layers = map.getLayers()
     if (layers.getLength() > 0) {
       layers.forEach(layer => {
         if (layer != null) {
           map.removeLayer(layer)
         }
       })
     }
     let gropLayers = map.getLayerGroup().getLayers()
     if (gropLayers.getLength() > 0) {
       gropLayers.forEach(layer => {
         if (layer != null) {
           map.removeLayer(layer)
         }
       })
     }
   }
 }
 //删除所有的interactions
 const removeAllInteractions = (map) => {
   if (map) {
     let interactions = map.getInteractions()
     if (interactions.getLength() > 0) {
       interactions.forEach(v => {
         map.removeInteraction(v)
       })
     }
   }
 }
 /**
  * 利用turf获取多面的中心点， 由于turf.centroid方法的参数只接受单面，不接收多面，因此，选择返回结果rings里面最大面为参数，其他小面忽略
  * @param {*} geometry 
  */
 const getCentroidOfMultiPolygon = (geometry) => {
   let polygon = turf.polygon([geometry.rings[0]]);
   let centerPoint = turf.centroid(polygon).geometry.coordinates;
   return centerPoint
 }
 /**
  * 获取单面的中心点
  * @param {*} polygon 面feature
  */
 const getCentroidOfPolygon = (polygon) => {
   let turfPolygon = turf.polygon([polygon.get("geometry")
     .getCoordinates()[0]
   ]);
   let centerPoint = turf.centroid(turfPolygon).geometry.coordinates;
   return centerPoint
 }



 //水温高低颜色等级的定义，根据逻辑，图例颜色只取coloRange内除索引最大和最小的颜色
 // const colorRange = (colorRangeOfLegend, levelNum) => {
 //   let colorRange = [];
 //   if (colorRangeOfLegend.length == levelNum) {
 //     _.map(colorRangeOfLegend, item => {
 //       colorRange.push(item);
 //     });
 //     colorRange.push("#030303");
 //     colorRange.unshift("#030303");
 //     return colorRange
 //   }
 // }
 // const setStyle = (color, width) => {
 //   return new Style({
 //     stroke: new Stroke({
 //       color: color,
 //       width: width
 //     })
 //   });
 // };
 // const setWidth = width => {
 //   return width + 1;
 // };
 // const tempStyles = (colorRangeOfLegend, levelNum) => {
 //   let colorRange = colorRange(colorRangeOfLegend, levelNum)
 //   return [
 //     setStyle(colorRange[0], setWidth(0)),
 //     setStyle(colorRange[1], setWidth(0.5)),
 //     setStyle(colorRange[2], setWidth(1)),
 //     setStyle(colorRange[3], setWidth(1.5)),
 //     setStyle(colorRange[4], setWidth(2)),
 //     setStyle(colorRange[5], setWidth(2.5)),
 //     setStyle(colorRange[6], setWidth(3))
 //   ]
 // };

 //根据监测类型获取分级渲染的分段值
 /**
  *
  * @param {*} estimateData 后台数据
  * @param {*} monitorValueType 监测最大值、最小值、平均值
  * @param {*} num 分段数
  */
 const getTempRangeArr = (estimateData, monitorValueType, num) => {
   if (monitorValueType == "maxValue") {
     monitorValueType = "max_water_temperature";
   } else if (monitorValueType == "aveValue") {
     monitorValueType = "ave_water_temperature";
   } else if (monitorValueType == "minValue") {
     monitorValueType = "min_water_temperature";
   }
   if (estimateData) {
     let maxValue = _.maxBy(estimateData, item => {
       return item[monitorValueType];
     })[monitorValueType];
     let minValue = _.minBy(estimateData, item => {
       return item[monitorValueType];
     })[monitorValueType];
     console.log("分级最大值和最小值", maxValue, minValue);
     return getRangeByMaxAndMinValue(maxValue, minValue, num);
   } else {
     return;
   }
 };
 //设置鼠标的样式
 const setCursorStyle = (evt) => {
   let featuresAtPixel = evt.target.getFeaturesAtPixel(evt.pixel);
   if (featuresAtPixel != null) {
     evt.target.getTargetElement().style.cursor = "pointer";
   } else {
     evt.target.getTargetElement().style.cursor = "default";
   }
 }
 //打印地图的基本信息
 const consoleMapInfo = (evt) => {
   console.log("地图级别：", evt.target.getView().getZoom());
   console.log("当前的坐标", evt.coordinate);
   console.log(
     "当前地图的范围",
     evt.target.getView().calculateExtent(evt.target.getSize())
   );
   console.log(
     "当前中心坐标",
     getCenter(evt.target.getView().calculateExtent(evt.target.getSize()))
   );
 }
 /**
  * 从对象数组内根据属性字段获取最大和最小值
  */
 const getMaxAndMinValueOfArr = (arr, prop) => {
   let maxValue, minValue;
   if (arr instanceof Array) {
     let max = _.maxBy(arr, item => {
       return item[prop];
     });
     if (max) {
       maxValue = max[prop]
     }
     let min = _.minBy(arr, item => {
       return item[prop];
     });
     if (min) {
       minValue = min[prop]
     }
     return {
       maxValue: maxValue,
       minValue: minValue
     }
   }
 }
 const setStyle = (color, width) => {
   return new Style({
     stroke: new Stroke({
       color: color,
       width: width
     })
   });
 }
 const setPolygonStyle = (strokeColor, fillColor) => {
   return new Style({
     stroke: new Stroke({
       color: strokeColor,
       width: 0.5
     }),
     fill: new Fill({
       color: fillColor
     })
   });
 }
 // const setWidth = width => {
 //   return width + 1;
 // }
 /**
  * 优化上一个方法
  * @param {} width 
  */
 const setWidth = (width, start) => {
   debugger
   if (start) {
     return width + start;
   } else {
     return width + 1;
   }
 }
 /**
  * 根据颜色范围（数组）获取样式范围（数组），适用于线的分级渲染
  * @param {*} colorRangeOfLegend  颜色数组
  * @param {*} levelNum 颜色数组长度
  * * @param {* }strokeWidth 宽度，
  levelNum 颜色数组长
  */
 const getStylesFromColorRange = (colorRangeOfLegend, levelNum, strokeWidth) => {
   let colorRange = [];
   if (colorRangeOfLegend.length == levelNum) {
     _.map(colorRangeOfLegend, item => {
       colorRange.push(item);
     });
     colorRange.push("#030303");
     colorRange.unshift("#030303");
   }
   return [
     setStyle(colorRange[0], strokeWidth),
     setStyle(colorRange[1], strokeWidth),
     setStyle(colorRange[2], strokeWidth),
     setStyle(colorRange[3], strokeWidth),
     setStyle(colorRange[4], strokeWidth),
     setStyle(colorRange[5], strokeWidth),
     setStyle(colorRange[6], strokeWidth),
   ];
 }
 const getStylesFromColorRangeBlow = (colorRangeOfLegend, levelNum, strokeWidth) => {
   let colorRange = [];
   if (colorRangeOfLegend.length == levelNum) {
     _.map(colorRangeOfLegend, item => {
       colorRange.push(item);
     });
     colorRange.push("#030303");
     colorRange.unshift("#030303");
   }
   return [
     setStyle(colorRange[0], strokeWidth),
     setStyle(colorRange[1], strokeWidth),
     setStyle(colorRange[2], strokeWidth),
     setStyle(colorRange[3], strokeWidth),
     setStyle(colorRange[4], strokeWidth),
     setStyle(colorRange[5], strokeWidth),
     setStyle(colorRange[6], strokeWidth),
   ];
 }
 /**
  * 根据颜色范围（数组）获取样式范围（数组），适用于面的分级渲染
  * @param {*} colorRangeOfLegend  颜色数组
  * @param {*} levelNum 颜色数组长度
  * * @param {* }Multiple 宽度，参照值为0.25
  levelNum 颜色数组长
  */
 const getPolygonStylesFromColorRange = (colorRangeOfLegend, levelNum) => {
   let strokeColor = "#CCCACA" //默认边颜色
   let colorRange = [];
   if (colorRangeOfLegend.length == levelNum) {
     _.map(colorRangeOfLegend, item => {
       colorRange.push(item);
     });
     colorRange.push("#272626");
     colorRange.unshift("#272626");
   }
   return [
     setPolygonStyle(strokeColor, colorRange[0]),
     setPolygonStyle(strokeColor, colorRange[1]),
     setPolygonStyle(strokeColor, colorRange[2]),
     setPolygonStyle(strokeColor, colorRange[3]),
     setPolygonStyle(strokeColor, colorRange[4]),
     setPolygonStyle(strokeColor, colorRange[5]),
     setPolygonStyle(strokeColor, colorRange[6]),
   ];
 }

 const showPopup = (evt) => {
   let feature = evt.target.forEachFeatureAtPixel(evt.pixel,
     function (feature) {
       return feature;
     });
   if (feature) {
     let coordinates = feature.getGeometry().getCoordinates();
     popup.setPosition(coordinates);
     $(element).popover({
       placement: 'top',
       html: true,
       content: feature.get('name')
     });
     $(element).popover('show');
   } else {
     $(element).popover('destroy');
   }
 }
 /**
  * 获取随机颜色
  */
 const randomColor = () => {
   let r = Math.floor(Math.random() * 256);
   let g = Math.floor(Math.random() * 256);
   let b = Math.floor(Math.random() * 256);
   return "rgb(" + r + "," + g + "," + b + ")"; //所有方法的拼接都可以用ES6新特性`其他字符串{$变量名}`替换
 }
 //配置水质图标的颜色，和图标采用的颜色一致，对应于wq.js里的_getFeatureIconImageSrc方法，用颜色提取器提取
 const getScatterAnimationColor = (type) => {
   console.log("图标类型type: ", type);
   let color;
   if (!type) {
     color = "red";
     return;
   }
   switch (type) {
     case 1:
     case 2:
       color = "#57BEE7";
       break;
     case 3:
       color = "#A3E4AE";
       break;
     case 4:
       color = "#F8D84B";
       break;
     case 5:
       color = "#F29675";
       break;
     case 6:
       color = "#EA678B";
       break;
     default:
       color = "#7A6CEA";
       break;
   }
   return color;
 }

 //cesium屏幕坐标转世界坐标再转弧度再转经纬度
 const screenToLonlatCoords = (viewer, x, y) => {
   let pick1 = new Cesium.Cartesian2(x, y);
   let cartesian = viewer.scene.globe.pick(
     viewer.camera.getPickRay(pick1),
     viewer.scene
   );
   console.log("世界坐标: ", cartesian);
   let ellipsoid = viewer.scene.globe.ellipsoid;
   let cartesian3 = new Cesium.Cartesian3(
     cartesian.x,
     cartesian.y,
     cartesian.z
   );
   let cartographic = ellipsoid.cartesianToCartographic(cartesian3);
   console.log("弧度: ", cartographic);
   let lat = Cesium.Math.toDegrees(cartographic.latitude);
   let lng = Cesium.Math.toDegrees(cartographic.longitude);
   let alt = cartographic.height;
   console.log("经纬度：", [lng, lat, alt]);
   return {
     cartesian: cartesian,
     cartographic: cartographic,
     lonlat: [lng, lat, alt]
   };
 }

 /**

  * 自动化合并单元格, 此方法之提供合并前三列的功能，
  * 合并第一列调mergeCells(1), 
  * 合并前两列，依次调mergeCells(1), mergeCells(0), 
  * 合并前三列依次调mergeCells(1), mergeCells(0)mergeCells(2)
  * @param {*} index 
  */
 const mergeCells = (index) => {
   this.$nextTick(() => {
     let val = "",
       val0 = "",
       val1 = "",
       cell = 0,
       rowspan = 1;
     let table = this.$refs.table.$children[1];
     if (table) {
       let trs = Array.from(table.$el.querySelectorAll(".ivu-table-row"));
       if (index == 1) {
         for (let i = 0; i < trs.length; i++) {
           let text0 = trs[i].children[0].getElementsByTagName("span")[0]
             .innerText;
           let text1 = trs[i].children[1].getElementsByTagName("span")[0]
             .innerText;
           if (val == "") {
             val0 = text0;
             val = text1;
             cell = i;
           } else {
             if (val == text1 && val0 == text0) {
               rowspan++;
               trs[i].children[1].style.display = "none";
               trs[cell].children[1].setAttribute("rowspan", rowspan);
             } else {
               val0 = text0;
               val = text1;
               rowspan = 1;
               cell = i;
             }
           }
         }
       } else if (index == 2) {
         for (let i = 0; i < trs.length; i++) {
           let text0 = trs[i].children[0].getElementsByTagName("span")[0]
             .innerText;
           let text1 = trs[i].children[1].getElementsByTagName("span")[0]
             .innerText;
           let text2 = trs[i].children[2].getElementsByTagName("span")[0]
             .innerText;
           if (val == "") {
             val0 = text0;
             val1 = text1;
             val = text2;
             cell = i;
           } else {
             if (val == text2 && val0 == text0 && val1 == text1) {
               rowspan++;
               trs[i].children[2].style.display = "none";
               trs[cell].children[2].setAttribute("rowspan", rowspan);
             } else {
               val0 = text0;
               val1 = text1;
               val = text2;
               rowspan = 1;
               cell = i;
             }
           }
         }
       } else {
         for (let i = 0; i < trs.length; i++) {
           let text = trs[i].children[index].getElementsByTagName("span")[0]
             .innerText;
           if (val == "") {
             val = text;
             cell = i;
           } else {
             if (val == text) {
               rowspan++;
               trs[i].children[index].style.display = "none";
               trs[cell].children[index].setAttribute("rowspan", rowspan);
             } else {
               val = text;
               rowspan = 1;
               cell = i;
             }
           }
         }
       }
     }
   });
 }
 var obj = [{
   date: "2017-08-11",
   state: "上",
   result: {
     "温度": 4,
     "湿度": 3
   },
 }, {
   date: "2017-08-11",
   state: "上",
   result: {
     "温度": 4,
     "湿度": 3
   }
 }, {
   date: "2017-08-11",
   state: "下",
   result: {
     "温度": 2,
     "湿度": 3
   }
 }, {
   date: "2017-08-10",
   state: "下",
   result: {
     "温度": 5,
     "湿度": 3
   }
 }];
 /// 两个对象内的相同属性相加
 const multipleObjPlus = (obj) => {
   let temp = [],
     result = [];
   obj.forEach((item, index) => {
     let skey = item.date + item.state;
     if (typeof temp[skey] == "undefined") {
       temp[skey] = item;
     } else {
       for (let k in item.result) {
         temp[skey]["result"][k] += item["result"][k];
       }
       //temp[skey]["result"]["温度"] += item["result"]["温度"];
       //temp[skey]["result"]["湿度"] += item["result"]["湿度"];
     }

   });

   for (let i in temp) {
     result.push(temp[i]);
   }
   return result;
 }
 //数组对象去重
 var arr = [{
   key: '01',
   value: '乐乐'

 }, {
   key: '02',
   value: '博博'

 }, {
   key: '03',
   value: '淘淘'

 }, {
   key: '04',
   value: '哈哈'

 }, {
   key: '01',
   value: '乐乐'

 }];
 const removeDuplicateArr = (arr, key) => {
   let result = [];
   let obj = {};
   for (let i = 0; i < arr.length; i++) {
     if (!obj[arr[i][key]]) {
       result.push(arr[i]);
       obj[arr[i][key]] = true;
     }
   }
   return result
 }

 //js对象数组根据某个字段进行分组
 const groupByField = (arr, id) => {
   let map = {},
     dest = [];
   for (let i = 0; i < arr.length; i++) {
     let ai = arr[i];
     if (!map[ai[id]]) {
       dest.push({
         id: ai[id],
         name: ai.name,
         data: [ai]
       });
       map[ai[id]] = ai;
     } else {
       for (let j = 0; j < dest.length; j++) {
         let dj = dest[j];
         if (dj.id == ai[id]) {
           dj.data.push(ai);
           break;
         }
       }
     }
   }
   return dest;
 }

 const pagination = (pageNo, pageSize, array) => {
   var offset = (pageNo - 1) * pageSize;
   return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);

 }
 const arryRemove = () => {
   Array.prototype.indexOf = function (val) {
     for (var i = 0; i < this.length; i++) {
       if (this[i] == val) return i;
     }
     return -1;
   };
   Array.prototype.remove = function (val) {
     var index = this.indexOf(val);
     if (index > -1) {
       this.splice(index, 1);
     }
   };
 };
 // 判断参数是否是其中之一
 const oneOf = (value, validList) => {
   for (let i = 0; i < validList.length; i++) {
     if (value === validList[i]) {
       return true;
     }
   }
   return false;
 }
 const findComponentUpward = (context, componentName, componentNames) => {
   if (typeof componentName === 'string') {
     componentNames = [componentName];
   } else {
     componentNames = componentName;
   }

   let parent = context.$parent;
   let name = parent.$options.name;
   while (parent && (!name || componentNames.indexOf(name) < 0)) {
     parent = parent.$parent;
     if (parent) name = parent.$options.name;
   }
   return parent;
 }

 /**
    批量改变对象的Key
  * @param {*} data  {
    id：‘ 11’, name: ‘张三’
  }
  * @param {*} keyMap {
    id: ‘序列’,
    name: ‘姓名’
  }
  * 结果： {
    序列：“ 11”, 姓名：“ 张三”
  }
  */
 const changeKeys = (data, keyMap) => {
   return Object.keys(data).reduce((newData, key) => {
     let newKey = keyMap[key] || key
     newData[newKey] = data[key]
     console.log('newData: ', newData);
     return newData;
   }, {})
 }
 //生成uuid
 //用于生成16位uuid
 const S4 = () => {
   return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
 }
 const getUuid = () => {
   return (S4() + S4());
 }

 export {
   showPopup,
   tempStyles,
   getTempRangeArr,
   getMonthDateRange,
   getDay,
   getPreOrNextDay,
   getPreOrNextMonth,
   getFormatDate_YMD,
   formatDate_YMDHMS,
   getFormatDate_YM,
   findCodeFromArrayExtent,
   findCodeFromArrayExtentBetter,
   getRangeByMaxAndMinValue,
   getRangeByMaxAndMinValue_decimalPointNum,
   getMaxAndMinValueOfArr,
   setLabelStyle,
   setTextStyle,
   setTextStyleToBigMarker,
   setImgStyle,
   changeImgStyle,
   setPointStyle,
   polygonFlash,
   polygonFlash2,
   featureFlash,
   markerFlash,
   circleFlash,
   stopPolygonFlash,
   createModalLayer,
   getAlongPoint,
   getLayerFromSetname,
   createBarChart,
   removeLayerBySameName,
   removeAllOverlay,
   removeAllLayers,
   hideAllOverlay,
   removeAllInteractions,
   calEnvelop_wt,
   getCentroidOfPolygon,
   getCentroidOfMultiPolygon,
   setCursorStyle,
   consoleMapInfo,
   setLabelStyle2,
   getStylesFromColorRange,
   getStylesFromColorRangeBlow,
   getPolygonStylesFromColorRange,
   randomColor,
   getScatterAnimationColor,
   screenToLonlatCoords,
   mergeCells,
   multipleObjPlus,
   removeDuplicateArr,
   groupByField,
   getUuid,
   pagination,
   arryRemove,
   oneOf,
   findComponentUpward,
   changeKeys
 };
