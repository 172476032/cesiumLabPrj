 import Stroke from "ol/style/Stroke";
 import Style from "ol/style/Style";
 import Icon from 'ol/style/Icon';
 import Point from "ol/geom/Point"
 import Feature from 'ol/Feature';
 import VectorLayer from 'ol/layer/Vector';
 //图层资源
 import VectorSource from 'ol/source/Vector';
 import Select from "ol/interaction/Select"
 import EsriJSON from "ol/format/EsriJSON"
 import {
   transform
 } from 'ol/proj';
 import {
   pointerMove,
   singleClick
 } from "ol/events/condition"
 import bus from "@/script/bus.js";
 import axios from "axios"
 import linstringicon from "@/assets/img/line.png";
 import polygonicon from "@/assets/img/polygon.png";
 import pointicon from "@/assets/img/pointicon.png";
 import {
   getCentroidOfMultiPolygon,
   locationToExtentByFeatureType
 }
 from "@/script/mapUtils/myMaputils/myUtils.js"
 import Cesium from "cesium/Cesium"
 const img = require("../../../../../static/map/pointicon.png")
 import img1 from "../../../../../static/map/pointicon.png"
 const img2 = "/static/map/pointicon.png"
 const img3 = require("../../../../assets/img/pointicon.png");
 const img4 = "../../../../assets/img/pointicon.png"
 export default {
   data() {
     return {
       overALLSearchIconLayer: null,
       hoverMoveGeomsLayer: null,
       clickGeomsLayer: null,
       pointMoverInteraction: null,
       clickInteraction: null,
       preClickedEntity: null,
       preHoverEntity: null,
       clickSelectColor: Cesium.Color.AQUA
     }
   },
   computed: {
     seachRenderLayers() {
       return this.$store.state.map.seachRenderLayers;
     },
     overAllSearchMapservices() {
       return this.$store.state.map.overAllSearchMapservices
     }
   },
   methods: {
     overAllSearch(seachText) {
       //初始化用于渲染的的所有图层
       this.initLayers(this.map, this.seachRenderLayers);
       this.clearSelectFeatures()
       let seachMapNames = _.map(this.overAllSearchMapservices, v => {
         return v.name;
       });
       console.log("服务的名称: ", seachMapNames);
       let axiosAll = _.map(this.overAllSearchMapservices, v => {
         return axios.get(`${v.url}${seachText}`);
       });
       console.log("axiosAll: ", axiosAll);
       this.$store.state.map.searchLoadStatus = true;
       this.$store.state.map.searchCloseShow = false;
       axios.all(axiosAll).then(results => {
         //隐藏详情，展开查询列表
         bus.$emit("handleDetailBackBtnClickReSEACH");
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
           this.$store.state.map.seachNorltShow = true;
           console.log(' store.state.map.seachNorltShow: ', this.$store.state.map.seachNorltShow);
           //清除上次的查询结果
           this.$store.state.map.seachListData.seachList = [];
           return;
         } else {
           this.$store.state.map.seachNorltShow = false;
           console.log(' store.state.map.seachNorltShow: ', this.$store.state.map.seachNorltShow);
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
         this.$store.state.map.seachOldMapNames = seachMapNames;
         console.log("删除后", seachMapNames);
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
             if (!this.is3dMap) {
               featureInfo.marker = this.createFeatures(featureInfo, featureInfo.mapServerName);
             } else {
               this.rederIdentity3dMap(featureInfo)
             }
           });
           listData.push(mapserverInfo);
         });
         //给查询到的结果赋值给store，供界面展示结果
         console.log("解析后的identify查询结果", listData);
         let seachListData = this.$store.state.map.seachListData;
         seachListData.total = num;
         seachListData.seachList = listData;
         this.$store.commit("animateToOriginView")
       }).finally(() => {
         //隐藏loading动画
         this.$store.state.map.searchLoadStatus = false;
         this.$store.state.map.searchCloseShow = true;
       });;
     },
     //初始化需要用到的图层
     initLayers(map, renderLayers) {
       //如果map已经存在了其中一个图层，则认为2个图层均已创建过
       if (map.get("overALLSearchIconLayer") != undefined) {
         return
       }
       //identify：查询后绘制的marker图层
       this.overALLSearchIconLayer = new VectorLayer({
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
           if (feature.get("type") == "pointicon") {
             style = this.setImgStyle(pointicon, str, "#fff");
           } else if (feature.get("type") == "linstringicon") {
             style = this.setImgStyle(linstringicon, str, "#fff");
           } else if (feature.get("type") == "polygonicon") {
             style = this.setImgStyle(polygonicon, str, "#fff");
           }
           return style;
         }
       });
       this.overALLSearchIconLayer.set("name", "overALLSearchIconLayer")
       map.addLayer(this.overALLSearchIconLayer);
       map.set("overALLSearchIconLayer", this.overALLSearchIconLayer);
       renderLayers.push(this.overALLSearchIconLayer)
       // 添加图层交互事件
       this.addPointerMoveEvt(this.overALLSearchIconLayer);
       this.addClickEvt(this.overALLSearchIconLayer)
       // 界面hover时绘制的图层
       this.hoverMoveGeomsLayer = new VectorLayer({
         source: new VectorSource({}),
         zIndex: 9000,
         style: () => {
           return new Style({
             stroke: new Stroke({
               color: "red",
               width: 5
             })
           });
         }
       });
       this.hoverMoveGeomsLayer.set("name", "hoverMoveGeomsLayer")
       map.addLayer(this.hoverMoveGeomsLayer);
       map.set("hoverMoveGeomsLayer", this.hoverMoveGeomsLayer);
       renderLayers.push(this.hoverMoveGeomsLayer);
       // 界面click时绘制的图层
       this.clickGeomsLayer = new VectorLayer({
         source: new VectorSource({}),
         zIndex: 9000,
         style: () => {
           return new Style({
             stroke: new Stroke({
               color: "red",
               width: 5
             })
           });
         }
       });
       this.clickGeomsLayer.set("name", "clickGeomsLayer")
       map.addLayer(this.clickGeomsLayer);
       map.set("clickGeomsLayer", this.clickGeomsLayer);
       renderLayers.push(this.clickGeomsLayer)
     },
     setImgStyle(imgSrc, text, colr) {
       return new Style({
         image: new Icon({
           anchor: [0.5, 1],
           src: imgSrc
         }),
         // text: new Text({
         //   text: text,
         //   offsetY: -24,
         //   fill: new Fill({
         //     color: colr
         //   })
         // })
       });
     },
     addPointerMoveEvt(overALLSearchIconLayer) {
       this.pointMoverInteraction = new Select({
         layers: [overALLSearchIconLayer],
         condition: pointerMove,
         style: (f) => {
           let type = f.get("type"),
             style;
           if (type == 'pointicon') {
             style = this.setImgStyle(pointicon, 'str', "#fff")
           } else if (type == "linstringicon") {
             style = this.setImgStyle(linstringicon, 'str', "#fff")
           } else if (type == "polygonicon") {
             style = this.setImgStyle(polygonicon, 'str', "#fff")
           }
           return style;
         }
       })
       this.pointMoverInteraction.on("select", (e) => {
         console.log('e: ', e);
         if (e.selected.length > 0) {
           this.map.getTargetElement().style.cursor = "pointer";
           this.$store.commit("SET_HOVERED_FEATURE", {
             type: "overAllSearch",
             feature: e.selected[0]
           });
           //绘制要素
           this.hoverMoveGeomsLayer.getSource().clear()
           this.hoverMoveGeomsLayer.getSource().addFeature(e.selected[0].get("evtFeature"))
         } else {
           this.map.getTargetElement().style.cursor = "";
           //修改为隐藏overlay的形式
           this.hoverMoveGeomsLayer.getSource().clear()
           this.$store.commit("SET_HOVERED_FEATURE", {
             type: "overAllSearch",
             feature: null
           });
         }
       })
       this.map.addInteraction(this.pointMoverInteraction);
     },
     addClickEvt(overALLSearchIconLayer) {
       this.clickInteraction = new Select({
         layers: [overALLSearchIconLayer],
         condition: singleClick,
         style: (f) => {
           let type = f.get("type"),
             style;
           if (type == 'pointicon') {
             style = this.setImgStyle(pointicon, 'str', "#fff")
           } else if (type == "linstringicon") {
             style = this.setImgStyle(linstringicon, 'str', "#fff")
           } else if (type == "polygonicon") {
             style = this.setImgStyle(polygonicon, 'str', "#fff")
           }
           return style;
         }
       })
       this.clickInteraction.on("select", (e) => {
         console.log('单机选择的要素: ', e);
         if (e.selected.length > 0) {
           this.$store.commit("SET_HOVERED_FEATURE", {
             type: "overAllSearch",
             feature: e.selected[0]
           });
           this.clickGeomsLayer.getSource().clear()
           //信息展示
           let props = e.selected[0].get("property");
           bus.$emit("on-showSeachAllInfo", {
             attributes: props.attributes,
             mapServerName: props.mapServerName,
             featureName: props.name
           })
           //闪烁点
           let cords = e.selected[0].getGeometry().getCoordinates();
           this.$store.commit("set_sctterAnimationPoint", {
             coordinate: cords,
             color: "red"
           });
         }
       })
       this.map.addInteraction(this.clickInteraction)
     },

     renderHoveMoveFeatures(marker) {
       if (!this.is3dMap) {
         this.hoverMoveGeomsLayer.getSource().clear()
         this.hoverMoveGeomsLayer.getSource().addFeature(marker);
         this.$store.commit("SET_HOVERED_FEATURE", {
           type: "overAllSearch",
           feature: marker
         });
       } else {
         if (this.preHoverEntity) {
           this.preHoverEntity.billboard.color = this.preClickColor;
         }
         this.preHoverEntity = window.Viewer.entities.getById(marker.uuid);
         this.preClickColor = this.preHoverEntity.billboard.color;
         this.preHoverEntity.billboard.color = this.clickSelectColor;
         this.preHoverEntity.billboard.scale = 1.5;
       }
     },
     renderClikFeatures(marker) {
       if (!this.is3dMap) {
         this.clickGeomsLayer.getSource().clear()
         this.clickGeomsLayer.getSource().addFeature(marker);
         let featureExtent = marker ?
           marker.getGeometry().getExtent() :
           this.$store.getters.map
           .getView()
           .calculateExtent(this.$store.getters.map.getSize());
         marker.getGeometry() instanceof Point ?
           locationToExtentByFeatureType(
             this.$store.getters.map,
             featureExtent,
             false,
             13
           ) :
           locationToExtentByFeatureType(
             this.$store.getters.map,
             featureExtent,
             true
           );
         if (marker.getGeometry() instanceof Point) {
           let cords = marker.getGeometry().getCoordinates();
           console.log("cords: ", cords);
           this.$store.commit("set_sctterAnimationPoint", {
             coordinate: cords,
             color: "red"
           });
         }
         this.$store.commit("SET_HOVERED_FEATURE", {
           type: "overAllSearch",
           feature: marker
         });
       } else {
         if (this.preClickedEntity) {
           this.preClickedEntity.billboard.color = this.preClickColor;
         }
         this.preClickedEntity = window.Viewer.entities.getById(marker.uuid);
         this.preClickColor = this.preClickedEntity.billboard.color;
         this.preClickedEntity.billboard.color = this.clickSelectColor;
         this.preClickedEntity.billboard.scale = 1.5;
         let cords = transform([marker.geometry.x, marker.geometry.y], 'EPSG:3857', 'EPSG:4326')
         window.Viewer.camera.flyTo({
           destination: Cesium.Cartesian3.fromDegrees(cords[0], cords[1], 10000.0)
         })
       }
     },
     createFeatures(feature, mapServerName) {
       let marker, identifyIconFeatures = [];
       if (feature.geometryType == "esriGeometryPoint") {
         marker = new Feature({
           geometry: new Point([feature.geometry.x, feature.geometry.y])
         });
         marker.set("type", "pointicon"); //根据类型，渲染不同的图标
         marker.set("index", feature.id); //设置图标序号
         marker.set("mapServerName", mapServerName); //设置地图服务名称
         marker.set("property", feature);
         marker.set("evtFeature", marker);
         marker.set("center", [feature.geometry.x, feature.geometry.y])
         identifyIconFeatures.push(marker);
       } else if (feature.geometryType == "esriGeometryPolyline") {
         let center =
           feature.geometry.paths[0][
             Math.round(feature.geometry.paths[0].length / 2)
           ];
         marker = new Feature({
           geometry: new Point([center[0], center[1]])
         });
         marker.set("type", "linstringicon"); //根据类型，渲染不同的图标
         marker.set("index", feature.id); //设置图标序号
         marker.set("mapServerName", mapServerName); //设置地图服务名称
         marker.set("property", feature);
         marker.set("center", [center[0], center[1]])

         marker.set("evtFeature", new EsriJSON().readFeature(feature))
         identifyIconFeatures.push(marker);
         //绘制点
       } else if (feature.geometryType == "esriGeometryPolygon") {
         let centerPoint = getCentroidOfMultiPolygon(feature.geometry)
         console.log('centerPoint: ', centerPoint);
         marker = new Feature({
           geometry: new Point([centerPoint[0], centerPoint[1]])
         });
         marker.set("type", "polygonicon"); //根据类型，渲染不同的图标
         marker.set("index", feature.id); //设置图标序号
         marker.set("mapServerName", mapServerName); //设置地图服务名称
         marker.set("property", feature);
         marker.set("center", [centerPoint[0], centerPoint[1]])
         marker.set("evtFeature", new EsriJSON().readFeature(feature))
         identifyIconFeatures.push(marker);
       }
       this.overALLSearchIconLayer.getSource().addFeatures(identifyIconFeatures);
       return marker;
     },
     clearSelectFeatures() {
       //这是新知识，interaction对象；选择的时候会产生新的要素，这个要素属于interaction对象，用interaction.Select.getFeatures()获取，清除用clear方法
       if (this.clickInteraction instanceof Select) {
         this.clickInteraction.getFeatures().clear()
       }
     },
     //////////----三维相关方法
     //屏幕坐标转3857的坐标，ol坐标系下面
     screenToGeoCords(viewer, screenX, screenY) {
       let letfBottomP = screenToLonlatCoords(viewer, screenX - tolerance3dVal, screenY + tolerance3dVal).lonlat;
       let rightTopP = screenToLonlatCoords(viewer, screenX + tolerance3dVal, screenY - tolerance3dVal).lonlat;
       let leftBottom3857 = transform([letfBottomP[0], letfBottomP[1]], 'EPSG:4326', 'EPSG:3857');
       let rightTop3857 = transform([rightTopP[0], rightTopP[1]], 'EPSG:4326', 'EPSG:3857');
       console.log('letfBottom: ', letfBottomP, rightTopP, leftBottom3857, rightTop3857);
       return leftBottom3857.concat(rightTop3857).join(',');
     },

     //渲染三维地球查询出来的要素
     rederIdentity3dMap(featureInfo) {
       let entity,
         addedEntities = [];
       if (featureInfo.geometryType == "esriGeometryPoint") {
         let cords = transform([featureInfo.geometry.x, featureInfo.geometry.y], 'EPSG:3857', 'EPSG:4326'),
           //id为经纬度相加
           id = ((cords[0] + cords[1]) * 100000).toFixed(0)
         console.log('cords: ', cords);
         featureInfo.uuid = id;
         this.addBillBoard(id, window.Viewer, cords, img3, featureInfo.name, 12, 1.5)
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
     },
     /**
      * viewer
      * lonlat:[112,32]
      * imgSrc:"../../../../static/map/layertree/水库.png"
      * tetx:"asas"
      */
     addBillBoard(id, viewer, lonlat, imgSrc, text, fontsize, scale) {
       let imgEl = document.createElement("img");
       imgEl.src = imgSrc;
       imgEl.onload = () => {
         let entity = {
           id: id,
           position: Cesium.Cartesian3.fromDegrees(lonlat[0], lonlat[1]),
           billboard: {
             image: this.drawCanvas(imgEl, text, fontsize), // default: undefined
             show: true, // default
             // pixelOffset: new Cesium.Cartesian2(0, -50), // default: (0, 0)
             eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0), // default
             horizontalOrigin: Cesium.HorizontalOrigin.LEFT, // default
             verticalOrigin: Cesium.VerticalOrigin.CENTER, // default: CENTER
             scale: scale, // default: 1.0
             // color: Cesium.Color.BLUE, // default: WHITE
             // rotation: Cesium.Math.PI_OVER_FOUR, // default: 0.0
             alignedAxis: Cesium.Cartesian3.ZERO // default
             // width: 100, // default: undefined
             // height: 25 // default: undefined
           }
         }
         viewer.entities.add(entity);
       }
     },
     drawCanvas(imgEl, text, fontsize) {
       let canvas = document.createElement("canvas"), //创建canvas标签
         ctx = canvas.getContext("2d");
       ctx.fillStyle = "#99f";
       ctx.font = fontsize + "px Arial";
       canvas.width = ctx.measureText(text).width + fontsize * 2; //根据文字内容获取宽度
       canvas.height = fontsize * 2; // fontsize * 1.5
       ctx.drawImage(imgEl, fontsize / 2, fontsize / 2, fontsize * 1.5, fontsize * 1.5);
       ctx.fillStyle = "yellow";
       ctx.font = fontsize + "px Calibri,sans-serif";
       // ctx.shadowOffsetX = 1; //阴影往左边偏，横向位移量
       // ctx.shadowOffsetY = 0; //阴影往左边偏，纵向位移量
       // ctx.shadowColor = "#fff"; //阴影颜色
       // ctx.shadowBlur = 1; //阴影的模糊范围
       ctx.fillText(text, (fontsize * 7) / 4, (fontsize * 4) / 3);
       return canvas;
     }
   }
 }
