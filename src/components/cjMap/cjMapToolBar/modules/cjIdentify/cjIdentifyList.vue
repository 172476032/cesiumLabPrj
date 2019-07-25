<template>
  <div :class="[prefixCls+'-list-wrapper']"
       v-show="emptyResult"
       :style="{'width':width,'maxHeight':maxHeight}">
    <div v-if="!isEmpty"
         v-show="featureListShow"
         ref="featureList">
      <!-- 此时不需要关闭按钮 -->
      <div :class="[prefixCls+'-clear']"
           v-show="false"
           @click.stop='hideIdentifyList'>
        <Icon class="close"
              type="md-close"></Icon>
      </div>
      <ul :class="`${prefixCls}-item-list-wrapper`">
        <li :class="`${prefixCls}-item-wrapper`"
            v-for="(v,i) in identifyList"
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
    </div>
    <div v-else
         :class="`${prefixCls}-empty-wrapper`"
         v-show="norltShow">
      <div :class="[prefixCls+'-clear-norlt']"
           v-show="false"
           @click.stop='on_norltShow'>
        <Icon class="close"
              type="md-close"></Icon>
      </div>
      <p :class="`${prefixCls}-empty-sorry`">抱歉，没有找到查到您想要的结果</p>
      <div :class="`${prefixCls}-empty-tips-wrapper`">
        <p :class="`${prefixCls}-empty-tips`">您还可以:</p>
        <ul :class="`${prefixCls}-empty-tips-list`">
          <li>缩放地图至合适的范围重新查询</li>
          <li>重新选择需要查询的图层</li>
        </ul>
      </div>
    </div>
    <div v-show="featureInfoShow"
         :class="`${prefixCls}-item-list-wrapper`">
      <div :class="`${prefixCls}-detail-back-btn`"
           @click="handleDetailBackBtnClick">
        <Icon type="md-arrow-back"></Icon>
        返回
      </div>
      <div style="    padding-bottom: 15px;">
        <!-- <div :class="`${prefixCls}-detail-featureName`">{{featureName}}</div>
        <table :class="`${prefixCls}-detail-table`">
          <tr v-for="(value,key) in attributes"
              :key="key">
            <td>{{key}}:</td>
            <td>{{value}}</td>
          </tr>
        </table> -->
        <!-- 查询点详情 -->
        <div :class="[`${prefixCls}-item-info-tile`]">
          <span>{{mapServerName}}:</span>
          <span>&nbsp;{{featureName}}</span>
        </div>
        <div style="background:#eee;padding:5px">
          <card :bordered="false"
                style="overflow: auto;"
                :style="{'width':maxWidth,'maxHeight':'500px'}">
            <div v-for="(value,key) in attributes"
                 :class="`${prefixCls}-item-info-list`"
                 :key="key">
              <span :class="[`${prefixCls}-item-info-list-key`]"> {{key}} : </span>
              <span :class="[`${prefixCls}-item-info-list-value`]">{{value}}</span>
            </div>
          </card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const prefix = "cj-identify";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import { renderClikFeatures } from "./arcgisQuery";
import bus from "@/script/bus.js";
import { locationToExtentByFeatureType } from "@/script/mapUtils/myMaputils/myUtils.js";

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
      mapServerName: null
    };
  },
  computed: {
    map() {
      return this.$store.getters.map;
    },
    is3dMap() {
      return this.$store.state.map.is3dMap;
    },
    norltShow() {
      return this.$store.state.map.norltShow;
    },
    layersConfigList() {
      return this.$store.getters.getLayersConfigList;
    },
    isEmpty() {
      console.log("我被触发了");

      return this.identifyList.length === 0;
    },
    maxHeight() {
      let maxHeight = this.$store.getters.height - 320;

      return `${maxHeight}px`;
    },
    identifyList() {
      console.log("取identify查询结果", this.$store.state.map.identifyListData);
      return this.$store.state.map.identifyListData.identifyList;
    },
    keywords() {
      return this.$store.getters.mapSearchWords;
    }
  },
  created() {
    bus.$on("showIdentifyInfo", this.showIdentifyInfo);
    bus.$on("setemptyResultFalse", this.setemptyResultFalse);
    bus.$on("setemptyResultFalse_true", this.setemptyResultFalse);
    bus.$on(
      "handleDetailBackBtnClickReSEACH",
      this.handleDetailBackBtnClickReSEACH
    );
    bus.$on("on-hideIdentifyList", this.hideIdentifyList);
  },
  watch: {
    "$parent.width"(val, old) {
      this.width = `${val}px`;
    }
  },
  methods: {
    hideIdentifyList() {
      this.featureListShow = false;
      this.$store.commit("CLEAR_IDENTIFY_LAYERS");
    },
    on_norltShow() {
      this.$store.state.map.norltShow = false;
    },
    setemptyResultFalse(boolVl) {
      this.emptyResult = boolVl;
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
      // alert(feature.a);
      console.log(feature, "identify地图图标点击");
      this.$data.featureListShow = false;
      this.$data.featureInfoShow = true;
      let attr =
        feature.property != undefined
          ? feature.property.attributes
          : feature.attributes;
      attr.FID ? delete attr.FID : true;
      attr.OBJECTID_1 ? delete attr.OBJECTID_1 : true;
      attr.Shape ? delete attr.Shape : true;
      attr.SHAPE ? delete attr.SHAPE : true;
      attr.class ? delete attr.class : true;
      attr.OBJECTID ? delete attr.OBJECTID : true;
      attr.SHAPE_Length ? delete attr.SHAPE_Length : true;
      let featureInfo = feature.property || feature;
      this.deleteProperties(featureInfo, attr);
      this.$data.attributes = attr;
      this.$data.mapServerName = feature.mapServerName;
      this.$data.featureName =
        feature.property != undefined ? feature.property.name : feature.name;
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
    handleItemClick(feature) {
      console.log(feature, "identify列表点击");
      this.showIdentifyInfo(feature);
      // this.renderFeatures(feature);
      renderClikFeatures(feature.marker.get("evtFeature"));
      this.map.getView().animate({
        center: feature.marker.get("center"),
        zoom: 14
      });
      //居中并设置散射点
      this.$store.commit("set_sctterAnimationPoint", {
        coordinate: feature.marker.get("center"),
        color: "red"
      });
    },
    handleItemMouseEnter(feature) {
      renderClikFeatures(feature.marker.get("evtFeature"));
    },
    handelItemMouseLeave(item) {
      this.$parent.$parent.$emit("on-search-item-mouse-leave", item);
    }
  },
  watch: {
    // identifyList: {
    //   deep: true,
    //   handler(newV, oldV) {
    //     if (newV) {
    //       console.log("重新identify查询");
    //       this.handleDetailBackBtnClick();
    //     }
    //   }
    // }
  },
  destroyed() {
    bus.$off("showIdentifyInfo");
    bus.$off("setemptyResultFalse");
    bus.$off("setemptyResultFalse_true");
    bus.$off("handleDetailBackBtnClickReSEACH");
    bus.$off("on-hideIdentifyList");
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/define.scss";
.cj-identify-wrapper {
  background: #fff;
  width: 100%;
  overflow: hidden;
  // margin-bottom: 8px;
  box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.15);
  border-radius: 0 0 3px 3px;
  overflow-y: auto;
  overflow-x: hidden;
}
.cj-identify-item-list-wrapper {
  padding: 0 10px;
  background-color: #fff;
}
.cj-identify-item-header-menu {
  padding: 5px 0 10px;
  border-bottom: 1px solid #eaeaea;
}
.cj-identify-item-header-menu-btn-group {
  width: 100%;
}
.cj-identify-item-wrapper {
  padding: 5px;
  border-bottom: 1px solid #eaeaea;
}
.cj-identify-item-small {
  font-size: 14px;
  color: #666;
  line-height: 20px;
  max-height: 78px;
  text-overflow: ellipsis;
  max-width: 285px;
  overflow: hidden;
  font-family: Tahoma;
  padding: 8px;
}
.cj-identify-item-info-header {
  font-weight: 600;
  font-size: 14px;
  color: #57a3f3;
  margin: 5px;
  border-bottom: 1px solid #f3eded;
}
.cj-identify-empty-wrapper {
  padding: 0px 10px 10px 10px;
  font-size: 14px;
  font-weight: 400;
  color: #565656;
   
  li{
    font-size:12px
  }
  .cj-identify-empty-sorry{
    padding-top:10px;
     font-size:12px;
    color:#57a3f3;
  }
}
.cj-identify-empty-keywords {
  color: #08f;
}
.cj-identify-empty-tips-wrapper {
  margin-top: 10px;
  .cj-identify-empty-tips{
    font-size:12px;
  }
}
.cj-identify-empty-tips-list {
  list-style: none;
}
.cj-identify-empty-tips-list li {
  list-style: disc;
  margin-left: 15px;
  line-height: 24px;
  font-family: Tahoma;
  color: #999;
}
.cj-identify {
  &-item-content {
    overflow: auto;
    max-height: 500px;
  }
  &-item-child-content {
    &:hover {
      background: rgb(247, 238, 238);
      cursor: pointer;
    }
  }
  &-empty-wrapper {
    background-color: #fff;
  }
}
.cj-identify {
  &-list-wrapper {
    margin-top: 5px;
    max-width: 413.297px;
    width: 86.2% !important;
  }
  &-clear {
    background-color: white;
    border-bottom: 1px solid #f7f7f7;
    height: 30px;
    .close {
      position: relative;
      left: 285px;
      line-height: 20px;
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
    font-size: 12px;
    &:hover {
      background-color: #cccccc;
    }
    &-value {
      font-weight: bold;

      margin-left: 20px;
    }
    &-key {
    }
  }
  &-item-info-tile {
    font-size: 12px;
    padding: 0px 0px 3px 0px;
    color: #57a3f3;
    font-weight: bold;
    span {
      font-size: 12px;
      color: #57a3f3;
    }
  }
  &-detail-back-btn {
    margin: 15px 0px;
    width: 100%;
    border-bottom: 1px solid #eee;
    z-index: 10001;
    padding: 3px 7px 3px 5px;
    cursor: pointer;
    font-size: 12px;
    display: inline-block;
    // background-color: rgba(51, 51, 51, 0.5);
    border-radius: 2px;
    // border: 1px solid;
    color: rgb(17, 16, 16);
    top: 6px;
    left: 10px;
    font-weight: bold;
    &:hover {
      // box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.15);
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
