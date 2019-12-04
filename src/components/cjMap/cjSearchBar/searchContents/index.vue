<template>
  <div :class="[prefixCls+'-list-wrapper']"
       v-show="emptyResult"
       :style="{'width':width,'maxHeight':maxHeight}">
    <div v-if="!isEmpty"
         ref="featureList">
      <ul :class="`${prefixCls}-item-list-wrapper`"
          v-if="!isEmpty"
          v-show="featureListShow &&true"
          ref="featureList">
        <li :class="`${prefixCls}-item-wrapper`"
            v-for="(v,i) in seachList"
            :key="i">
          <div :class="`${prefixCls}-item-info`">
            <div :class="`${prefixCls}-item-info-header`">
              {{v.Name}}
            </div>
            <div :class="`${prefixCls}-item-content`">
              <ul>
                <li :class="`${prefixCls}-item-child-content`"
                    v-for="(vv,ii) in v.featureInfo"
                    :key="ii"
                    @click.stop="handleItemClick(vv)"
                    @mouseenter.stop='handleItemMouseEnter(vv)'
                    @mouseleave.stop='handelItemMouseLeave(vv)'>
                  <p :class="[`${prefixCls}-item-location`,`${prefixCls}-item-small`]">{{vv.name}}</p>
                </li>
              </ul>
            </div>
          </div>
          <div :class="`${prefixCls}-item-img`"></div>
        </li>
      </ul>
      <transition name='slide-fade'>
        <div class="showCollapse"
             v-show="!showCollapse&&false"
             @mouseenter='showCollapse=true'>
          <p>展开搜索结果</p>
        </div>
      </transition>
    </div>
    <div v-else
         :class="`${prefixCls}-empty-wrapper`"
         v-show="seachNorltShow">
      <p :class="`${prefixCls}-empty-sorry`"
         class="sorry">抱歉,没有找到您想搜索的结果。</p>
      <div :class="`${prefixCls}-empty-tips-wrapper`">
        <p :class="`${prefixCls}-empty-tips`">您还可以:</p>
        <ul :class="`${prefixCls}-empty-tips-list`">
          <li>检查输入是否正确或者输入其它词</li>
          <li>打开图层,通过点击展示要素获取结果</li>
          <li>输入水文站、水电站、雨量站等专题内容</li>
        </ul>
      </div>
    </div>
    <div v-show="featureInfoShow"
         :class="`${prefixCls}-item-list-wrapper`">
      <div :class="`${prefixCls}-detail-back-btn`"
           @click="handleDetailBackBtnClick">
        <Icon type="md-arrow-back"></Icon>
        返回搜索结果
      </div>
      <div style="    padding-bottom: 15px;">
        <!-- 查询点详情 -->
        <!-- <detail-info :mapServerName="mapServerName"
                     :featureName="featureName"
                     :attributes="attributes"
                     :sttp="String(sttp)"
                     :stcd="String(stcd)"></detail-info> -->
      </div>
    </div>
  </div>
</template>

<script>
const prefix = "cj-search-dropdown";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import detailInfo from "./detailInfo";
import bus from "@/script/bus.js";
import overAllSearch from "./overAllSearch.js";

export default {
  name: prefix,
  data() {
    return {
      width: "",
      emptyResult: true,
      prefixCls: prefix,
      maxWidth: "",
      detailItem: null,
      featureInfoShow: false,
      featureListShow: true,
      attributes: null,
      featureName: null,
      mapServerName: null,
      sttp: "",
      stcd: ""
    };
  },
  props: {},
  mixins: [overAllSearch],
  components: { detailInfo },
  computed: {
    map() {
      return this.$store.getters.map;
    },
    showCollapse() {
      return this.$store.state.map.showCollapse;
    },
    seachNorltShow() {
      return this.$store.state.map.seachNorltShow;
    },
    layersConfigList() {
      return this.$store.getters.getLayersConfigList;
    },
    isEmpty() {
      return this.seachList.length === 0;
    },
    maxHeight() {
      let maxHeight = this.$store.getters.height - 50;

      return `${maxHeight}px`;
    },
    seachList() {
      console.log("取identify查询结果", this.$store.state.map.seachListData);
      return this.$store.state.map.seachListData.seachList;
    },
    keywords() {
      return this.$store.getters.mapSearchWords;
    },
    is3dMap() {
      return this.$store.state.map.is3dMap;
    }
  },
  created() {
    bus.$on("on-showSeachAllInfo", this.showIdentifyInfo);
    bus.$on("on-detailBackBtn_seachList", this.handleDetailBackBtnClickReSEACH);
  },
  mounted() {
    bus.$on("on-over-all-seach", this.overAllSearch);
    bus.$on(
      "on-clear-interactionselect-overallsearch",
      this.clearSelectFeatures
    );
  },
  destroyed() {
    console.log("搜索展示组件销毁");
    this.map.removeInteraction(this.pointMoverInteraction);
    this.map.removeInteraction(this.clickInteraction);
    bus.$off("on-showSeachAllInfo");
    bus.$off("on-detailBackBtn_seachList");
    this.$store.state.map.seachListData = {
      total: 0,
      seachList: []
    }; //查询解析后的结果
  },
  watch: {
    "$parent.width"(val, old) {
      this.width = `${val}px`;
    }
  },
  methods: {
    //每个图层的基本信息和监测数据根据此来配置，需要类型sttp和编码stcd
    getSttpStcd(layerName, attributes) {
      if (layerName == "水文站" || layerName == "设计院-水文站") {
        this.sttp = attributes["编码"];
        this.stcd = attributes["编号"];
      } else if (layerName == "水库" || layerName == "设计院-水库") {
        this.sttp = attributes["测站类"];
        this.stcd = attributes["测站编"];
      } else if (layerName == "雨量站" || layerName == "设计院-雨量站") {
        this.sttp = attributes.STTP;
        this.stcd = attributes.STCD;
      } else {
        this.sttp = "";
        this.stcd = "";
      }
    },
    handleDetailBackBtnClickReSEACH() {
      this.handleDetailBackBtnClick();
    },
    renderFeatures(feature) {
      let identifyRenderFeatures = [];
      if (feature.geometryType == "esriGeometryPoint") {
        let marker = new Feature({
          geometry: new Point([feature.geometry.x, feature.geometry.y])
        });
        marker.set("featurename", feature.name);
        identifyRenderFeatures.push(marker);
      } else if (feature.geometryType == "esriGeometryPolyline") {
        // console.log(feature.geometry.paths);
        let linestring = new Feature({
          geometry: new LineString(feature.geometry.paths[0])
        });
        linestring.set("featurename", feature.name);
        identifyRenderFeatures.push(linestring);
      } else if (feature.geometryType == "esriGeometryPolygon") {
      }
      //添加新要素之前清除其他要素
      // debugger;
      let identifyGeomsLayer = this.$store.getters.map.get(
        "identifyGeomsLayer"
      );
      identifyGeomsLayer.getSource().clear();
      identifyGeomsLayer.getSource().addFeatures(identifyRenderFeatures);
    },
    showIdentifyInfo(feature) {
      // debugger;
      // alert(feature.a);
      console.log(feature, "identify地图图标点击");
      // this.$data.featureListShow = false;
      // this.$data.featureInfoShow = true;
      let attr =
        feature.property != undefined
          ? feature.property.attributes
          : feature.attributes;
      attr.Shape ? delete attr.Shape : true;
      attr.SHAPE ? delete attr.SHAPE : true;
      attr.class ? delete attr.class : true;
      attr.OBJECTID ? delete attr.OBJECTID : true;
      attr.SHAPE_Length ? delete attr.SHAPE_Length : true;
      let featureInfo = feature.property || feature;
      this.deleteProperties(featureInfo, attr);
      this.$data.attributes = attr;
      this.getSttpStcd(feature.mapServerName, this.$data.attributes);
      this.$data.mapServerName = feature.mapServerName;
      this.$data.featureName =
        feature.property != undefined ? feature.property.name : feature.name;
      bus.$emit("on-search-list-click-show-modal", {
        mapServerName: this.$data.mapServerName,
        featureName: this.$data.featureName,
        attributes: this.$data.attributes
      });
    },
    deleteProperties(feature, attr) {
      if (this.layersConfigList) {
        console.log("this.layersConfigList: ", this.layersConfigList);
        let mapServer = _.find(this.layersConfigList, item => {
          return item.layer_name === feature.mapServerName;
        });
        if (mapServer) {
          let layer = _.find(mapServer.filterFields, item => {
            return item.layerId === feature.layerId;
          });
          if (layer) {
            let filterFields = layer.fields;
            _.map(filterFields, item => {
              delete attr[item];
            });
          }
        }
      }
    },
    handleDetailBackBtnClick() {
      this.$data.featureListShow = true;
      this.$data.featureInfoShow = false;
      // this.$parent.$emit("on-search-item-back-click", this.detailItem);
    },
    praseMonitorData(type) {},
    handleItemClick(feature) {
      console.log(feature, "identify列表点击");
      //基本信息
      this.showIdentifyInfo(feature);
      if (!this.is3dMap) {
        this.renderClikFeatures(feature.marker.get("evtFeature"));
        let renderFeature = feature.marker.get("evtFeature"); //缩放至要显示的要素范围内
      } else {
        this.renderClikFeatures(feature);
      }
    },
    handleItemMouseEnter(feature) {
      console.log("feature: ", feature);
      if (!this.is3dMap) {
        this.renderHoveMoveFeatures(feature.marker.get("evtFeature"));
      } else {
        this.renderHoveMoveFeatures(feature);
      }
    },
    handelItemMouseLeave(item) {
      this.$parent.$parent.$emit("on-search-item-mouse-leave", item);
    }
  },
  watch: {
    "this.featureListShow"() {
      // alert(1);
    },
    keywords(newKeywords) {
      console.log("newKeywords: ", newKeywords);
    }
  }
};
</script>

<style lang="scss" scope>
@import "@/styles/define.scss";
.cj-search-dropdown-list-wrapper {
  .showCollapse {
    width: 86% !important;
    text-align: center;
    background-color: #fff;
    padding: 12px 10px 5px;
    padding-top: 12px;
    padding-right: 10px;
    padding-bottom: 5px;
    padding-left: 10px;
    font-size: 14px;
    box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    & p {
      color: #0f89f5;
    }
  }
}

.cj-search-dropdown-wrapper {
  background: #fff;
  width: 100%;
  overflow: hidden;
  // margin-bottom: 8px;
  box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.15);
  border-radius: 0 0 3px 3px;
  overflow-y: auto;
  overflow-x: hidden;
}
.cj-search-dropdown-item-list-wrapper {
  padding: 0 5px;
  background-color: rgba(0, 0, 255, 0.1);
}
.cj-search-dropdown-item-header-menu {
  padding: 5px 0 10px;
  border-bottom: 1px solid rgba(0, 0, 255, 0.1);
}
.cj-search-dropdown-item-header-menu-btn-group {
  width: 100%;
}
.cj-search-dropdown-item-wrapper {
  padding: 5px;
  border-bottom: 1px solid rgba(0, 0, 255, 0.1);
}
.cj-search-dropdown-item-small {
  font-size: 14px;
  color: #ffff;
  line-height: 20px;
  max-height: 78px;
  text-overflow: ellipsis;
  max-width: 285px;
  overflow: hidden;
  font-family: Tahoma;
  padding: 5px 12px;
}
.cj-search-dropdown-item-info-header {
  font-weight: 600;
  font-size: 12px;
  color: #97ffff;
}
.cj-search-dropdown-empty-wrapper {
  padding: 10px;
  font-size: 14px;
  font-weight: 400;
  color: #565656;
  p {
    color: #666;
    font-size: 12px;
  }
  .sorry {
    color: #57a3f3;
    font-size: 12px;
  }
}
.cj-search-dropdown-empty-keywords {
  color: #08f;
}
.cj-search-dropdown-empty-tips-wrapper {
  margin-top: 10px;
}
.cj-search-dropdown-empty-tips-list {
  list-style: none;
}
.cj-search-dropdown-empty-tips-list li {
  list-style: none;
  margin-left: 15px;
  line-height: 24px;
  font-family: Tahoma;
  color: #666;
  font-size: 12px;
}
.cj-search-dropdown {
  &-item-content {
    overflow: auto;
  }
  &-item-child-content {
    &:hover {
      background: rgb(247, 238, 238);
      cursor: pointer;
    }
  }
  &-empty-wrapper {
    background-color: #fff;
    &-empty-sorry {
      color: #666;
    }
  }
}
.cj-search-dropdown {
  &-list-wrapper {
    margin-top: 5px;
    max-width: 413.297px;
    width: 80% !important;
    max-height: 500px;
    overflow: auto;
  }
  &-clear {
    background-color: white;
    border-bottom: 1px solid #f7f7f7;
    height: 30px;
    .close {
      position: relative;
      left: 330px;
      line-height: 30px;
    }
  }
  &-clear:hover {
    cursor: pointer;
  }
  &-clear-norlt {
    background-color: white;
    border-bottom: 1px solid #f7f7f7;
    height: 30px;
    .close {
      position: relative;
      left: 320px;
      line-height: 30px;
    }
  }
  &-clear-norlt:hover {
    cursor: pointer;
  }
  &-item-info-list {
    border-bottom: 1px solid #cccccc;
    padding: 5px;
    font-size: 15px;
    &:hover {
      background-color: #cccccc;
    }
    &-value {
      margin-left: 20px;
    }
    &-key {
      font-weight: bold;
    }
  }
  &-item-info-tile {
    font-size: 16px;
    padding: 0px 0px 3px 0px;
    color: blue;
    font-weight: bold;
  }
  &-detail-back-btn {
    margin: 8px 0px;
    width: 100%;
    border-bottom: 1px solid #3385ff;
    font-size: 13px;
    display: inline-block;
    /* border-radius: 2px; */
    color: #111010;
    top: 6px;
    left: 10px;
    font-weight: bold;
    color: #3385ff;

    &:hover {
      // box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      color: #428efd;
    }
  }
  &-detail-table {
    width: 100%;
    text-align: center;
  }
  &-detail-featureName {
    font-weight: bold;
    color: blue;
    text-align: center;
    margin-bottom: 15px;
  }
}
</style>

<style>
.ivu-modal-body .check-water-quality-content {
  width: 100% !important;
}

.ivu-modal .ivu-modal-close {
  z-index: 99999;
}
</style>

