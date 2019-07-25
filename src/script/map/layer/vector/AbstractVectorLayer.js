/*
 * @CreateTime: Sep 5, 2017 8:51 AM
 * @Author: zhangzh
 * @Contact: zhang910818@163.com
 * @Last Modified By: zhangzh
 * @Last Modified Time: Oct 13, 2017 10:02 AM
 * @Description: 将基本图层的点图层改为矢量图层
 */
import AbstractLayer from "../AbstractLayer";
import _ from "lodash";
import ol from "openlayers";

class AbstractVectorLayer extends AbstractLayer {
  /**
   * Creates an instance of AbstractVectorLayer.
   * @param {Integer} id
   * @param {String} name
   * @param {Integer} index
   * @param {Boolean} visible
   * @param {String} geometryType 图层类型，分为点、线、面
   * @param {Array} layerConfigs 矢量图层样式配置
   * @param {Object} map 地图对象
   *
   * @memberof AbstractVectorLayer
   */
  constructor(
    id,
    name,
    type,
    realname,
    index,
    visible,
    layer,
    layerConfigs,
    geometryType,
    map
  ) {
    super(
      id,
      name,
      type,
      realname,
      undefined,
      index,
      visible,
      layer,
      geometryType
    );

    // 矢量图层样式函数
    var styleFunction = function(feature, isHighlight, srcData) {
      if (
        !(feature instanceof ol.Feature || feature instanceof ol.render.Feature)
      ) {
        feature = this;
      }
      let scale = isHighlight === true ? 1.1 : 0.9;
      let zoom = map.getView().getZoom();
      let rotation = map.getView().getRotation();
      let styleConfigs = _.filter(layerConfigs, item => {
        return (
          (!item.minZoom || item.minZoom <= zoom) &&
          (!item.maxZoom || item.maxZoom >= zoom)
        );
      });
      let style = new ol.style.Style({});
      if (styleConfigs && styleConfigs.length > 0) {
        let styleConfig = styleConfigs[0];
        if (styleConfig.type == "icon") {
          let src = styleConfig.params && styleConfig.params.src;
          style = new ol.style.Style({
            image: new ol.style.Icon({
              rotation:
                styleConfig.params && styleConfig.params.rotation
                  ? (styleConfig.params.rotation / 180) * Math.PI + rotation
                  : rotation,
              src: srcData || src || "/src/assets/img/monitor/rain.png",
              scale: scale
            })
          });
        } else if (styleConfig.type == "circle") {
          let color;
          let stroke;
          let radius = (styleConfig.params && styleConfig.params.radius) || 3;
          if (
            styleConfig.params &&
            styleConfig.params.limits &&
            styleConfig.params.limits instanceof Array
          ) {
            let length = styleConfig.params.limits.length;
            for (let i = 0; i < length; i++) {
              let limit = styleConfig.params.limits[i];
              let value = feature.get(limit.key);
              if (value + "" == limit.value + "") {
                color = limit.color;
                break;
              }
            }
            stroke = new ol.style.Stroke({
              color: "000",
              width: 1
            });
          } else {
            color =
              styleConfig.params &&
              styleConfig.params.fill &&
              styleConfig.params.fill.color;
          }
          style = new ol.style.Style({
            image: new ol.style.Circle({
              radius: radius * scale,
              fill: new ol.style.Fill({
                color: color || "red"
              }),
              stroke: stroke
            })
          });
        } else if (styleConfig.type == "text" && styleConfig.idField) {
          let txt = feature.get(styleConfig.idField);
          if (txt) {
            txt = txt.trim();
            let coord = feature.getGeometry().getFirstCoordinate();
            let resolution = map.getView().getResolution();
            let fontSize =
              (styleConfig.params &&
                styleConfig.params.text &&
                styleConfig.params.text.fontSize) ||
              14;
            let offsetX =
              (styleConfig.params &&
                styleConfig.params.text &&
                styleConfig.params.text.offsetX) ||
              6;
            let offsetY =
              (styleConfig.params &&
                styleConfig.params.text &&
                styleConfig.params.text.offsetY) ||
              6;
            coord[0] += offsetX * resolution;
            coord[1] += offsetY * resolution;
            let coordOffsetX = ((fontSize + 1) * txt.length + 6) * resolution;
            let coordOffsetY = (fontSize + 6) * resolution;
            let rect = new ol.geom.Polygon([
              [
                coord,
                [coord[0] + coordOffsetX, coord[1]],
                [coord[0] + coordOffsetX, coord[1] + coordOffsetY],
                [coord[0], coord[1] + coordOffsetY],
                coord
              ]
            ]);
            // console.log(rotation);
            // var rect = new ol.geom.Polygon([
            //     [
            //         coord, [coord[0] + coordOffsetX*Math.cos(rotation), coord[1] + coordOffsetX*Math.sin(rotation)],
            //         [coord[0] + coordOffsetX*Math.cos(rotation) + coordOffsetY*Math.cos(Math.PI/2 + rotation), coord[1] +  coordOffsetX*Math.sin(rotation) + coordOffsetY*Math.sin(Math.PI/2 + rotation)],
            //         [coord[0] + coordOffsetY*Math.cos(Math.PI/2 + rotation), coord[1] + coordOffsetY*Math.sin(Math.PI/2 + rotation)], coord
            //     ]
            // ]);
            style = new ol.style.Style({
              geometry: rect,
              fill: new ol.style.Fill({
                color:
                  (styleConfig.params &&
                    styleConfig.params.fill &&
                    styleConfig.params.fill.color) ||
                  "#75BF20"
              }),
              text: new ol.style.Text({
                text: txt,
                font: fontSize + "px Microsoft YaHei,arial,sans-serif",
                rotation: rotation,
                fill: new ol.style.Fill({
                  color:
                    (styleConfig.params &&
                      styleConfig.params.text &&
                      styleConfig.params.text.fill &&
                      styleConfig.params.text.fill.color) ||
                    "#fff"
                })
              })
            });
          }
        } else if (styleConfig.type == "line") {
          let color, width;
          if (
            styleConfig.params &&
            styleConfig.params.limits &&
            styleConfig.params.limits instanceof Array
          ) {
            let length = styleConfig.params.limits.length;
            for (let i = 0; i < length; i++) {
              let limit = styleConfig.params.limits[i];
              let value = feature && feature.get(limit.key);
              if (
                value + "" == limit.value + "" ||
                (limit.value instanceof Array && value in limit.value)
              ) {
                color = limit.stroke && limit.stroke.color;
                width = limit.stroke && limit.stroke.width;
                break;
              }
            }

            // 没有则取默认
            if (!color) {
              color =
                styleConfig.params &&
                styleConfig.params.stroke &&
                styleConfig.params.stroke.color;
            }
            if (!width) {
              width =
                styleConfig.params &&
                styleConfig.params.stroke &&
                styleConfig.params.stroke.width;
            }
          } else {
            color =
              styleConfig.params &&
              styleConfig.params.stroke &&
              styleConfig.params.stroke.color;
            width =
              styleConfig.params &&
              styleConfig.params.stroke &&
              styleConfig.params.stroke.width;
          }
          color = isHighlight ? "red" : color;

          style = new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: color,
              width: width
            })
          });
        }
      }
      return style;
    };
    layer.setStyle(styleFunction);

    var highStyleFunction = function(feature) {
      return styleFunction.call(this, feature, true);
    };

    this._styleFunction = styleFunction; // feature平时style
    this._highStyleFunction = highStyleFunction; // feature高亮时的style

    this.layerConfigs = layerConfigs;
  }

  get styleFunction() {
    return this._styleFunction;
  }

  set styleFunction(val) {
    this._styleFunction = val;
  }

  get highStyleFunction() {
    return this._highStyleFunction;
  }

  set highStyleFunction(val) {
    this._highStyleFunction = val;
  }
}

export default AbstractVectorLayer;
