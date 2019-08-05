<template>
  <div class="scene-3d-map-wrap">
    <Button @click="showhide">切换</Button>
    <div id="sceneMap"></div>
  </div>
</template>

<script>
import Cesium from "cesium/Cesium";
import "cesium/Widgets/widgets.css";

import bus from "@/script/bus.js";
import axios from "axios";
//投影
import { transform } from "ol/proj";
import treeLayers from "../configs/tree3dLayers";
// import flooding from "@/components/cjMap/floodingDeduction/flooding3d/flooding.js";
import sky_mx from "../../../assets/cesium_theme/skyBox/sky_mx.jpg";
import sky_my from "../../../assets/cesium_theme/skyBox/sky_my.jpg";
import sky_mz from "../../../assets/cesium_theme/skyBox/sky_mz.jpg";
import sky_py from "../../../assets/cesium_theme/skyBox/sky_py.jpg";
import sky_px from "../../../assets/cesium_theme/skyBox/sky_px.jpg";
import sky_pz from "../../../assets/cesium_theme/skyBox/sky_pz.jpg";
const img = "/static/map/pointicon.png",
  delayInitTime = 3000,
  options = {
    enableCompass: false,
    enableZoomControls: false,
    enableCompassOuterRing: false
  };

var Viewer, layer;

export default {
  name: "scenemap",
  data() {
    return {};
  },
  mounted() {
    this.initSceneMap();
  },
  computed: {},
  methods: {
    showhide() {
      if (layer instanceof Cesium.CustomDataSource) {
        Object.freeze(layer);

        console.log("切换图层", layer);
        layer.show = !layer.show;
        Viewer.zoomTo(layer);
      } else {
        this.createDataSourceLayer(
          layerq => {
            console.log("实体添加完成", new Date());
            Viewer.dataSources.add(layerq);
            layer = layerq;
            Viewer.zoomTo(layerq);
            Object.freeze(layer);
            window.layer = layerq;
          },
          Viewer,
          "/map229/rest/services/泵站3/MapServer/0/query?where=1=1&outFields=*&f=pjson",
          "../../../../static/map/layertree/水库.png",
          true
        );
      }
    }, // 添加数据资源图层，该资源图层是以entityCollection进行管理的,所有该资源图层下面的entity具有统一的id，方便切换显示隐藏的管理start
    createDataSourceLayer(callback, viewer, url, imgSrc, visible) {
      // 1、创建datasource，并把datasource通过view.dataSources.add(datasource)添加到view,通过设置设置show属性来控制隐藏或消失
      let dataSource = new Cesium.CustomDataSource();
      // 2、创建entityCollection集合，也可通过entityCollection的show属性来控制显示隐藏
      // entityCollection = new Cesium.EntityCollection(dataSource);
      dataSource.show = visible;
      // 3、向entityCollection集合内添加entity
      axios.get(url).then(data => {
        console.log("数据请求完成", new Date(), data);
        if (data.data && data.data.features && data.data.features.length > 0) {
          let imgEl = document.createElement("img");
          imgEl.onload = () => {
            data.data.features.forEach(v => {
              let lonlat = transform(
                [v.geometry.x, v.geometry.y],
                "EPSG:3857",
                "EPSG:4326"
              );
              dataSource.entities.add(
                this.addBillBoard(lonlat, imgEl, v.attributes.MC, 12, 1)
              );
            });
            callback(dataSource);
          };
          imgEl.src = imgSrc;
        } else {
          this.$Message("无图层数据");
        }
      });
    },
    /**
     * viewer
     * lonlat:[112,32]
     * imgSrc:"../../../../static/map/layertree/水库.png"
     * tetx:"asas"
     */
    addBillBoard(lonlat, imgEl, text, fontsize, scale) {
      return {
        position: Cesium.Cartesian3.fromDegrees(lonlat[0], lonlat[1]),
        billboard: {
          image: this.drawCanvas(imgEl, text, fontsize), // default: undefined
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
      };
    },
    drawCanvas(imgEl, text, fontsize) {
      let canvas = document.createElement("canvas"), //创建canvas标签
        ctx = canvas.getContext("2d");
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
    },
    initSceneMap() {
      console.log("场景初始化");
      let viewer = new Cesium.Viewer("sceneMap", {
        baseLayerPicker: false,
        fullscreenButton: false,
        sceneModePicker: false,
        timeline: false,
        geocoder: false,
        homeButton: false,
        navigationHelpButton: false,
        animation: false,
        infoBox: false,
        requestRenderMode: true,
        skyBox: new Cesium.SkyBox({
          sources: {
            positiveX: sky_px,
            negativeX: sky_mx,
            positiveY: sky_py,
            negativeY: sky_my,
            positiveZ: sky_pz,
            negativeZ: sky_mz
          }
        }),
        // skyAtmosphere: new Cesium.SkyAtmosphere(),
        imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
          url:
            "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=b97312f85a240009c717a8480b6d54d2",
          layer: "tdtBasicLayer",
          style: "default",
          format: "image/jpeg",
          tileMatrixSetID: "GoogleMapsCompatible",
          show: false
        })
      });
      Viewer = viewer;
    }
  },
  destroyed() {}
};
</script>

<style lang="scss">
.scene-3d-map-wrap {
  width: 100%;
  height: 100%;
  #sceneMap {
    width: 100%;
    height: 100%;
    .cesium-credit-logoContainer {
      display: none !important;
    }
    .cesium-credit-textContainer {
      display: none !important;
    }
    .cesium-credit-expand-link {
      display: none !important;
    }
  }
  #distanceLegendDiv {
    position: absolute;
    right: 180px;
  }
  .cesium-infoBox {
    top: 80px !important;
  }
  .btngroup {
    position: absolute;
    top: 50px;
    left: 50px;
  }
  .flood-dropdown {
    position: absolute;
    right: 18%;
    top: 40px;
  }
}
</style>
