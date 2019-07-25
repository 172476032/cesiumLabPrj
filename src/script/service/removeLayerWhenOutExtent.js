import config from "../config";

const map = config.$STORE.getters.map;

/**
 *
 *
 * @param {any} layer
 */
function removeLayerWhenOutExtent(layer) {
  function removeL() {
    let size = map.getSize(),
      curExtent = [
        ...map.getCoordinateFromPixel([0, size[1]]),
        ...map.getCoordinateFromPixel([size[0], 0])
      ],
      layerExtent = layer
        .getSource()
        .getFeatures()[0]
        .getGeometry()
        .getExtent();
    // console.log(layerExtent)
    // console.log(curExtent)
    if (
      curExtent[0] > layerExtent[2] ||
      curExtent[2] < layerExtent[0] ||
      curExtent[1] > layerExtent[3] ||
      curExtent[3] < layerExtent[1]
    ) {
      config.$STORE.commit("REMOVE_MAP_OVERLAY", layer);
      // map.removeLayer(layer)
      // config.$APP.$Notice.info({
      //     title: '已移除图层'
      // })
      map.un("moveend", removeL);
    }
  }
  map.on("moveend", removeL);
}

export default removeLayerWhenOutExtent;
