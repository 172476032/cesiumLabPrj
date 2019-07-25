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
    "name": "长江流域",
    "isRoot": true,
    "icon": def,
    "children": [{
        id: "10101",
        name: "水库",
        type: "VECTORTILE",
        geoType: "point",
        layerName: "bengzhan",
        visible: true,
        layerUrl: "/geoserver229/gwc/service/tms/1.0.0/new:bengzhan@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
        field: "CODE",
        vectorConfig: {
          zoom: 10,
          minZoomStyle: name => {
            return new Style({
              image: new Icon({
                src: shuiku,
                scale: 0.1
              })
            });
          },
          maxZoomStyle: name => {
            return new Style({
              image: new Icon({
                src: shuiku,
                scale: 0.5
              }),
              text: new Text({
                text: name,
                offsetY: -20,
                offsetX: 20,
                font: "5px sans-serif",
                padding: [5, 8, 5, 8],
                fill: new Fill({
                  color: "#00B5FF"
                }),
                stroke: new Stroke({
                  color: "#ffff",
                  width: 1
                })
              })
            });
          },
          hoverStyle: text => {
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
        "id": "10104",
        "name": "泵站",
        "isRoot": false,
        "icon": def,
        "type": "WMTS",
        "geoType": "point",
        "layerName": "bengzhan3857",
        "visible": true,
        "layerUrl": "/map229/rest/services/泵站3/MapServer/tile/{z}/{y}/{x}",
        "queryConfig": {
          "name": "泵站",
          "url": "/map229/rest/services/泵站3/MapServer/identify",
          "canquery": true
        }
      }
    ]
  }]
}]
