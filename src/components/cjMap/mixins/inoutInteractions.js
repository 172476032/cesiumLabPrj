import {
  transform
} from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import axios from "axios";
import icon from "../../../assets/img/pointicon.png"
import pointicon from "@/assets/img/pointicon.png";

export default {
  data() {
    return {
      vectorLayer: null,
      clickInteraction: null,
      submitLonLatUrl: "/cjwsjysj/cjwsjy-sj/a/formApi/updatejwd"
    }
  },
  computed: {
    queryParams() {
      return this.$route.query;
    }
  },
  methods: {
    //提交经纬度信息
    submitLonLat() {
      console.log("提交标注信息")
      if (this.queryParams.opt) { //&& this.queryParams.opt == "edit"
        axios.get(`${this.submitLonLatUrl}?objectId=${this.queryParams.objectId}&tableName=${
  this.queryParams.tableName
        }&longitude=${this.lonNew}&latitude=${this.latNew}`).then(data => {
          console.log('提交返回信息: ', data);
          if (data.data.success) {
            this.resetPickModal()
            this.$Message.info(data.data.msg)
          } else {
            this.$Message.info(data.data.msg)
          }
        }).catch(err => {
          console.log('err: ', err);
        })
      }
    },
    //定位点信息
    locationToMarker() {
      if (this.queryParams.opt && this.queryParams.opt == "view") {
        //创建图层对象
        this.createVectorLayer();
        let lon = this.queryParams.longitude,
          lat = this.queryParams.latitude;
        if (lon && lon != "" && lat && lat != "") {
          let lonlat = transform([Number(lon), Number(lat)], "EPSG:4326", "EPSG:3857"),
            name = this.queryParams.objectName ? this.queryParams.objectName : "无名";
          let feature = this.addFeature(lonlat, name)
          this.$store.commit("set_sctterAnimationPoint", {
            coordinate: lonlat,
            color: "red"
          });
          this.map.getView().animate({
            center: lonlat,
            zoom: 12
          })
          //解决 this.map.updateSize()的bug,比它晚500ms
          setTimeout(() => {
            this.$store.commit("SET_HOVERED_FEATURE", {
              type: "normal",
              feature: feature
            });
          }, 1500);

        }
      }
    },
    //=====================
    createVectorLayer() {
      if (this.vectorLayer instanceof VectorLayer) {
        return;
      }
      this.vectorLayer = new VectorLayer({
        source: new VectorSource({}),
        style: this.styleFunction
      });
      this.vectorLayer.setZIndex(9999);
      //图层交互事件
      // this.addClickEvt(this.vectorLayer)
      this.map.addLayer(this.vectorLayer);
      this.map.set("locationHsLayer", this.vectorLayer)
      this.$store.state.map.addedLayers.push(this.vectorLayer);
    },
    styleFunction() {
      return new Style({
        image: new Icon({
          scale: 1,
          src: icon
        })
      })
    },
    addFeature(cords, name) {
      let source = this.vectorLayer.getSource();
      source.clear();
      let feature = new Feature(new Point(cords));
      feature.set("type", "pointicon")
      feature.set("name", name)
      source.addFeature(feature);
      return feature
    },
    addClickEvt(layer) {
      this.clickInteraction = new Select({
        layers: [layer],
        condition: singleClick,
        style: (f) => {
          let type = f.get("type"),
            style;
          if (type == 'pointicon') {
            style = this.setImgStyle(pointicon, 'str', "#fff")
          }
          return style;
        }
      })
      this.clickInteraction.on("select", (e) => {
        console.log('单机选择的要素: ', e);
        if (e.selected.length > 0) {

          //信息展示   先这样把
          let props = e.selected[0].get("property");
          bus.$emit("on-showSeachAllInfo", {
            attributes: props.attributes,
            mapServerName: props.mapServerName,
            featureName: props.name
          })
        }
      })
      this.map.addInteraction(this.clickInteraction)
    },
    setImgStyle(imgSrc, text, colr) {
      return new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: imgSrc
        })
      });
    }
  }
}
