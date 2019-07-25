import _ from "lodash"
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Polygon from "ol/geom/Polygon"
import Feature from 'ol/Feature';
import MultiPolygon from 'ol/geom/MultiPolygon';
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import grids3857 from '../../../../../static/jsons/floodall3857';

export default {
  data() {
    return {
      sortGroupGrids3857: null,
      floodingLayer: null,
      timeOlInterval: null,
      speed: 1500
    };
  },
  computed: {
    arrivalOlIndex() {
      return this.$store.state.map.arrivalOlIndex
    },
    colors() {
      return this.$store.state.map.floodingColors2d;
    },
    map() {
      return this.$store.getters.map;
    },
  },
  methods: {
    replayFlooding() {
      this.reset();
      this.intervalOlSetting(this.sortGroupGrids3857)
    },
    beginFlooding() {
      if (this.sortGroupGrids3857) {
        this.intervalOlSetting(this.sortGroupGrids3857)
      }
    },
    pauseFlooding() {
      //清楚计时器
      window.clearInterval(this.timeOlInterval)
    },
    toggle(name) {
      console.log('name: ', name);
      if (name == "openFloodPanel") {
        console.log("打开推演面板")
        if (!this.sortGroupGrids3857) {
          //解析数据
          console.log('grids3857: ', grids3857);
          this.sortGroupGrids3857 = this.praseData(grids3857.features);
          console.log('sortGroupGrids3857: ', this.sortGroupGrids3857);
          this.$store.state.map.sortGroupGrids3857Length = this.sortGroupGrids3857.length
          this.createLayer()
        }
        this.floodShow = true;
        this.flyTo();
      } else if (name == "closeFloodPanel") {
        this.floodShow = false;
        this.close()
      }
    },
    createLayer() {
      if (this.floodingLayer instanceof VectorLayer) {
        return
      }
      console.log("创建洪水图层 ")
      this.floodingLayer = new VectorLayer({
        source: new VectorSource({})
      })
      this.map.set("floodingLayer", this.floodingLayer)
      this.map.addLayer(this.floodingLayer)
    },
    intervalOlSetting(sortGroupGrids) {
      this.timeOlInterval = setInterval(() => {
        if (this.arrivalOlIndex == sortGroupGrids.length) { //sortGroupGrids.length - 1
          window.clearInterval(this.timeOlInterval)
        } else {
          this.drawPolygons(sortGroupGrids[this.arrivalOlIndex])
          console.log('sortGroupGrids[arrivalOlIndex]: ', sortGroupGrids[this.arrivalOlIndex]);
          this.$store.state.map.arrivalOlIndex++;
        }
        console.log("正在播放哦哦哦")
      }, this.speed);
    },
    drawPolygons(features) {
      let drawFeatures = []
      features.forEach(v => {
        let color = this.colors[v.properties.color]["color"],
          f;
        if (v.geometry.type == 'MultiPolygon') {
          f = new Feature({
            geometry: new MultiPolygon(v.geometry.coordinates)
          })
        } else {
          f = new Feature({
            geometry: new Polygon(v.geometry.coordinates)
          })
        }
        f.setStyle(new Style({
          // stroke: new Stroke({
          //   width: 1,
          //   color: "rgba(0,0,0,0)"
          // }),
          fill: new Fill({
            color: color
          })
        }))
        drawFeatures.push(f)
      })
      this.floodingLayer.getSource().addFeatures(drawFeatures)
    },
    reset() {
      this.floodingLayer instanceof VectorLayer ? this.floodingLayer.getSource().clear() : ""
      window.clearInterval(this.timeOlInterval)
      this.$store.state.map.arrivalOlIndex = 0;
    },
    close() {
      this.reset()
      this.removeLayer()
    },
    praseData(data) {
      let sort = _.groupBy(_.sortBy(data, (o) => {
          return o.properties.Value_1
        }), (a) => {
          return a.properties.Value_1
        }),
        sortGroupGrids = [];
      if (sort) {
        for (const key in sort) {
          if (sort.hasOwnProperty(key)) {
            sortGroupGrids.push(sort[key]);
          }
        }
        return sortGroupGrids
      }
    },
    flyTo() {
      this.map.getView().animate({
        center: [12545919.418666767, 3407105.246911662],
        zoom: 12
      })
    },
    removeLayer() {
      this.map.unset("floodingLayer")
      this.map.removeLayer(this.floodingLayer)
      console.log("floodingLayer销毁")
    }
  }
};
