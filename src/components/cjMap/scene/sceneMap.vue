<template>
  <div class="scene-3d-map-wrap">
    <div id="sceneMap"></div>
    <!-- 洪水推演 -->
    <Dropdown class="flood-dropdown" @on-click="toggle">
      <Button type="primary">
        洪水推演
        <Icon type="ios-arrow-down"></Icon>
      </Button>
      <DropdownMenu slot="list">
        <DropdownItem name="openFloodPanel">推演</DropdownItem>
        <DropdownItem name="closeFloodPanel">关闭</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <flooding3d-deduction
      v-if="floodShow"
      @beginFlooding="beginFlooding"
      @pauseFlooding="pauseFlooding"
      @replayFlooding="replayFlooding"
    ></flooding3d-deduction>
  </div>
</template>

<script>
import flooding3dDeduction from "@/components/cjMap/floodingDeduction/flooding3d/index.vue";
import CesiumNavigation from "cesium-navigation-es6";
import {
  screenToLonlatCoords,
  getSelectedEntityProps
} from "@/script/mapUtils/myMaputils/myUtils.js";
import bus from "@/script/bus.js";
import axios from "axios";
//投影
import { transform } from "ol/proj";
import treeLayers from "../configs/tree3dLayers";
import flooding from "@/components/cjMap/floodingDeduction/flooding3d/flooding.js";
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

export default {
  name: "scenemap",
  data() {
    return {
      floodShow: false
    };
  },
  mixins: [flooding],
  components: { flooding3dDeduction },
  mounted() {
    bus.$on("initSceneMap", this.initSceneMap);
  },
  computed: {
    is3dMap() {
      return this.$store.state.map.is3dMap;
    },
    modelIndex() {
      return this.$store.state.map.modelIndex;
    },
    imageryLayerIndex() {
      return this.$store.state.map.imageryLayerIndex;
    },
    originArea() {
      return this.$store.state.map.locationArea["长江流域"]["three"];
    }
  },
  methods: {
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
        }) // 天地图影像
        // terrainProvider: Cesium.createWorldTerrain() //建议不要加载全球地形
      });
      window.Viewer = viewer;
      // 初始化视角动画
      this.initCamera(viewer);
    },
    //-----------添加基础图层------------------------------------》》》
    // 动画效果
    initCamera(viewer) {
      console.log("我要飞起来");
      viewer.camera.setView({
        // 目前为美国远视角
        destination: new Cesium.Cartesian3(
          -900242.9156382445, // -5840604.099510539,
          -45156014.56458725, // 24138490.672504395,
          27765567.735514186 //14100606.544939995
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0), // 方向
          pitch: Cesium.Math.toRadians(-90.0), // 倾斜角度
          roll: 0
        }
      });
      setTimeout(() => {
        this.initLayers(window.Viewer, treeLayers);
        this.addLeftClickEvent(Cesium, window.Viewer); // 初始化图层
        this.addTerrain(viewer);
        // this.addBillBoardLayer(viewer)
        // 添加导航
        CesiumNavigation(window.Viewer, options);
        //控件初始化
        bus.$emit("inintMap3dZoom");
        bus.$emit("initMap3dRotate");
        bus.$emit("initMap3dLocInfo");
        //注册clock事件
        // this.onClockTick(window.Viewer);
        this.aboveTerrain(window.Viewer);
      }, delayInitTime);
    },
    onClockTick(viewer) {
      viewer.clock.onTick.addEventListener(() => {
        console.log("ontick选中的实体", viewer.selectedEntity);
      });
    },
    /**
     * 添加地形
     * @viewer viewer
     */
    addTerrain(viewer) {
      let rectangle = new Cesium.Rectangle(
        Cesium.Math.toRadians(111.5623),
        Cesium.Math.toRadians(29.005194),
        Cesium.Math.toRadians(114.01826),
        Cesium.Math.toRadians(30.458328)
      );

      let terrainLayer = new Cesium.CesiumTerrainProvider({
        url: "/models/cesiumlab/terrain/sxjj/demmasioc"
      });
      terrainLayer.readyPromise.then(v => {
        viewer.terrainProvider = terrainLayer;
        viewer.scene.camera.flyTo({ destination: rectangle });
      });
    },
    initLayers(viewer, treeLayers) {
      this.addLayers(viewer, treeLayers);
      console.log(
        "三维图层初始化显示的图层列表",
        this.$store.state.map.select3dTreeLayers
      );
      console.log("增加modelindex和layerindex后的图层列表: ", treeLayers);
      this.$store.state.map.tree3dConfigs = treeLayers;
    },
    addLayers(viewer, treeLayers) {
      treeLayers.forEach(v => {
        //无子目录，且含有type为WMTS、WMS、MODEL类型的进行新建图层
        if (v.type == "MODEL" && v.visible) {
          //初始化添加模型
          this.add3dModels(
            v.layerUrl,
            v.longitude,
            v.latitude,
            v.height,
            v.heading,
            viewer
          );
          this.$store.state.map.modelIndex++;
          v.modelIndex = this.$store.state.map.modelIndex;
        } else if (v.visible && (v.type == "WMS" || v.type == "WMTS")) {
          let imageryLayer = this.createImageryLayer(
            v.layerIndex,
            v.layerUrl,
            v.layerName,
            v.visible,
            v.type,
            v.geoType,
            v.wmsLayerNames
          );
          this.$store.state.map.imageryLayerIndex++;
          v.imageryLayerIndex = this.$store.state.map.imageryLayerIndex;
          viewer.imageryLayers.add(imageryLayer);
          //初始化点击查询列表，如果为可见，则可查
          if (v.queryConfig) {
            this.$store.state.map.select3dTreeLayers.push(v.queryConfig);
          }
        }
        //有子目录，再次调用
        if (v.children) {
          this.addLayers(viewer, v.children);
        }
      });
    },

    //创建WMS、WMTS图层
    createImageryLayer(
      index,
      url,
      name,
      visible,
      type,
      geoType,
      wmsLayerNames
    ) {
      let imageryLayer;
      if (type == "WMS") {
        imageryLayer = new Cesium.ImageryLayer(
          new Cesium.WebMapServiceImageryProvider(
            {
              url: url,
              layers: wmsLayerNames,
              parameters: {
                FORMAT: "image/png",
                VERSION: "1.1.1",
                tiled: true,
                SRS: "EPSG:4326",
                STYLES: "",
                TRANSPARENT: true
              }
            },
            index
          ),
          { show: visible }
        );
      } else if (type == "WMTS") {
        let pUrl = url.substr(0, url.indexOf("/MapServer/") + 10);
        console.log("url: ", pUrl);
        imageryLayer = new Cesium.ImageryLayer(
          new Cesium.ArcGisMapServerImageryProvider(
            {
              url: pUrl,
              rectangle: Cesium.Rectangle.fromDegrees(
                112.17,
                28.95,
                113.26,
                29.9
              )
            },
            index
          ),
          { show: visible }
        );
      }
      // console.log("图层树加载的layer: ", layer);
      return imageryLayer;
    },
    //测试
    createImageryLayer1(viewer) {
      var imageryLayers = viewer.imageryLayers;
      //1：测试arcgis的接口，直接拿瓦片，长江委的服务器存在跨域，需要解决跨域，178服务器不存在，可以加载
      let layer = new Cesium.ArcGisMapServerImageryProvider({
        url:
          "http://10.6.172.178:6080/arcgis/rest/services/cjcenter/长江流域水文站3857new/MapServer"
      });
      //2：wmts服务测试，不存在跨域，可以加载
      // let layer = new Cesium.WebMapTileServiceImageryProvider({
      //   url:
      //     "http://10.6.96.116:6080/arcgis/rest/services/WATER/RES_V/MapServer/WMTS",
      //   layer: "WATER_RES_V",
      //   style: "default",
      //   format: "image/png",
      //   tileMatrixSetID: "default028mm",
      //   // tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
      //   maximumLevel: 19
      // });
      //3：wms服务测试
      // let layer = new Cesium.WebMapServiceImageryProvider({
      //   url: "/cjwmap116/services/ZT_V/MapServer/WmsServer",
      //   layers: "0",
      //   parameters: {
      //     FORMAT: "image/png",
      //     VERSION: "1.1.1",
      //     tiled: true,
      //     SRS: "EPSG:4326",
      //     STYLES: "",
      //     TRANSPARENT: true
      //   }
      // });

      imageryLayers.addImageryProvider(layer);
    },
    //-----------初始化添加模型
    //    var longitude = 102.6373;
    // var latitude = 26.3153;
    // var height = 200;
    // var heading = 0;
    // var tileset = new Cesium.Cesium3DTileset({
    //     url: 'http://localhost:9002/api/folder/13c8f9f9d5404707ad917bc63c1aa8b5/tileset.json'
    // });
    // viewer.scene.primitives.add(tileset);
    // tileset.readyPromise.then(function(argument) {
    //     var position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
    //     var mat = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    //     var rotationX = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(heading)));
    //     Cesium.Matrix4.multiply(mat, rotationX, mat);
    //     tileset._root.transform = mat;
    //     viewer.camera.flyTo({destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height + 1000)});
    // });
    //添加模型信息
    add3dModels(url, longitude, latitude, height, heading, viewer) {
      var longitude = longitude;
      var latitude = latitude;
      var height = height;
      var heading = heading;
      var tileset = new Cesium.Cesium3DTileset({
        url: url // "http://localhost:9002/api/folder/13c8f9f9d5404707ad917bc63c1aa8b5/tileset.json"
      });
      viewer.scene.primitives.add(tileset);
      tileset.readyPromise
        .then(function(argument) {
          var position = Cesium.Cartesian3.fromDegrees(
            longitude,
            latitude,
            height
          );
          var mat = Cesium.Transforms.eastNorthUpToFixedFrame(position);
          var rotationX = Cesium.Matrix4.fromRotationTranslation(
            Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(heading))
          );
          Cesium.Matrix4.multiply(mat, rotationX, mat);
          tileset._root.transform = mat;
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height + 1000
            )
          });
        })
        .otherwise(error => {
          console.log("加载3dmodel失败", error);
        });
    },

    //注册鼠标点击事件
    addLeftClickEvent(Cesium, viewer) {
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(evt => {
        console.log("evt,pick", evt, pick);
        let pick = viewer.scene.pick(evt.position);
        if (pick && pick.id) {
          if (pick instanceof Cesium.Cesium3DTileFeature) {
            //3dtile feature获取方式
          } else if (pick.id) {
          }
        }
        setTimeout(() => {
          console.log("选择的尸体", viewer.selectedEntity);
        }, 5000);
        // this.identity(viewer, evt.position.x, evt.position.y);
        console.log("相机视角", viewer.scene.camera);

        //实体属性对象获取并弹出信息框
        // this.getSelectedEntityProps(viewer);
        getSelectedEntityProps(props => {
          console.log("props: ", props);
          bus.$emit("on-search-list-click-show-modal", {
            mapServerName: "",
            featureName: viewer.selectedEntity.id,
            attributes: props
          });
        }, viewer);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    getSelectedEntityProps(viewer) {
      if (viewer.selectedEntity instanceof Cesium.Entity) {
        console.log("选中的实体", viewer.selectedEntity);
        let interval = setInterval(() => {
          console.log("我在loading实体属性", viewer.selectedEntity);
          if (viewer.selectedEntity.id != "Loading...") {
            window.clearInterval(interval);
            if (viewer.selectedEntity.id != "None") {
              let props = this.praseTableString(
                viewer.selectedEntity.description.getValue()
              );
              bus.$emit("on-search-list-click-show-modal", {
                mapServerName: "图层对象",
                featureName: viewer.selectedEntity.id,
                attributes: props
              });
            }
          }
        }, 1000);
      }
    },
    praseTableString(tablestring) {
      let div = document.createElement("div");
      div.innerHTML = tablestring;
      console.log("div: ", div);
      let trs = div.getElementsByTagName("table")[0].children[0].childNodes,
        props = {};
      trs.forEach(tr => {
        let key, value;
        tr.childNodes.forEach((td, i) => {
          console.log("tdname", td, td.innerText);
          if (i == 0) {
            key = td.innerText;
          } else {
            value = td.innerText;
          }
        });
        props[key] = value;
      });
      console.log("实体解析后的属性对象", props);
      return props;
    },
    //《《《《------添加广告牌图层--------------------------------------------
    addBillBoardLayer(viewer) {
      axios
        .get(
          "/map229/rest/services/泵站3/MapServer/0/query?where=1=1&outFields=*&f=pjson"
        )
        .then(data => {
          console.log("data: ", data);
          data.data.features.forEach(v => {
            let lonlat = transform(
              [v.geometry.x, v.geometry.y],
              "EPSG:3857",
              "EPSG:4326"
            );
            console.log("lonlat: ", lonlat);
            this.addBillBoard(viewer, lonlat, img, v.attributes.MC, 12, 1);
          });
        });
    },
    /**
     * viewer
     * lonlat:[112,32]
     * imgSrc:"../../../../static/map/layertree/水库.png"
     * tetx:"asas"
     */
    addBillBoard(viewer, lonlat, imgSrc, text, fontsize, scale) {
      let imgEl = document.createElement("img");
      imgEl.onload = () => {
        viewer.entities.add({
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
        });
      };
      imgEl.src = imgSrc;
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
    //------添加广告牌图层--------------------------------------------》》》》
    improve(viewer) {
      // //高清瓦片设置
      viewer.scene.fxaa = false;
      viewer.scene.globe.maximumScreenSpaceError = 4 / 3;
      let layer0 = viewer.scene.imageryLayers.get(0);
      layer0.gamma = 0.66;
      layer0.minificationFilter = Cesium.TextureMinificationFilter.NEAREST;
      layer0.magnificationFilter = Cesium.TextureMagnificationFilter.NEAREST;
    },
    //相近避免进入地下
    aboveTerrain(viewer) {
      viewer.clock.onTick.addEventListener(function() {
        if (viewer.camera.pitch > 0) {
          viewer.scene.screenSpaceCameraController.enableTilt = false;
        }
      });
      var mousePosition, startMousePosition;
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      handler.setInputAction(function(movement) {
        mousePosition = startMousePosition = Cesium.Cartesian3.clone(
          movement.position
        );
        handler.setInputAction(function(movement) {
          mousePosition = movement.endPosition;
          var y = mousePosition.y - startMousePosition.y;
          if (y > 0) {
            viewer.scene.screenSpaceCameraController.enableTilt = true;
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
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
