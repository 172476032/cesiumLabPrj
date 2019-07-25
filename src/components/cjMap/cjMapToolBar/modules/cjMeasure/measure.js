import config from "@/script/config.js";
//图形
import Point from "ol/geom/Point"
import LineString from "ol/geom/LineString"
import Polygon from "ol/geom/Polygon"
//图层
import VectorLayer from 'ol/layer/Vector';
//图层资源
import VectorSource from 'ol/source/Vector';
//样式
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import CircleStyle from "ol/style/Circle";
//绘图
import Draw from 'ol/interaction/Draw';

//覆盖物
import Overlay from "ol/Overlay"

//事件
import {
  unByKey
} from "ol/Observable"




export default {
  data() {
    return {
      drawType: "",
      measureDrawSource: null,
      measureHelpOverlay: null,
      measureDrawVectorLayer: null
    };
  },
  computed: {
    map() {
      return this.$store.getters.map; //openlayers地图对象
    }
  },
  methods: {
    /**
     * Format length output.未进行投影转换
     * @param {LineString} line The line.
     * @return {string} The formatted length.
     */
    formatLength(line) {
      var newLine = line.clone();
      var curPrj = this.map.getView().getProjection();
      newLine = newLine.transform(curPrj, "EPSG:3857");
      var length = Math.round(newLine.getLength() * 100) / 100;
      var output;
      if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + " " + "km";
      } else {
        output = Math.round(length * 100) / 100 + " " + "m";
      }
      return output;
    },
    /**
     * Format area output.
     * @param {Polygon} polygon The polygon.
     * @return {string} Formatted area.
     */
    formatArea(polygon) {
      var newPolygon = polygon.clone();
      var curPrj = this.map.getView().getProjection();
      newPolygon = newPolygon.transform(curPrj, "EPSG:3857");
      var area = newPolygon.getArea();
      var output;
      if (area > 10000) {
        output =
          Math.round((area / 1000000) * 100) / 100 + " " + "km<sup>2</sup>";
      } else {
        output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>";
      }
      return output;
    },
    formatTipTxt(geom) {
      if (geom instanceof LineString) {
        return this.formatLength(geom);
      } else if (geom instanceof Polygon) {
        return this.formatArea(geom);
      } else {
        return "";
      }
    },
    createVertexStyle(pt) {
      return new Style({
        geometry: new Point(pt),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: "#fa5958",
            width: 2
          }),
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.7)"
          })
        })
      });
    },
    createMeasureHelpOverlay(tip) {
      if (this.measureHelpOverlay) {
        let dom = this.measureHelpOverlay.getElement();
        if (dom) {
          dom.innerHTML = `<p>共计 ${tip}</p><p>单击继续，双击结束</p>`;
          return this.measureHelpOverlay;
        }
      } else {
        let measureHelpElm = document.createElement("div");
        measureHelpElm.className = "cj-toolbar-measure-tip";
        measureHelpElm.innerHTML = `<p>共计 ${tip}</p><p>单击继续，双击结束</p>`;
        this.measureHelpOverlay = new Overlay({
          element: measureHelpElm,
          offset: [0, 5],
          stopEvent: false
        });
        config["$STORE"].state.map.mapOverlay.push(this.measureHelpOverlay);
        return this.measureHelpOverlay;
      }
    },

    createMeasureTipOverlay(tip, feature) {
      let _measureTooltipElement = document.createElement("div");
      _measureTooltipElement.className = "cj-toolbar-measure-tip";
      _measureTooltipElement.innerHTML = tip;
      let _measureToolTip = new Overlay({
        element: _measureTooltipElement,
        offset: [0, 5],
        stopEvent: false
      });
      _measureToolTip.set("featureId", feature.getId());
      config["$STORE"].state.map.mapOverlay.push(_measureToolTip);
      return _measureToolTip;
    },

    createEndTipOverlay(tip, feature, source, map) {
      let _measureTooltipElement = document.createElement("div");
      _measureTooltipElement.className = "cj-toolbar-measure-tip";
      _measureTooltipElement.innerHTML = `<span">共计 ${tip}</span>`;
      // let destroyElm = document.createElement("i");
      // destroyElm.setAttribute("class", "ivu-icon md-train");
      let destroyElm = document.createElement("img");
      destroyElm.setAttribute("src", "../../../static/map/toolbar/destroy.png");
      destroyElm.style.cssText = "margin: -3px 5px;";
      destroyElm.addEventListener("click", () => {
        if (source && source.removeFeature) {
          source.removeFeature(feature);
          let overlayArr = map.getOverlays().getArray();
          let overlays = overlayArr.filter(v => {
            return v.get("featureId") === feature.getId();
          });
          console.log("overlay to be removed", overlays, overlayArr);
          overlays.forEach(v => {
            map.removeOverlay(v);
          });
          if (source.getFeatures().length === 0) {
            map.removeLayer(this.measureDrawVectorLayer);
            console.log("map layers", map.getLayers());
          }
        }
      });
      _measureTooltipElement.appendChild(destroyElm);
      let _measureToolTip = new Overlay({
        element: _measureTooltipElement,
        offset: [0, 5],
        stopEvent: false
      });
      _measureToolTip.set("featureId", feature.getId());
      config["$STORE"].state.map.mapOverlay.push(_measureToolTip);
      return _measureToolTip;
    },
    uuid() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
        c
      ) {
        var r = (Math.random() * 16) | 0;
        var v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    addInteraction() {
      let map = this.map;
      let draw = new Draw({
        source: this.measureDrawSource,
        type: this.drawType,
        style: f => {
          let geom = f.getGeometry();
          let styles = [
            new Style({
              stroke: new Stroke({
                color: "#fa5958",
                lineDash: [10, 10],
                width: 2
              }),
              image: new CircleStyle({
                radius: 5,
                stroke: new Stroke({
                  color: "rgba(0, 0, 0, 0.7)"
                }),
                fill: new Fill({
                  color: "rgba(255, 255, 255, 0.2)"
                })
              }),
              fill: new Fill({
                color: "rgba(255, 255, 255, 0.2)"
              })
            })
          ];
          if (geom.getCoordinates) {
            geom.getCoordinates().forEach(coord => {
              styles.push(this.createVertexStyle(coord));
            });
          }
          return styles;
        },
        condition: function (evt) {
          // 限制只有左键点击 才能测距
          var button = evt.originalEvent.button;
          // console.log(button)
          return button === 0;
        }
      });
      map.addInteraction(draw);

      let measureOnDrawChangeListener = null;
      let mapClickForMeasureListener = null;

      draw.on(
        "drawstart",
        e => {
          let feature = e.feature;
          feature.setId(this.uuid());
          let tooltipCoord = e.coordinate;
          let isFirst = true;
          let geom = feature.getGeometry();
          if (map) {
            mapClickForMeasureListener = map.on(
              "singleclick",
              e => {
                let coord = e.coordinate;
                if (geom instanceof LineString) {
                  let tipTxt = isFirst ? "起点" : this.formatTipTxt(geom);
                  isFirst = false;
                  let tipOverlay = this.createMeasureTipOverlay(
                    tipTxt,
                    feature
                  );
                  tipOverlay.setPosition(coord);
                  map.addOverlay(tipOverlay);
                }
              },
              this
            );
            let helpOverlay = this.createMeasureHelpOverlay("");
            helpOverlay.setPosition();
            map.addOverlay(helpOverlay);
          }
          measureOnDrawChangeListener = feature
            .getGeometry()
            .on("change", evt => {
              let geom = evt.target;
              let tipTxt = this.formatTipTxt(geom);
              if (geom instanceof Polygon) {
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
              } else if (geom instanceof LineString) {
                tooltipCoord = geom.getLastCoordinate();
              }
              if (map) {
                let helpOverlay = this.createMeasureHelpOverlay(tipTxt);
                helpOverlay.setPosition(tooltipCoord);
              }
            });
        },
        this
      );
      draw.on(
        "drawend",
        e => {
          if (map && map.removeInteraction) {
            setTimeout(() => {
              map.removeInteraction(draw);
            }, 300);
            e.stopPropagation();
          }
          if (measureOnDrawChangeListener)
            unByKey(measureOnDrawChangeListener);
          if (mapClickForMeasureListener)
            unByKey(mapClickForMeasureListener);
          if (this.measureHelpOverlay) {
            map.removeOverlay(this.measureHelpOverlay);
            this.measureHelpOverlay = null;
          }
          if (map) {
            let feature = e.feature;
            console.log("draw end feature id", feature.getId());
            let geom = feature.getGeometry();
            let tipTxt = this.formatTipTxt(geom);
            let endTipOverlay = this.createEndTipOverlay(
              tipTxt,
              feature,
              this.measureDrawSource,
              map
            );
            let tooltipCoord = e.coordinate;
            if (geom instanceof Polygon) {
              tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof LineString) {
              tooltipCoord = geom.getLastCoordinate();
            }
            endTipOverlay.setPosition(tooltipCoord);
            endTipOverlay.getElement().parentNode.style.zIndex = 100;
            map.addOverlay(endTipOverlay);
          }
        },
        this
      );
    },
    init() {
      this.measureDrawSource = new VectorSource();
      this.measureDrawVectorLayer = new VectorLayer({
        source: this.measureDrawSource,
        name: "measure_draw_vector_layer",
        style: f => {
          let geom = f.getGeometry();
          let styles = [
            new Style({
              stroke: new Stroke({
                color: "#fa5958",
                width: 2
              }),
              image: new CircleStyle({
                radius: 5,
                stroke: new Stroke({
                  color: "rgba(0, 0, 0, 0.7)"
                }),
                fill: new Fill({
                  color: "rgba(255, 255, 255, 0.2)"
                })
              }),
              fill: new Fill({
                color: "rgba(255, 255, 255, 0.2)"
              })
            })
          ];
          if (geom.getCoordinates) {
            if (geom instanceof LineString) {
              geom.getCoordinates().forEach(coord => {
                styles.push(this.createVertexStyle(coord));
              });
            } else if (geom instanceof Polygon) {
              geom.getCoordinates().forEach(arr => {
                arr.forEach(coord => {
                  styles.push(this.createVertexStyle(coord));
                });
              });
            }
          }
          return styles;
        }
      });
      this.measureDrawVectorLayer.setZIndex(1000);
      this.map.addLayer(this.measureDrawVectorLayer);
      //添加到图层管理容器内
      config["$STORE"].state.map.renderLayers.push(
        this.measureDrawVectorLayer
      );
      this.addInteraction();

      var target = this.map.getTarget();
      if (document.attachEvent) {
        target.attachEvent("onkeydown", this.keydownHandler);
      } else {
        document.addEventListener("keydown", this.keydownHandler);
      }
    },
    keydownHandler(e) {
      if (e.key == "Escape" && this.sketch) {
        // 移除上一个点
        this.draw.removeLastPoint();
        var geom = this.sketch.getGeometry();
        var coordinates = geom.getCoordinates();
        console.log(coordinates);
        if (
          (geom instanceof LineString && coordinates.length === 1) ||
          (geom instanceof Polygon && coordinates[0].length === 3)
        ) {
          this.map.removeOverlay(this.measureTooltip);
          this.draw.finishDrawing();
        }
      }
    }
  }
};
