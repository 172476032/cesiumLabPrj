/**
 * @author zhangzh emailAddress
 * @description 地图底图类
 */
import AbstractLayer from "../AbstractLayer";
import BaseLayer from "./BaseLayer";
import config from "../../../config.js";
import projzh from "projzh";
import ol from "openlayers";

// 构造百度地图投影
var extent = [72.004, 0.8293, 137.8347, 55.8271];

var baiduMercator = new ol.proj.Projection({
  code: "baidu",
  extent: ol.extent.applyTransform(extent, projzh.ll2bmerc),
  units: "m"
});

ol.proj.addProjection(baiduMercator);
ol.proj.addCoordinateTransforms(
  "EPSG:4326",
  baiduMercator,
  projzh.ll2bmerc,
  projzh.bmerc2ll
);
ol.proj.addCoordinateTransforms(
  "EPSG:3857",
  baiduMercator,
  projzh.smerc2bmerc,
  projzh.bmerc2smerc
);

/**
 * 采用ol.source.XYZ构造的底图图层
 *
 * @class BaiduBaseLayer
 * @extends {AbstractLayer}
 * 百度地图影像注记瓦片 http://online4.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl
 */
class BaiduBaseLayer extends AbstractLayer {
  constructor(id, name, type, realname, url, index, visible, layerConfigs) {
    var resolutions = [];
    for (var i = 0; i < 19; i++) {
      resolutions.push(Math.pow(2, 18 - i));
    }
    var origin = [0, 0];
    if (layerConfigs && layerConfigs.origin) {
      origin = layerConfigs.origin;
    }
    var tileGrid = new ol.tilegrid.TileGrid({
      origin: origin,
      resolutions: resolutions
    });

    var tileLoadFunction = function(imageTile, src) {
      var tileCoord = imageTile.getTileCoord();
      var z = tileCoord[0];
      var x = tileCoord[1];
      var y = tileCoord[2];

      var reg = new RegExp("(.*x=)-?\\d+(.*y=)-?\\d+(.*z=)-?\\d+");
      src = src.replace(reg, "$1" + x + "$2" + y + "$3" + z);
      // console.log(tileCoord, " =>>> ", baiduX, baiduY, z)
      imageTile.getImage().src = src;
    };

    var layer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        projection: "baidu",
        url: url,
        tileGrid: tileGrid,
        crossOrigin: "Anonymous",
        tileLoadFunction: tileLoadFunction
      }),
      visible: visible
    });

    super(id, name, type, realname, url, index, visible, layer);
  }

  set visible(val) {
    this._visible = val;
    //底图为独占模式，打开一个底图关闭其他底图
    if (val) {
      _.forEach(config["$STORE"].state.map.basemapList, (v, i) => {
        if (v != this) v.visible = false;
      });
      this.layer.setVisible(true);
    } else {
      this.layer.setVisible(false);
    }
  }

  get visible() {
    return this._visible;
  }

  setOwnVisible(value = false) {
    console.log("visible", value);
    this.layer.setVisible(value);
  }
}

export default BaiduBaseLayer;
