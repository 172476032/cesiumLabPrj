import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Text from 'ol/style/Text';
import Icon from "ol/style/Icon";
const shuiwenzhan = "./static/map/layertree/水文站.png"
const shuiwenzhanno = "./static/map/layertree/水文站no.png"
const shuiweizhan = "./static/map/layertree/水位站.png"
const shuiku = "./static/map/layertree/水库.png"
const yuliangzhan = "./static/map/layertree/雨量站.png"
const zhengfazhan = "./static/map/layertree/蒸发站.png"
const szjcz = "./static/map/layertree/水质监测站.png"
const liudongzhan = "./static/map/layertree/流动站.png"
const qixiangzhan = "./static/map/layertree/气象站.png"
const chenjizhan = "./static/map/layertree/沉积站.png"
const chaoweizhan = "./static/map/layertree/潮位站.png"
const shuidianzhan = "./static/map/layertree/水电站(大型).png"
const shuizha = "./static/map/layertree/水闸(大型不依).png"
const shuizhano = "./static/map/layertree/水闸(大型不依)去.png"
const bengzhan = "./static/map/layertree/泵站.png"
const shuizhizhan = "./static/map/layertree/地下水观测站.png"
const hanzha = "./static/map/layertree/涵闸.png"
const def = "./static/map/layertree/潮位站.png"

//样式
//长江流域综合规划----一级水功能区划
const sgnqhStyle = {
  protect: "RGB(111,186,44)", //保护区
  retain: "RGB(38,73,157)", //保留
  buffer: "RGB(229,230,71)" //缓冲
}

const egdrZoom = 10;
const egdrMin = 0.35;
const egdrMax = 0.5;
const egdrHover = 0.6;
let scale = 0.1;


export default [{
    "id": 1,
    "name": "设计院",
    "isRoot": true,
    "icon": def,
    "children": [{
        "id": 101,
        "name": "水利对象",
        "isRoot": true,
        "icon": def,
        "children": [{
            "id": "10101",
            "name": "水库",
            "isRoot": false,
            "icon": shuiku,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "cjliuyushuiku",
            "visible": false,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/new:cjshuiku85@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 0,
              labelField: "测站名",
              minZoomStyle: (text, zoom) => {
                return new Style({
                  image: new Icon({
                    src: shuiku,
                    scale: 0.3
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuiku,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "5px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#00B5FF",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuiku,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#00B5FF",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10102",
            "name": "雨量站",
            "isRoot": false,
            "icon": yuliangzhan,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "cjyuliangzhan",
            "visible": false,
            "declutter": true,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:cjyuliangzhan@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 10,
              labelField: "STNM",
              minZoomStyle: (text, zoom) => {
                if (zoom >= 8 && zoom < 9) {
                  scale = 0.2
                } else if (zoom >= 9 && zoom < 10) {
                  scale = 0.3
                }
                return new Style({
                  image: new Icon({
                    src: yuliangzhan,
                    scale: scale
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: yuliangzhan,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "red",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: yuliangzhan,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "red",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          }, {
            "id": "10103",
            "name": "水文站",
            "isRoot": false,
            "icon": shuiwenzhan,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "swzwgs",
            "visible": false,
            "declutter": true,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:swzwgs@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 10,
              labelField: "测站名",
              minZoomStyle: (text, zoom) => {
                return new Style({
                  image: new Icon({
                    src: shuiwenzhanno,
                    scale: 0.2
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuiwenzhan,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "red",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuiwenzhan,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "red",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10104",
            "name": "河流",
            "isRoot": false,
            "icon": def,
            "type": "WMTS",
            "geoType": "line",
            "layerName": "cjriver",
            "visible": true,
            "layerUrl": "/map172166/rest/services/basemap/cjriver/MapServer/tile/{z}/{y}/{x}",
            "queryConfig": {
              "name": "河流",
              "url": "/map172166/rest/services/basemap/cjriver/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "10106",
            "name": "水闸",
            "isRoot": false,
            "icon": shuizha,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "cjwshuizha3857",
            "visible": false,
            "declutter": true,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:shuizha3857@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 14,
              labelField: "MC",
              minZoomStyle: (text, zoom) => {
                if (zoom < 11) {
                  scale = 0.05
                } else if (zoom >= 11) {
                  scale = 0.2
                }
                return new Style({
                  image: new Icon({
                    src: yuliangzhan,
                    scale: scale
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuizha,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#FC4F44",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuizha,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#FC4F44",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10107",
            "name": "泵站",
            "isRoot": false,
            "icon": bengzhan,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "cjwbengzhan3857",
            "visible": false,
            "declutter": true,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:bengzhan3857@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 13,
              labelField: "MC",
              minZoomStyle: (text, zoom) => {
                if (zoom <= 7) {
                  scale = 0.07
                } else if (zoom < 9 && zoom >= 8) {
                  scale = 0.13
                } else if (zoom < 11 && zoom >= 9) {
                  scale = 0.2
                } else if (zoom >= 11 && zoom < 12) {
                  scale = 0.3
                } else if (zoom >= 12 && zoom < 13) {
                  scale = 0.4
                }
                return new Style({
                  image: new Icon({
                    src: yuliangzhan,
                    scale: scale
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: bengzhan,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#2DA7F7",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: bengzhan,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#2DA7F7",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10187",
            "name": "取水口",
            "isRoot": false,
            "icon": hanzha,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "newqushuikou",
            "visible": false,
            "declutter": true,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/new:qushuikou@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 13,
              labelField: "NAME",
              minZoomStyle: (text, zoom) => {
                if (zoom >= 8 && zoom < 9) {
                  scale = 0.2
                } else if (zoom >= 9 && zoom < 10) {
                  scale = 0.3
                }
                return new Style({
                  image: new Icon({
                    src: yuliangzhan,
                    scale: scale
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: hanzha,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#FF524F",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: hanzha,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#FF524F",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10146",
            "name": "蓄滞洪区分布",
            "isRoot": false,
            "icon": def,
            "type": "VECTORTILE",
            "geoType": "polygon",
            "layerName": "newcjXZHQnew1",
            "visible": false,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/new:cjXZHQnew1@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 0,
              labelField: "XZHQMC",
              uuId: "XZHQDM", //唯一标识，判断鼠标点选和pointmove时获取的唯一属性，用于图层重新刷新时重置所有带着个属性要素的样式
              maxZoomStyle: (text, zoom, feature, selection) => {
                var selected = !!selection[feature.get("XZHQDM")];
                return new Style({
                  stroke: new Stroke({
                    color: selected ? 'rgba(255,0,0,1)' : 'rgba(255,0,0,1)',
                    width: selected ? 2 : 1
                  }),
                  fill: new Fill({
                    color: selected ? 'rgba(255,0,0,0.6)' : 'rgba(255,0,0,0.2)'
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#FC4F44",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          }
        ]
      }, {
        "id": 105,
        "name": "一般对象",
        "isRoot": true,
        "icon": def,
        "children": [{
            "id": "10509",
            "name": "水资源分区",
            "isRoot": false,
            "icon": def,
            "type": "WMTS",
            "geoType": "polygon",
            "layerName": "shuiziyuan",
            "visible": false,
            "layerUrl": "/map178/rest/services/cjcenter/水资源分区/MapServer/tile/{z}/{y}/{x}",
            "queryConfig": {
              "name": "水资源分区",
              "url": "/map178/rest/services/cjcenter/水资源分区/MapServer/identify",
              "canquery": false
            }
          },
          {
            "id": "10510",
            "name": "省级行政区",
            "isRoot": false,
            "icon": def,
            "type": "WMTS",
            "geoType": "polygon",
            "layerName": "cjxzqh",
            "visible": false,
            "layerUrl": "/map178/rest/services/cjcenter/长江流域省级行政区/MapServer/tile/{z}/{y}/{x}",
            "queryConfig": {
              "name": "省级行政区",
              "url": "/map178/rest/services/cjcenter/长江流域省级行政区/MapServer/identify",
              "canquery": false
            }
          }
        ]
      }, {
        "id": 104,
        "name": "长江流域综合规划",
        "isRoot": true,
        "icon": def,
        "children": [{
          "id": "10401",
          "name": "一级水功能区划",
          "isRoot": false,
          "icon": def,
          "type": "VECTORTILE",
          "geoType": "line",
          "layerName": "oneshuigongnengqu",
          "visible": false,
          "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/new:sgnqhone@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
          vectorConfig: {
            zoom: 0,
            labelField: "NAME",
            uuId: "OBJCODE", //唯一标识，判断鼠标点选和pointmove时获取的唯一属性，用于图层重新刷新时重置所有带着个属性要素的样式
            maxZoomStyle: (text, zoom, feature, selection, props) => {
              var selected = !!selection[feature.get("OBJCODE")],
                type = props["F2"];
              // console.log('type: ', type, props, selected);

              return new Style({
                stroke: new Stroke({
                  color: selected ? 'rgba(255,0,0,1)' : type == "保留区" ? sgnqhStyle.retain : type == "保护区" ? sgnqhStyle.protect : sgnqhStyle.buffer,
                  width: selected ? 4 : 2
                })
              });
            }
          }
        }]
      },
      {
        "id": 102,
        "name": "厄瓜多尔水资源综合规划",
        "isRoot": true,
        "icon": def,
        "children": [{
            "id": "10201",
            "name": "水库",
            "isRoot": false,
            "icon": shuiku,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "egdrshuiku",
            "visible": false,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:shuiku@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 10,
              labelField: "cod",
              minZoomStyle: (text, zoom) => {
                return new Style({
                  image: new Icon({
                    src: shuiku,
                    scale: egdrMin
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuiku,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#00B5FF",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuiku,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#00B5FF"
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10202",
            "name": "水体",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "polygon",
            "layerName": "egder00",
            "wmsLayerNames": "0",
            "visible": false,
            "layerUrl": "/map178/services/cjcenter/厄瓜多尔/MapServer/WMSServer",
            "queryConfig": {
              "name": "水体",
              "url": "/map178/rest/services/cjcenter/厄瓜多尔/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "10203",
            "name": "主要水体",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "polygon",
            "layerName": "egder02",
            "wmsLayerNames": "2",
            "visible": false,
            "layerUrl": "/map178/services/cjcenter/厄瓜多尔/MapServer/WMSServer",
            "queryConfig": {
              "name": "主要水体",
              "url": "/map178/rest/services/cjcenter/厄瓜多尔/MapServer/identify",
              "canquery": true
            }
          },

          {
            "id": "10204",
            "name": "水文站",
            "isRoot": false,
            "icon": shuiwenzhan,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "egdrshuiwenzhan",
            "visible": false,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:shuiwenzhan@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 10,
              labelField: "nombre",
              minZoomStyle: (text, zoom) => {
                return new Style({
                  image: new Icon({
                    src: shuiwenzhanno,
                    scale: egdrMin
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuiwenzhan,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "red",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuiwenzhan,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "red"
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10205",
            "name": "降水站",
            "isRoot": false,
            "icon": yuliangzhan,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "egdrjiangshuizhan",
            "visible": false,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:jiangshuizhan@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 10,
              labelField: "STNM",
              minZoomStyle: (text, zoom) => {
                return new Style({
                  image: new Icon({
                    src: yuliangzhan,
                    scale: egdrMin
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: yuliangzhan,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "red",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: yuliangzhan,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "red"
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10206",
            "name": "流动站",
            "isRoot": false,
            "icon": liudongzhan,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "egdrliudongzhan",
            "visible": false,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:liudongzhan@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 10,
              labelField: "cod",
              minZoomStyle: (text, zoom) => {
                return new Style({
                  image: new Icon({
                    src: liudongzhan,
                    scale: egdrMin
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: liudongzhan,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#4BE1BF",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: liudongzhan,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#4BE1BF"
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10207",
            "name": "气象站",
            "isRoot": false,
            "icon": qixiangzhan,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "egdrqixiangzhant",
            "visible": false,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:qixiangzhant@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 10,
              labelField: "nombre",
              minZoomStyle: (text, zoom) => {
                return new Style({
                  image: new Icon({
                    src: qixiangzhan,
                    scale: egdrMin
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: qixiangzhan,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#4BE1BF",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: qixiangzhan,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#4C5EE4"
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10208",
            "name": "规划水质站",
            "isRoot": false,
            "icon": shuizhizhan,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "egdrghshuizhizhan",
            "visible": false,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:ghshuizhizhan@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 10,
              labelField: "nombre",
              minZoomStyle: (text, zoom) => {
                return new Style({
                  image: new Icon({
                    src: shuizhizhan,
                    scale: egdrMin
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuizhizhan,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#00B5FF",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuizhizhan,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#00B5FF"
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10209",
            "name": "规划沉积站",
            "isRoot": false,
            "icon": chenjizhan,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "egdrghchenjizhan",
            "visible": false,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:ghchenjizhan@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 10,
              labelField: "cod",
              minZoomStyle: (text, zoom) => {
                return new Style({
                  image: new Icon({
                    src: chenjizhan,
                    scale: egdrMin
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: chenjizhan,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#7C4B40",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: chenjizhan,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#7C4B40"
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10210",
            "name": "规划水位站",
            "isRoot": false,
            "icon": shuiweizhan,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "egdrghshuiweizhan",
            "visible": false,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:ghshuiweizhan@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 10,
              labelField: "cod",
              minZoomStyle: (text, zoom) => {
                return new Style({
                  image: new Icon({
                    src: shuiweizhan,
                    scale: egdrMin
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuiweizhan,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#7C4B40",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: shuiweizhan,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#7C4B40"
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10211",
            "name": "规划蒸发站",
            "isRoot": false,
            "icon": zhengfazhan,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "egdrghzhengfazhan",
            "visible": false,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:ghzhengfazhan@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 10,
              labelField: "STNM",
              minZoomStyle: (text, zoom) => {
                return new Style({
                  image: new Icon({
                    src: zhengfazhan,
                    scale: egdrMin
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: zhengfazhan,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#09D8D8",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: zhengfazhan,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#09D8D8"
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10212",
            "name": "水文分析",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "line",
            "layerName": "egder05",
            "wmsLayerNames": "5",
            "visible": false,
            "layerUrl": "/map178/services/cjcenter/厄瓜多尔/MapServer/WMSServer",
            "queryConfig": {
              "name": "水文分析",
              "url": "/map178/rest/services/cjcenter/厄瓜多尔/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "10213",
            "name": "主要河流",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "line",
            "layerName": "egder07",
            "wmsLayerNames": "7",
            "visible": false,
            "layerUrl": "/map178/services/cjcenter/厄瓜多尔/MapServer/WMSServer",
            "queryConfig": {
              "name": "主要河流",
              "url": "/map178/rest/services/cjcenter/厄瓜多尔/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "10214",
            "name": "主要城市",
            "isRoot": false,
            "icon": zhengfazhan,
            "type": "VECTORTILE",
            "geoType": "point",
            "layerName": "egdrzhuyaochengshi",
            "visible": false,
            "layerUrl": "/geoserver166/gwc/service/tms/1.0.0/test:zhuyaochengshi@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            vectorConfig: {
              zoom: 10,
              labelField: "nombre",
              minZoomStyle: (text, zoom) => {
                return new Style({
                  image: new Icon({
                    src: zhengfazhan,
                    scale: egdrMin
                  })
                })
              },
              maxZoomStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: zhengfazhan,
                    scale: 0.5
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#09D8D8",
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 1
                    })
                  })
                })
              },
              hoverStyle: (text) => {
                return new Style({
                  image: new Icon({
                    src: zhengfazhan,
                    scale: 0.6
                  }),
                  text: new Text({
                    text: text,
                    offsetY: -20,
                    offsetX: 20,
                    font: "bold 13px sans-serif",
                    padding: [5, 8, 5, 8],
                    fill: new Fill({
                      color: "#09D8D8"
                    }),
                    stroke: new Stroke({
                      color: "#ffff",
                      width: 0
                    })
                  })
                });
              }
            }
          },
          {
            "id": "10215",
            "name": "国家公路网",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "line",
            "layerName": "egder6",
            "wmsLayerNames": "6",
            "visible": false,
            "layerUrl": "/map178/services/cjcenter/厄瓜多尔/MapServer/WMSServer",
            "queryConfig": {
              "name": "国家公路网",
              "url": "/map178/rest/services/cjcenter/厄瓜多尔/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "10216",
            "name": "省界",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "polygon",
            "layerName": "egder3",
            "wmsLayerNames": "3",
            "visible": false,
            "layerUrl": "/map178/services/cjcenter/厄瓜多尔/MapServer/WMSServer",
            "queryConfig": {
              "name": "省界",
              "url": "/map178/rest/services/cjcenter/厄瓜多尔/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "10217",
            "name": "边界",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "polygon",
            "layerName": "egder4",
            "wmsLayerNames": "4",
            "visible": false,
            "layerUrl": "/map178/services/cjcenter/厄瓜多尔/MapServer/WMSServer",
            "queryConfig": {
              "name": "边界",
              "url": "/map178/rest/services/cjcenter/厄瓜多尔/MapServer/identify",
              "canquery": true
            }
          }
        ]
      }
    ]
  },
  {
    "id": 2,
    "name": "长江委水利一张图",
    "isRoot": true,
    "icon": def,
    "children": [{
        "id": 201,
        "name": "水体",
        "isRoot": true,
        "icon": def,
        "children": [{
            "id": "20101",
            "name": "一级河流",
            "isRoot": false,
            "icon": def,
            "type": "WMTS",
            "geoType": "line",
            "layerName": "RV_V",
            "visible": false,
            "layerUrl": "/map116/rest/services/WATER/RV_V/MapServer/WMTS?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=RV_V&STYLE=default&FORMAT=tiles&TILEMATRIXSET=default028mm&OFFLEVEL=4&TileMatrix={z}&TileRow={y}&TileCol={x}",
            "queryConfig": {
              "name": "一级河流",
              "url": "/map116/rest/services/WATER/RV_V/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20102",
            "name": "湖泊",
            "isRoot": false,
            "icon": def,
            "type": "WMTS",
            "geoType": "polygon",
            "layerName": "LK_V",
            "visible": false,
            "layerUrl": "/map116/rest/services/WATER/LK_V/MapServer/WMTS?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=LK_V&STYLE=default&FORMAT=tiles&TILEMATRIXSET=default028mm&OFFLEVEL=4&TileMatrix={z}&TileRow={y}&TileCol={x}",
            "queryConfig": {
              "name": "湖泊",
              "url": "/map116/rest/services/WATER/LK_V/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20103",
            "name": "洲滩",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "point",
            "layerName": "ZT_V",
            "wmsLayerNames": "0",
            "visible": false,
            "layerUrl": "/map116/services/ZT_V/MapServer/WmsServer",
            "queryConfig": {
              "name": "洲滩",
              "url": "/map116/rest/services/ZT_V/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20104",
            "name": "河段",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "line",
            "layerName": "HDZL_V",
            "wmsLayerNames": "0",
            "visible": false,
            "layerUrl": "/map116/services/HDZL_V/MapServer/WmsServer",
            "queryConfig": {
              "name": "河段",
              "url": "/map116/rest/services/HDZL_V/MapServer/identify",
              "canquery": true
            }
          }
        ]
      },
      {
        "id": 202,
        "name": "水利工程",
        "isRoot": true,
        "icon": def,
        "children": [{
            "id": "20201",
            "name": "泵站",
            "isRoot": false,
            "icon": bengzhan,
            "type": "WMTS",
            "geoType": "point",
            "layerName": "PUST_R",
            "visible": false,
            "layerUrl": "/map116/rest/services/WATER/PUST_R/MapServer/WMTS?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=PUST_R&STYLE=default&FORMAT=tiles&TILEMATRIXSET=default028mm&OFFLEVEL=4&TileMatrix={z}&TileRow={y}&TileCol={x}",
            "queryConfig": {
              "name": "泵站",
              "url": "/map116/rest/services/WATER/PUST_R/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20202",
            "name": "灌区工程",
            "isRoot": false,
            "icon": def,
            "type": "WMTS",
            "geoType": "point",
            "layerName": "IRR_V",
            "visible": false,
            "layerUrl": "/map116/rest/services/WATER/IRR_V/MapServer/WMTS?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=IRR_V&STYLE=default&FORMAT=tiles&TILEMATRIXSET=default028mm&OFFLEVEL=4&TileMatrix={z}&TileRow={y}&TileCol={x}",
            "queryConfig": {
              "name": "灌区工程",
              "url": "/map116/rest/services/WATER/IRR_V/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20203",
            "name": "水闸",
            "isRoot": false,
            "icon": shuizha,
            "type": "WMTS",
            "geoType": "point",
            "layerName": "WAGA_R",
            "visible": false,
            "layerUrl": "/map116/rest/services/WATER/WAGA_R/MapServer/WMTS?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=WAGA_R&STYLE=default&FORMAT=tiles&TILEMATRIXSET=default028mm&OFFLEVEL=4&TileMatrix={z}&TileRow={y}&TileCol={x}",
            "queryConfig": {
              "name": "水闸",
              "url": "/map116/rest/services/WATER/WAGA_R/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20204",
            "name": "引调水工程",
            "isRoot": false,
            "icon": def,
            "type": "WMTS",
            "geoType": "point",
            "layerName": "WADI_V",
            "visible": false,
            "layerUrl": "/map116/rest/services/WATER/WADI_V/MapServer/WMTS?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=WADI_V&STYLE=default&FORMAT=tiles&TILEMATRIXSET=default028mm&OFFLEVEL=4&TileMatrix={z}&TileRow={y}&TileCol={x}",
            "queryConfig": {
              "name": "引调水工程",
              "url": "/map116/rest/services/WATER/WADI_V/MapServer/identify",
              "canquery": true
            }
          }
        ]
      },
      {
        "id": 203,
        "name": "区划",
        "isRoot": true,
        "icon": def,
        "children": [{
            "id": "20301",
            "name": "水功能区",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "point",
            "layerName": "WFZ_R",
            "wmsLayerNames": "1,3,5,7,9,11,13,15",
            "visible": false,
            "layerUrl": "/map116/services/WATER/WFZ_R/MapServer/WmsServer",
            "queryConfig": {
              "name": "水功能区",
              "url": "/map116/rest/services/WATER/WFZ_R/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20302",
            "name": "种质资源保护区",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "point",
            "layerName": "ZZZYBHQ_V",
            "wmsLayerNames": "0,1",
            "visible": false,
            "layerUrl": "/map116/services/ZZZYBHQ_V/MapServer/WmsServer",
            "queryConfig": {
              "name": "种质资源保护区",
              "url": "/map116/rest/services/ZZZYBHQ_V/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20303",
            "name": "自然保护区",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "point",
            "layerName": "ZRBHQ_V",
            "wmsLayerNames": "0,1",
            "visible": false,
            "layerUrl": "/map116/services/ZRBHQ_V/MapServer/WmsServer",
            "queryConfig": {
              "name": "自然保护区",
              "url": "/map116/rest/services/ZRBHQ_V/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20304",
            "name": "长江流域区划",
            "isRoot": false,
            "icon": def,
            "type": "WMTS",
            "geoType": "line",
            "layerName": "CJLYP",
            "visible": false,
            "layerUrl": "/map116/rest/services/BASE/CJLYP/MapServer/WMTS?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=BASE_CJLYP&STYLE=default&FORMAT=tiles&TILEMATRIXSET=default028mm&OFFLEVEL=4&grantKey=B3320E6CC5394828B87E69E72B80A349&TileMatrix={z}&TileRow={y}&TileCol={x}",
            "queryConfig": {
              "name": "长江流域区划",
              "url": "/map116/rest/services/BASE/CJLYP/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20305",
            "name": "长江流域区划注记",
            "isRoot": false,
            "icon": def,
            "type": "WMTS",
            "geoType": "point",
            "layerName": "LYZJ_V",
            "visible": false,
            "layerUrl": "/map116/rest/services/BASE/LYZJ_V/MapServer/WMTS?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=BASE_LYZJ_V&STYLE=default&FORMAT=tiles&TILEMATRIXSET=default028mm&OFFLEVEL=4&TileMatrix={z}&TileRow={y}&TileCol={x}",
            "queryConfig": {
              "name": "长江流域区划注记",
              "url": "/map252/MapServer/BASE/CJLYP/identify",
              "canquery": false
            }
          }
        ]
      },
      {
        "id": 204,
        "name": "涉水建筑物",
        "isRoot": true,
        "icon": def,
        "children": [{
            "id": "20401",
            "name": "水库",
            "isRoot": false,
            "icon": shuiku,
            "type": "WMTS",
            "geoType": "polygon",
            "layerName": "RES_V",
            "visible": false,
            "layerUrl": "/map116/rest/services/WATER/RES_V/MapServer/WMTS?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=RES_V&STYLE=default&FORMAT=tiles&TILEMATRIXSET=default028mm&OFFLEVEL=4&TileMatrix={z}&TileRow={y}&TileCol={x}",
            "queryConfig": {
              "name": "水库",
              "url": "/map116/rest/services/WATER/RES_V/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20402",
            "name": "火电厂",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "point",
            "layerName": "HDC_V",
            "wmsLayerNames": "0",
            "visible": false,
            "layerUrl": "/map116/services/HDC_V/MapServer/WmsServer",
            "queryConfig": {
              "name": "火电厂",
              "url": "/map116/rest/services/HDC_V/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20403",
            "name": "桥梁",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "point",
            "layerName": "QL_V",
            "wmsLayerNames": "0,1",
            "visible": false,
            "layerUrl": "/map116/services/QL_V/MapServer/WmsServer",
            "queryConfig": {
              "name": "桥梁",
              "url": "/map116/rest/services/QL_V/MapServer/identify",
              "canquery": true
            }
          }
        ]
      },
      {
        "id": 205,
        "name": "水文气象",
        "isRoot": true,
        "icon": def,
        "children": [{
            "id": "20501",
            "name": "特征水位",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "point",
            "layerName": "TZSW_V",
            "wmsLayerNames": "0",
            "visible": false,
            "layerUrl": "/map116/services/TZSW_V/MapServer/WmsServer",
            "queryConfig": {
              "name": "特征水位",
              "url": "/map116/rest/services/TZSW_V/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20502",
            "name": "特征流量",
            "isRoot": false,
            "icon": def,
            "type": "WMS",
            "geoType": "point",
            "layerName": "TZLL_V",
            "wmsLayerNames": "0",
            "visible": false,
            "layerUrl": "/map116/services/TZLL_V/MapServer/WmsServer",
            "queryConfig": {
              "name": "特征流量",
              "url": "/map116/rest/services/TZLL_V/MapServer/identify",
              "canquery": true
            }
          }
        ]
      },
      {
        "id": 206,
        "name": "水事及水行政",
        "isRoot": true,
        "icon": def,
        "children": [{
            "id": "20601",
            "name": "水利企业",
            "isRoot": false,
            "icon": def,
            "type": "WMTS",
            "geoType": "point",
            "layerName": "WAEN_R",
            "visible": false,
            "layerUrl": "/map116/rest/services/WATER/WAEN_R/MapServer/WMTS?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=WAEN_R&STYLE=default&FORMAT=tiles&TILEMATRIXSET=default028mm&OFFLEVEL=4&TileMatrix={z}&TileRow={y}&TileCol={x}",
            "queryConfig": {
              "name": "水利企业",
              "url": "/map116/rest/services/WATER/WAEN_R/MapServer/identify",
              "canquery": true
            }
          },
          {
            "id": "20602",
            "name": "水利事业单位",
            "isRoot": false,
            "icon": def,
            "type": "WMTS",
            "geoType": "point",
            "layerName": "WAIS_R",
            "visible": false,
            "layerUrl": "/map116/rest/services/WATER/WAIS_R/MapServer/WMTS?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=WAIS_R&STYLE=default&FORMAT=tiles&TILEMATRIXSET=default028mm&OFFLEVEL=4&TileMatrix={z}&TileRow={y}&TileCol={x}",
            "queryConfig": {
              "name": "水利事业单位",
              "url": "/map116/rest/services/WATER/WAIS_R/MapServer/identify",
              "canquery": true
            }
          }
        ]
      }
    ]
  }
]
