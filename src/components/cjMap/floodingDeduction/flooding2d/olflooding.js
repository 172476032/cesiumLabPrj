import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Polygon from "ol/geom/Polygon"
import Feature from 'ol/Feature';
import MultiPolygon from 'ol/geom/MultiPolygon';
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import CircleStyle from "ol/style/Circle";
import Icon from 'ol/style/Icon';
import Text from 'ol/style/Text';
import GeoJSON from 'ol/format/GeoJSON';
import EsriJSON from "ol/format/EsriJSON"


export default {
  data() {
    return {
      floodingLayer: null,
      timeOlInterval: null,
      speed: 1500
    }
  },
  computed: {
    arrivalOlIndex() {
      return this.$store.state.map.arrivalOlIndex
    },
    colors() {
      return this.$store.state.map.floodingColors;
    },
  },
  mounted() {

  },
  methods: {
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
          //   color: "red",
          //   width: 5
          // }),
          fill: new Fill({
            color: color
          })
        }))
        console.log('f: ', f);
        drawFeatures.push(f)
      })
      this.floodingLayer.getSource().addFeatures(drawFeatures)
    }
  },
}
