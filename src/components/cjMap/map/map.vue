<!--  -->
<template>
  <div class="two-dimensional">
    <div id="cjmap"
         ref="cjmap">

    </div>
    <cj-scatter-Overlay :map="map"></cj-scatter-Overlay>
    <cj-marker-tip ref='cjMarkerTip'></cj-marker-tip>
    <!-- 点击图表查看信息的弹出框 -->
    <click-info-modal :infoShow="infoShow"
                      :mapServerName="mapServerName"
                      :tileShow="false"
                      :featureName="featureName"
                      :attributes="attributes"
                      :sttp="String(sttp)"
                      :stcd="String(stcd)"
                      @resetInfoShow="resetInfoShow"></click-info-modal>
  </div>
</template>

<script>
import "ol/ol.css";
import TileLayer from "ol/layer/Tile";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTile from "ol/source/VectorTile";
import MVT from "ol/format/MVT";
import XYZ from "ol/source/XYZ";
import TileWMS from "ol/source/TileWMS";
import RenderFeature from "ol/render/Feature";
import { transform } from "ol/proj";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";
import Icon from "ol/style/Icon";
import bus from "@/script/bus.js";
const baseLayers = require("../configs/baselayers.json");
import treeLayers from "../configs/tree2dLayers";
import LayerFactory from "@/script/geo/layer/LayerFactory";
import mapEvents from "../mixins/mapEvents";
import cjScatterOverlay from "@/components/cjMap/cjCommons/sctterAnimation.vue";
import clickInfoModal from "@/components/cjMap/modals/clickInfoModal.vue";
import cjMarkerTip from "@/components/cjMap/cjCommons/cjMarkerTip.vue";
import inoutInteractions from "../mixins/inoutInteractions";

export default {
  name: "cjmap",
  mixins: [mapEvents, inoutInteractions],
  data() {
    return {
      treeLayers: treeLayers,
      ecOverlay: null,
      cesiumChart: null,
      cjMapCls: null,
      infoShow: false,
      attributes: null,
      featureName: null,
      mapServerName: null,
      sttp: "",
      stcd: "",
      selection: {},
      vectorTileLayers: []
    };
  },

  components: { clickInfoModal, cjMarkerTip, cjScatterOverlay },

  computed: {
    map() {
      return this.$store.getters.map;
    },
    curMapZoom() {
      return this.map.getView().getZoom();
    },
    hoverLayer() {
      return this.$store.state.map.hoverLayer;
    },
    clickLayer() {
      return this.$store.state.map.clickLayer;
    },
    hoverFullPoint() {
      return this.$store.state.map.hoverFullPoint;
    },
    clickFullPoint() {
      return this.$store.state.map.clickFullPoint;
    },
    cursorType() {
      return this.$store.state.map.cursorType;
    }
  },
  mounted() {
    console.log("路由参数", this.$route);
    this.initMap();
    //弹出信息展示框的唯一方法
    bus.$on("on-search-list-click-show-modal", this.showModal);
  },
  methods: {
    initMap() {
      this.map.setTarget(this.$refs.cjmap);
      setTimeout(() => {
        //宏数初始化定位过滤
        if (this.$route.query.opt != "view") {
          this.map.getView().animate({
            center: this.map.getView().getCenter(),
            zoom: 6
          });
        }
        this.map.updateSize();
      }, 1000);
      this.map.on("pointermove", e => {
        this.vtPointMoveEvt(e);
      });
      this.map.on("click", e => {
        console.log("e: ", e);
        this.vtClick(this.map, e);
        console.log(
          "中心点,级别",
          transform(e.target.getView().getCenter(), "EPSG:3857", "EPSG:4326"),
          e.target.getView().getZoom()
        );
        console.log(
          "3857 to 4326",
          e.target.getView().getCenter(),
          transform(e.target.getView().getCenter(), "EPSG:3857", "EPSG:4326")
        );
      });
      this.addBaseLayers(baseLayers);
      this.addThemeLayers(treeLayers);
      // this.addInteractions(this.map, this.vectorTileLayers);
      console.log("所有的矢量瓦片图层", this.vectorTileLayers);
      this.$refs.cjMarkerTip.$emit("on-init", this.map);
      //初始化宏数交互
      this.locationToMarker();
    },
    addBaseLayers(data) {
      //底图加载
      console.log("baselayer: ", data);
      let baseLayers = [];
      var currentBasemap = {};
      if (data) {
        _.forEach(data, (v, i) => {
          let baseLayer = LayerFactory.createBaseLayer(v);
          baseLayers.push(baseLayer);
          if (v.visible) currentBasemap = baseLayer;
          //对底图为3857的切片进行重新定义切换逻辑，切换时对应cjBasemap.vue里的toggleBasemap方法
          if (v.type == "arcgis-wmts3857") {
            let baseLayer = new TileLayer({
              source: new XYZ({
                url: v.layerConfigs[0].url
              })
            });
            this.$store.state.map.basemap3857.push(v);
            baseLayer.setVisible(false);
            this.map.set(v.real_name, baseLayer);
            this.map.addLayer(baseLayer);
          }
          if (baseLayer && baseLayer.layer) {
            this.map.addLayer(baseLayer.layer);
            if (baseLayer.otherLayer) {
              this.map.addLayer(baseLayer.otherLayer);
            }
          }
        });
      }
      this.$store.commit("SET_BASEMAP_LIST", baseLayers);
      console.log("baseLayers: ", baseLayers);
      this.$store.commit("SET_CURRENT_MAP_BASEMAP", currentBasemap);
    },
    addThemeLayers(treeLayers) {
      //图层树加载 ，创建图层，直接遍历第三层
      if (treeLayers.length > 0) {
        let len = treeLayers.length,
          layerIndex = 0,
          modelIndex = -1;
        for (let i = 0; i < len; i++) {
          let jlen = treeLayers[i].children.length;
          for (let j = 0; j < jlen; j++) {
            let klen = treeLayers[i].children[j].children.length;
            for (let k = 0; k < klen; k++) {
              let v = treeLayers[i].children[j].children[k];
              let layer = this.addLayers(
                v.layerUrl,
                v.layerName,
                v.visible,
                v.type,
                v.geoType,
                v.wmsLayerNames,
                v.vectorConfig,
                v.name,
                v.declutter
              );
              //初始化点击查询列表，如果为可见，则可查
              if (v.visible && v.queryConfig) {
                this.$store.state.map.selectTreeLayers.push(v.queryConfig);
              }
              //给每一个图层配置一个从0开始的index，因为三维获取图层是按照get(index)来获取的,
              // 图层树还是要根据构建的图层列表来初始化，在此就遇到了这个坑，然而添加一个index完美解决了问题
              if (v.type == "MODEL") {
                modelIndex++;
                v.modelIndex = modelIndex;
              } else if (
                v.type == "WMS" ||
                v.type == "WMTS" ||
                v.type == "VECTORTILE" ||
                v.type == "COMMON"
              ) {
                layerIndex++;
                v.layerIndex = layerIndex;
              }
            }
          }
        }
        console.log(
          "图层管理器选择的图层对象列表：",
          this.$store.state.map.selectTreeLayers
        ); //图层加载完成后初始化树状结构
        this.$store.state.map.treeConfigs = this.treeLayers;
      }
    },
    addLayers(
      url,
      layerName,
      visible,
      type,
      geoType,
      wmsLayerNames,
      vectorConfig,
      realName,
      declutter
    ) {
      let layer;
      if (type == "WMS") {
        layer = new TileLayer({
          source: new TileWMS({
            url: url,
            params: {
              FORMAT: "image/png",
              VERSION: "1.1.1",
              tiled: true,
              LAYERS: wmsLayerNames,
              STYLES: "",
              TRANSPARENT: true
            },
            transition: 0
          })
        });
      } else if (type == "WMTS") {
        layer = new TileLayer({
          source: new XYZ({
            url: url
          })
        });
      } else if (type == "VECTORTILE") {
        layer = this.createVectorTileLayer(
          url,
          layerName,
          visible,
          type,
          geoType,
          wmsLayerNames,
          vectorConfig,
          realName,
          declutter
        );
        this.vectorTileLayers.push(layer);
      } else if (type == "COMMON") {
        layer = this.initCommonLayer(url);
      } else {
        return;
      }
      // console.log("图层树加载的layer: ", layer);
      layer.setVisible(visible);
      this.setLayerIndex(geoType, layer);
      this.map.set(layerName, layer);
      this.map.addLayer(layer);
      return layer;
    },
    createVectorTileLayer(
      url,
      layerName,
      visible,
      type,
      geoType,
      wmsLayerNames,
      vectorConfig,
      realName,
      declutter
    ) {
      declutter = declutter ? declutter : false;
      console.log("declutter: ", declutter);
      return new VectorTileLayer({
        source: new VectorTile({
          format: new MVT(),
          url: url
        }),
        declutter: declutter,
        style: f => {
          // console.log("f: ", f);
          let props = f.getProperties(),
            zoom = this.map.getView().getZoom(),
            text = props[vectorConfig.labelField],
            center = f.getFlatCoordinates(),
            setprops = {
              realName: realName, //设置图层的名称 中文
              layerName: layerName, //图层名称  英文
              labelField: vectorConfig.labelField, //设置hover时显示字段，用于hover时获取对用的text获取
              hoverStyle: vectorConfig.hoverStyle, //设置图标hover的样式
              uuId: vectorConfig.uuId, //要素的唯一标识字段
              layerZoom: vectorConfig.zoom
            };
          props.setprops = setprops;
          // console.log("props: ", props);
          // return new Style({
          //   image: new Icon({
          //     src: "./static/map/layertree/水库.png",
          //     scale: 0.3
          //   })
          // });
          if (zoom >= vectorConfig.zoom) {
            return vectorConfig.maxZoomStyle(
              text,
              zoom,
              f,
              this.selection,
              props
            );
          } else {
            return vectorConfig.minZoomStyle(
              text,
              zoom,
              f,
              this.selection,
              props
            );
          }
        },
        zIndex: 6000
      });
    },
    setLayerIndex(type, layer) {
      let zIndex = [200, 400, 600, 800];
      if (type == "point") {
        layer.setZIndex(zIndex[3]);
      } else if (type == "line") {
        layer.setZIndex(zIndex[2]);
      } else if (type == "polygon") {
        layer.setZIndex(zIndex[1]);
      } else if (type == "buttom") {
        layer.setZIndex(zIndex[0]);
      }
    },
    resetInfoShow() {
      this.infoShow = false;
    }
  },
  destroyed: {}
};
</script>
<style lang='scss' scoped>
.two-dimensional {
  width: 100%;
  height: 100%;
  #cjmap {
    width: 100%;
    height: 100%;
    position: relative;
  }
}
</style>