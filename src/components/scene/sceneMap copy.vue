<template>
  <div class="scene-3d-map-wrap">
    <div id="sceneMap"></div>
    <div id="bubble"
         class="bubble"
         style="bottom:0;left:82%;display:none;width: 400px">
      <div id="tools"
           style="text-align : right">
        <span style="color: rgb(95, 74, 121);padding: 5px;position: absolute;left: 10px;top: 4px;">对象属性</span>
        <span class="iconfont icon-d_wchulai"
              id="bubblePosition"
              style="color: darkgrey; padding:5px"
              title="停靠"></span>
        <span class="iconfont icon-guanbi"
              title="关闭"
              id="close"
              style="color: darkgrey;padding:5px"></span>
      </div>
      <div style="overflow-y:scroll;height:130px"
           id="tableContainer">
        <table id="tab"></table>
      </div>
    </div>
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
import $ from "jquery";

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
      infoWindowPosition: null,
      dock: false,
      table: null,
      Viewer: null,
      tiltTileset: null,
      preSelectedFeature: null, //上次选择的3dtileFeature
      curSelectedFeature: null, //当前选择的3dtileFeature
      oldpreSelectedFeatureColor: null,
      tileset1: "https://res.cesiumlab.com/demo/dayanta/tt/tileset.json",
      tileset2: "/cesiumlab/大雁塔_3dtiles/tileset.json",
      tileset3: "/cesiumlab/夏家_3dtiles/tileset.json",
      classify1: "https://res.cesiumlab.com/demo/dayanta/tv/tileset.json",
      classify2: "/cesiumlab/大雁塔_矢量面拉伸/tileset.json",
      classify3: "/cesiumlab/夏家_矢量面拉伸new/tileset.json",
      saxc3dTilesUrl: "/cesiumlab/SAXC单体化结果数据/3DTILES/tileset.json", //水岸星城倾斜
      classifies: [
        "/cesiumlab/SAXC单体化结果数据/矢量面3dtiles/saxc_c/tileset.json", //水岸星城商业楼
        "/cesiumlab/SAXC单体化结果数据/矢量面3dtiles/saxc_DHT/tileset.json", //水岸星城别墅楼
        "/cesiumlab/SAXC单体化结果数据/矢量面3dtiles/saxc_G/tileset.json" //水岸星城高层楼
      ]
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
    add3DtilesDyt(viewer) {
      //添加倾斜模型
      this.tiltTileset = new Cesium.Cesium3DTileset({
        url: this.saxc3dTilesUrl
      });
      console.log("tiltTileset: ", this.tiltTileset);
      this.tiltTileset.readyPromise.then(tiltTileset => {
        this.addMouseEvent(Cesium, this.Viewer);
        //添加导航
        CesiumNavigation(this.Viewer, this.options);
        //初始化弹框
        this.initInfowindow(Cesium, this.Viewer);
        viewer.scene.primitives.add(tiltTileset);
        this.spinShow = false;
        this.Viewer.flyTo(tiltTileset);
      });
      //添加矢量面分类图层
      this.classifies.forEach(v => {
        console.log("v: ", v);
        let classificationTileset = new Cesium.Cesium3DTileset({
          url: v
          // classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
        });
        classificationTileset.style = new Cesium.Cesium3DTileStyle({
          color: "rgba(255,255,255,0.001)"
        });
        viewer.scene.primitives.add(classificationTileset);
      });
    },

    addMouseEvent(cesium, viewer) {
      // this.addPointMoveEvent(cesium, viewer);
      this.addLeftClickEvent(Cesium, viewer);
    },
    //弹出框相关初始化
    initInfowindow(Cesium, viewer) {
      /* 气泡相关 1/4 start */
      var infoboxContainer = document.getElementById("bubble");
      this.table = document.getElementById("tab"); // 气泡内的表格
      $("#bubblePosition").click(() => {
        // 停靠状态切换
        this.dock = !this.dock;
        if ($("#bubblePosition").hasClass("icon-d_wchulai")) {
          viewer.customInfobox = undefined;
          $("#bubble")
            .removeClass("bubble")
            .addClass("float");
          $("#bubblePosition")
            .removeClass("icon-d_wchulai")
            .addClass("icon-xinxikuang");
          $("#bubblePosition")[0].title = "悬浮";
          $("#bubble").css({ left: "78%", bottom: "45%" });
          $("#tableContainer").css({ height: "350px" });
        } else if ($("#bubblePosition").hasClass("icon-xinxikuang")) {
          $("#bubble")
            .removeClass("float")
            .addClass("bubble");
          $("#bubblePosition")
            .removeClass("icon-xinxikuang")
            .addClass("icon-d_wchulai");
          $("#bubblePosition")[0].title = "停靠";
          $("#tableContainer").css({ height: "150px" });
          viewer.customInfobox = infoboxContainer;
          //解决不重新刷新view导致弹出框不能正确定位的bug，向前设置0.05m，重新刷新
          viewer.camera.zoomIn(0.05);
        }
      });
      $("#close").click(() => {
        // 关闭气泡
        $("#bubble").hide();
      });
      viewer.scene.postRender.addEventListener(() => {
        // 每一帧都去计算气泡的正确位置
        if (this.infoWindowPosition && !this.dock) {
          var canvasHeight = viewer.scene.canvas.height;
          var windowPosition = new Cesium.Cartesian2();
          Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            viewer.scene,
            this.infoWindowPosition,
            windowPosition
          );
          infoboxContainer.style.bottom =
            canvasHeight - windowPosition.y + 45 + "px";
          infoboxContainer.style.left = windowPosition.x - 70 + "px";
          infoboxContainer.style.visibility = "visible";
        }
      });
      /* 气泡相关 1/4 end */
    },
    //-----------添加基础图层------------------------------------》》》
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
        this.spinShow = true;
        this.add3DtilesDyt(viewer);
      }, 2000);
    },
    //注册鼠标hover事件
    addPointMoveEvent(Cesium, viewer) {
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(evt => {
        let pick = viewer.scene.pick(evt.endPosition);
        console.log("evt,pick", evt, pick);
        if (pick) {
          if (pick instanceof Cesium.Cesium3DTileFeature) {
            this.hightLightAndGetProps(pick);
          }
        }
        setTimeout(() => {
          console.log("hover的尸体", viewer.selectedEntity);
        }, 2000);
        // this.identity(viewer, evt.position.x, evt.position.y);
        console.log("相机视角", viewer.scene.camera);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    //注册鼠标点击事件
    addLeftClickEvent(Cesium, viewer) {
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(evt => {
        let pick = viewer.scene.pick(evt.position);
        console.log("evt,pick", evt, pick);
        if (pick) {
          if (pick instanceof Cesium.Cesium3DTileFeature) {
            this.hightLightAndGetProps(pick);
            // 弹出框 start
            let position = viewer.scene.pickPosition(evt.position);
            if (!position) {
              position = Cesium.Cartesian3.fromDegrees(0, 0, 0);
            }
            this.infoWindowPosition = position;
            /* 气泡相关 4/4 start */
            $("#bubble").show();
            for (let i = this.table.rows.length - 1; i > -1; i--) {
              this.table.deleteRow(i);
            }
            let propertyNames = pick.getPropertyNames();
            let length = propertyNames.length;
            for (let i = 0; i < length; ++i) {
              let propertyName = propertyNames[i];
              var newRow = this.table.insertRow();
              var cell1 = newRow.insertCell();
              var cell2 = newRow.insertCell();
              cell1.innerHTML = propertyName;
              cell2.innerHTML = pick.getProperty(propertyName);
              console.log(propertyName + ": " + pick.getProperty(propertyName));
            }
            /* 气泡相关 4/4 end */
            // 气泡相关end
          } else {
            /* 气泡相关 3/4 start */
            this.infoWindowPosition = null;
            $("#bubble").hide();
            /* 气泡相关 3/4 end */
          }
        }
        setTimeout(() => {
          console.log("选择的尸体", viewer.selectedEntity);
        }, 2000);
        // this.identity(viewer, evt.position.x, evt.position.y);
        console.log("相机视角", viewer.scene.camera);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    hightLightAndGetProps(tileFeature) {
      if (this.preSelectedFeature instanceof Cesium.Cesium3DTileFeature) {
        this.preSelectedFeature.color = this.oldpreSelectedFeatureColor;
      }
      this.preSelectedFeature = tileFeature;
      this.oldpreSelectedFeatureColor = tileFeature.color;
      //设置颜色
      tileFeature.color = Cesium.Color.fromAlpha(Cesium.Color.LAWNGREEN, 0.3);
      this.getPropsOf3DTileFeature(tileFeature);
    },
    //获取cesium3dtilefeature的属性
    getPropsOf3DTileFeature(tileFeature) {
      let propertyNames = tileFeature.getPropertyNames();
      let length = propertyNames.length;
      for (let i = 0; i < length; ++i) {
        let propertyName = propertyNames[i];
        console.log(
          propertyName + ": " + tileFeature.getProperty(propertyName)
        );
      }
    },
    //单独添加盒子模型
    addSigleBox(viewer) {
      var longitude = 108.95941535541446;
      var latitude = 34.219852188348206;
      var height = 399.999999999142;
      var heading = 0;
      var tileset = new Cesium.Cesium3DTileset({
        url: "/cesiumlab/大雁塔_矢量面拉伸/tileset.json"
      });
      viewer.scene.primitives.add(tileset);
      tileset.readyPromise.then(argument => {
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
      });
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
