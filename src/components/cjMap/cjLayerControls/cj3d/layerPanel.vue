<template>
  <!-- <div> -->
  <!-- <Checkbox v-model="onlyVisible" style="margin: 9px 0 9px 20px;">
                                                                <span style="margin:10px;">只显示可见图层</span>
  </Checkbox>-->
  <!-- <span class="switchSpan" title="显示可见图层" @click.stop="switchLayers">
            <Icon type="eye" size="25" color="gray"></Icon>
        </span>
        <transition name="bounce" style="height:30px;margin-top:-5px;">
            <input class="searchInput" ref="searchInput" v-show="showInput" v-on:blur="changeFocus" type="text" placeholder="快速查找图层" v-model="searchtext" />
        </transition>
        <span class="searchSpan" title="快速查找图层" @click.stop="searchBtnClick">
            <Icon type="search" size="22" color="gray"></Icon>
  </span>-->
  <layer-tree :baseDataList="baseDataList"
              :root="true"
              :checkClick="checkClick"></layer-tree>
  <!-- </div> -->
</template>

<script>
import layerTree from "./layerTree.vue";
import _ from "lodash";
import Cesium from "cesium/Cesium";
let nodeSate = null;

export default {
  name: "layerPanel",
  components: {
    layerTree
  },
  data() {
    return {};
  },
  computed: {
    baseDataList() {
      return this.$store.state.map.tree3dConfigs;
    },
    map() {
      return this.$store.getters.map;
    },
    is3dMap() {
      return this.$store.state.map.is3dMap;
    },
    select3dTreeLayers() {
      return this.$store.state.map.select3dTreeLayers;
    }
  },
  mounted: function() {},
  methods: {
    checkClick(model, that) {
      console.log("--节点--", model);
      if (model.type == "MODEL") {
        //初始化添加模型
        this.setModelShow(model);
      }
      if (model.type == "terrain") {
        let terrainProvider;
        if (!model.visible) {
          //add a simple terain so no terrain shall be preseneted
          terrainProvider = new Cesium.EllipsoidTerrainProvider({});
        } else {
          //enable the terain
          terrainProvider = Cesium.createWorldTerrain();
        }
        window.Viewer.scene.terrainProvider = terrainProvider;
      } else if (model.type == "WMS" || model.type == "WMTS") {
        this.setImageryLayerShow(model);
        //确定哪些图层被打开了
        if (model.queryConfig) {
          console.log("用于identify的图层为", model.queryConfig);
          if (model.visible) {
            this.select3dTreeLayers.push(model.queryConfig);
          } else {
            _.remove(this.select3dTreeLayers, v => {
              return v.name == model.queryConfig.name;
            });
          }
        }
        console.log("图层管理器选择的图层对象列表：", this.select3dTreeLayers);
      }
    },
    //设置三维图层的显示隐藏
    setImageryLayerShow(model) {
      if (model.imageryLayerIndex) {
        let imageryLayer = window.Viewer.imageryLayers.get(
          model.imageryLayerIndex
        );
        imageryLayer.show = model.visible;
      } else {
        console.log(
          "this.$store.state.map.imageryLayerIndex: ",
          this.$store.state.map.imageryLayerIndex
        );
        this.$store.state.map.imageryLayerIndex++;
        model.imageryLayerIndex = this.$store.state.map.imageryLayerIndex;
        let layer = this.createImageryLayer(
          model.imageryLayerIndex,
          model.layerUrl,
          model.layerName,
          model.visible,
          model.type,
          model.geoType,
          model.wmsLayerNames
        );
        window.Viewer.imageryLayers.add(layer);
      }
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
              url: pUrl
            },
            index
          ),
          { show: visible }
        );
      }
      // console.log("图层树加载的layer: ", layer);
      return imageryLayer;
    },
    setModelShow(model) {
      if (model.modelIndex) {
        if (model.visible == true) {
          let tileset = window.Viewer.scene.primitives.get(model.modelIndex);
          tileset.show = true;
          window.Viewer.zoomTo(
            tileset,
            new Cesium.HeadingPitchRange(
              0.0,
              -0.5,
              tileset.boundingSphere.radius * 2.0
            )
          );
        } else if (model.visible == false) {
          window.Viewer.scene.primitives.get(model.modelIndex).show = false;
        }
      } else {
        console.log(
          "this.$store.state.map.modelIndex: ",
          this.$store.state.map.modelIndex
        );
        model.modelIndex = this.$store.state.map.modelIndex;
        this.add3dModels(
          model.layerUrl,
          model.longitude,
          model.latitude,
          model.height,
          model.heading,
          window.Viewer
        );
        this.$store.state.map.modelIndex++;
      }
    },
    //添加模型信息
    add3dModels(url, longitude, latitude, height, heading, viewer) {
      var longitude = longitude;
      var latitude = latitude;
      var height = height;
      var heading = heading;
      var tileset = new Cesium.Cesium3DTileset({
        url: url, // "http://localhost:9002/api/folder/13c8f9f9d5404707ad917bc63c1aa8b5/tileset.json"
        skipLevelOfDetail: true,
        baseScreenSpaceError: 1024,
        skipScreenSpaceErrorFactor: 16,
        skipLevels: 1,
        immediatelyLoadDesiredLevelOfDetail: false,
        loadSiblings: false,
        cullWithChildrenBounds: true
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
          // viewer.camera.flyTo({
          //   destination: Cesium.Cartesian3.fromDegrees(
          //     longitude,
          //     latitude,
          //     height + 1000
          //   )
          // });
          window.Viewer.zoomTo(
            tileset,
            new Cesium.HeadingPitchRange(
              0.0,
              -0.5,
              tileset.boundingSphere.radius * 2.0
            )
          );
        })
        .otherwise(error => {
          console.log("加载3dmodel失败", error);
        });
    }
  }
};
</script>

<style lang="scss">
.switchSpan {
  margin: 12px 0 12px 20px;
}

.switchSpan i {
  margin: 6px;
}

.searchInput {
  width: 200px; // height: 30px;
  line-height: 16px;
  padding: 5px;
  box-sizing: border-box;
  border: 1px solid #eee;
  background-color: #fcfcfc;
  outline: 0;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% {
    width: 0px;
  }
  100% {
    width: 200px;
  }
}
</style>
