import Cesium from "cesium/Cesium"
export default {
  data() {
    return {

    }
  },
  methods: {
    createTdtBaseLayer(url, layername) {
      let layer = new Cesium.WebMapTileServiceImageryProvider({
        url: url,
        layer: layername,
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
        show: false
      })
      //两倍亮度
      layer.brightness = 2.0;
      return layer;
    },
    createArcGisWmtsLayer(url) {
      let layer = new Cesium.ArcGisMapServerImageryProvider({
        url: url
      })
      //两倍亮度
      layer.brightness = 2;
      return layer;
    },
    createGoogleBaseLayer(url) {
      let layer = new Cesium.UrlTemplateImageryProvider({
        url: url
      })
      //两倍亮度
      layer.brightness = 2.0;
      return layer;
    }
  }
}
