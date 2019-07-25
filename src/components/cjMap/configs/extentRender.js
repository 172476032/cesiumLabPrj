import axios from "axios";
export default {
  data() {
    return {}
  },
  mounted() {},
  methods: {
    initCommonLayer(url) {
      console.log("ssss")
      var vectorSource = new ol.source.Vector({
        loader: (extent, resolution, projection) => {
          let purl = url + '/query/?f=json&' +
            'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
            encodeURIComponent('{"xmin":' + extent[0] + ',"ymin":' +
              extent[1] + ',"xmax":' + extent[2] + ',"ymax":' + extent[3] +
              ',"spatialReference":{"wkid":102100}}') +
            '&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*' +
            '&outSR=102100';
          axios.get(purl).then(response => {
            console.log('response: ', response);
            if (response.error) {
              alert(response.error.message + '\n' +
                response.error.details.join('\n'));
            } else {
              // dataProjection will be read from document
              var features = new ol.format.EsriJSON().readFeatures(response.data, {
                featureProjection: projection
              });
              if (features.length > 0) {
                vectorSource.addFeatures(features);
              }
            }
          })

        },
        strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
          tileSize: 512
        }))
      });

      var vector = new ol.layer.Vector({
        source: vectorSource,
        style: (f) => {
          let zoom = this.olMap.getView().getZoom(),
            text = f.get("测站名称"),
            center = f.getGeometry().getCoordinates();
          if (zoom >= 10) {
            return this.setPointStyle(text, center);
          } else {
            return new ol.style.Style({
              image: new ol.style.Circle({
                center: center,
                radius: 1.5,
                fill: new ol.style.Fill({
                  color: "yellow"
                })
              })
            });
          }
        },
        zIndex: 4000
      });
      return vector;
    }
  },

}
