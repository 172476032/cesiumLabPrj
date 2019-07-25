<template>
  <map-tool-item name='pointpick'
                 :repeat="true"
                 :clickHighlight="false"
                 :singleton="false"
                 @on-map-tool-select='handleToolSelect'>
    <Icon type="md-color-filter"
          size='18'></Icon>拾取
    <point-pick ref="pointpick"
                class="point-pick-wrap"
                @unPointPickKey="unPointPickKey"
                :lon="lon"
                :lat="lat"></point-pick>
  </map-tool-item>
</template>
<script>
import MapToolItem from "../common/MapToolItem.vue";
import config from "@/script/config";
import { transform } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
//事件
import { unByKey } from "ol/Observable";
import { locationToExtentByFeatureType } from "@/script/mapUtils/myMaputils/myUtils.js";
import pointPick from "../../modals/pointPickModal";
import img from "@/assets/img/location/history.gif";
const canvasEle = document.createElement("CANVAS");
gifler(img).animate(canvasEle);

export default {
  name: "pointpick",
  components: {
    MapToolItem,
    pointPick
  },
  data() {
    return {
      pointPickKey: null,
      vectorLayer: null,
      lon: "",
      lat: ""
    };
  },
  computed: {
    is3dMap() {
      return this.$store.state.map.is3dMap;
    },
    map() {
      return this.$store.getters.map;
    }
  },
  mounted() {},
  methods: {
    createVectorLayer() {
      if (this.vectorLayer instanceof VectorLayer) {
        return;
      }
      this.vectorLayer = new VectorLayer({
        source: new VectorSource({}),
        style: this.styleFunction
      });
      this.vectorLayer.setZIndex(9999);
      this.map.addLayer(this.vectorLayer);
      this.$store.state.map.addedLayers.push(this.vectorLayer);
    },
    styleFunction() {
      let data = canvasEle.toDataURL();
      let iconStyle = new Style({
        image: new Icon({
          scale: 1,
          src: data
        })
      });
      return iconStyle;
    },
    addFeature(cords) {
      let source = this.vectorLayer.getSource();
      source.clear();
      let feature = new Feature(new Point(cords));
      source.addFeature(feature);
      let interval = 200;
      let redraw = () => {
        // 如果当前图层不可见，则不再循环展示GIF图标
        if (this.vectorLayer.getSource().getFeatures().length == 0) return;
        this.vectorLayer.setStyle(this.styleFunction);
        setTimeout(redraw, interval);
      };
      setTimeout(redraw, interval);
    },
    handleToolSelect() {
      if (this.is3dMap) {
      } else {
        this.$store.state.map.cursorType = "crosshair";
        this.map.getTargetElement().style.cursor = this.$store.state.map.cursorType;
        this.createVectorLayer();
        this.pointPickKey = this.map.on("click", e => {
          console.log("点拾取 ", e);
          this.vectorLayer.getSource().clear();
          let cords = transform(e.coordinate, "EPSG:3857", "EPSG:4326");
          this.lon = cords[0].toFixed(3);
          this.lat = cords[1].toFixed(3);
          this.addFeature(e.coordinate);
          //start--清除定位图层，重新改变宏数定位坐标
          if (
            this.map &&
            this.map.get("locationHsLayer") instanceof VectorLayer
          ) {
            this.map
              .get("locationHsLayer")
              .getSource()
              .clear();
            this.$store.commit("SET_HOVERED_FEATURE", {
              type: "normal",
              feature: null
            });
            this.$store.commit("hideScatterAnimation");
            //end--
          }

          this.$refs.pointpick.showPickModal();
        });
        this.$store.state.map.mapEventHistory.unByKey.push(this.pointPickKey);
      }
    },
    unPointPickKey() {
      this.$store.state.map.cursorType = "default";
      this.map.getTargetElement().style.cursor = "";
      unByKey(this.pointPickKey);
      this.vectorLayer.getSource().clear();
    }
  }
};
</script>
