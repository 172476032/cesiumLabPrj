<template>
  <div class="scene-3d-map-wrap">
    <div id="sceneMap"></div>
    <Spin fix
          v-show="spinShow">
      <Icon type="ios-loading"
            size=18
            class="demo-spin-icon-load"></Icon>
      <div>数据加载中，请稍后......</div>
    </Spin>
  </div>
</template>

<script>
import Cesium from "cesium/Cesium";
import "cesium/Widgets/widgets.css";
import CesiumNavigation from "cesium-navigation-es6";

export default {
  name: "scenemap",
  data() {
    return {
      delayInitTime: 3000,
      options: {
        enableCompass: true,
        enableZoomControls: true,
        enableCompassOuterRing: true
      },
      spinShow: false,
      Viewer: null
    };
  },
  components: {},
  mounted() {
    this.initSceneMap();
  },
  computed: {
    originArea() {
      return this.$store.state.map.locationArea["full"]["saxc"];
    }
  },
  methods: {
    initSceneMap() {
      console.log("场景初始化");
      this.Viewer = new Cesium.Viewer("sceneMap", {
        baseLayerPicker: false,
        fullscreenButton: false,
        sceneModePicker: false,
        timeline: false,
        geocoder: false,
        homeButton: false,
        navigationHelpButton: false,
        animation: false,
        infoBox: true,
        requestRenderMode: true,
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
      //初始化视角动画
      this.initCamera(this.Viewer);
    },
    //动画效果
    initCamera(viewer) {
      console.log("我要飞起来");
      viewer.camera.setView({
        //目前为美国远视角
        destination: new Cesium.Cartesian3(
          -15667812.132413927,
          41105343.40350053,
          29594107.624624893
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0), // 方向
          pitch: Cesium.Math.toRadians(-90.0), // 倾斜角度
          roll: 0
        }
      });
      setTimeout(() => {
        this.addTerrain(viewer);
        this.addMouseEvent(viewer);
        //添加导航
        CesiumNavigation(viewer, this.options);
      }, 2000);
    },

    addMouseEvent(viewer) {
      // this.addPointMoveEvent( viewer);
      this.addLeftClickEvent(viewer);
    },

    //添加地形
    addTerrain(viewer) {
      var rectangle = new Cesium.Rectangle(
        Cesium.Math.toRadians(105.49749255180359),
        Cesium.Math.toRadians(29.768153429031372),
        Cesium.Math.toRadians(106.0345995426178),
        Cesium.Math.toRadians(30.4605495929718)
      );
      var terrainLayer = new Cesium.CesiumTerrainProvider({
        url: "/cesiumlab/terrain/潼南",
        requestWaterMask: false,
        credit: "http://www.bjxbsj.cn"
      });
      viewer.terrainProvider = terrainLayer;
      viewer.scene.camera.flyTo({ destination: rectangle });
    },
    //注册鼠标hover事件
    addPointMoveEvent(viewer) {
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(evt => {
        let pick = viewer.scene.pick(evt.endPosition);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },

    //注册鼠标点击事件
    addLeftClickEvent(viewer) {
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(evt => {
        let pick = viewer.scene.pick(evt.position);
        console.log("evt,pick", evt, pick);
        if (pick) {
        }
        setTimeout(() => {
          console.log("选择的尸体", viewer.selectedEntity);
        }, 2000);
        // this.identity(viewer, evt.position.x, evt.position.y);
        console.log("相机视角", viewer.scene.camera);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
  },
  destroyed() {}
};
</script>

<style lang="scss">
@import "../../assets/css/map";
.scene-3d-map-wrap {
  width: 100%;
  height: 100%;
  .ivu-spin-fix {
    background-color: rgba(255, 255, 255, 0.2);
  }
  //弹出框信息strat----------
  .bubble {
    text-align: center;
    position: absolute;
    padding: 15px;
    margin: 0;
    background: #fff;
    max-width: 330px;
    max-height: 200px;
  }

  .bubble float {
    right: 2%;
    top: 2%;
  }

  .bubble:after {
    content: "";
    position: absolute;
    bottom: -50px;
    left: 50px;
    border-width: 0 20px 50px 0px;
    border-style: solid;
    border-color: transparent #fff;
    display: block;
    width: 0;
  }

  .float {
    position: absolute;
    text-align: center;
    padding: 15px;
    margin: 0;
    background: #fff;
    max-width: 330px;
    max-height: 400px;
  }

  /////////end-------
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
}
.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.demo-spin-col {
  height: 100px;
  position: relative;
  border: 1px solid #eee;
}
</style>
