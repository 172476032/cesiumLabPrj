<!-- 底图 -->
<template>
  <cj-collapse title="底图"
               icon="ios-map"
               dropCardPosition="right">
    <div class="base-map-layers">
      <div class="basemap"
           v-for="(item, key) in basemapList"
           :key="key"
           @click="toggleBasemap(item)">
        <div class="basemap-img"
             :style="backPos(key)"></div>
        <div class="basemap-foot">{{item.layer_name}}</div>
      </div>
    </div>
  </cj-collapse>
</template>

<script>
import cjCollapse from "@/components/cjMap/cjCommons/cj3dCollapse.vue";
import create3dBaseLayer from "../mixins/create3dBaseLayer";
const base3dLayers = require("../configs/base3dLayers.json");

export default {
  name: "baselayers",
  data() {
    return {
      basemapList: base3dLayers
    };
  },
  mixins: [create3dBaseLayer],
  components: { cjCollapse },

  computed: {
    style() {
      var style = {};
      var length = this.basemapList.length;
      var width = length < 3 ? length * 115 + 15 : 3 * 115 + 15;
      style.width = width + "px";
      style.padding = "5px 0px 5px 5px";
      style.right = "0px";
      return style;
    },
    map() {
      return this.$store.getters.map;
    },
    is3dMap() {
      return this.$store.state.map.is3dMap;
    }
  },
  methods: {
    toggleBasemap(item) {
      console.log("切换的图层对象: ", item);
      //三维地图默认是索引为0的图层，切换时需要移除后再增加进去
      let layer,
        url = item.layer_url,
        layername = item.real_name;
      if (item.type == "tdt") {
        layer = this.createTdtBaseLayer(url, layername);
      } else if (item.type == "google") {
        layer = this.createGoogleBaseLayer(url);
      } else if (item.type == "arcgis-wmts") {
        layer = this.createArcGisWmtsLayer(url);
      }
      //初始化配置为天地图的服务，index为0的服务；
      if (window.Viewer.imageryLayers.get(0) instanceof Cesium.ImageryLayer) {
        window.Viewer.imageryLayers.remove(window.Viewer.imageryLayers.get(0));
        window.Viewer.imageryLayers.addImageryProvider(layer, 0);
      }
    },
    backPos(i) {
      let h = 70,
        w = 100;
      return {
        backgroundPosition: `-${w * (i % 3)}px -${h * parseInt(i / 3)}px`
      };
    }
  },

  mounted() {},

  destroyed: {}
};
</script>
<style lang='scss'  >
.base-map-layers {
  width: 350px;
  padding: 5px 0px 5px 5px;
  .basemapactive {
    display: none !important;
  }
  .basemap {
    display: inline-block;
    height: 110px;
    width: 110px;
    margin-right: 5px;
    border: 1px solid #ccc;
    cursor: pointer;
    position: relative;

    &:hover {
      color: #cb9642;
      border: 1px solid #cb9642;
    }

    .basemap-img {
      height: 70px;
      width: 100px;
      margin: 5px;
      background: url("../../../assets/img/basemap/css_sprites.png");
    }
    .basemap-foot {
      margin: 0 auto;
      text-align: center;
      position: absolute;
      top: 70px;
      height: 40px;
      width: 100%;
      line-height: 40px;
    }
  }
}
</style>