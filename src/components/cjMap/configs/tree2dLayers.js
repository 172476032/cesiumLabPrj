import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import Icon from 'ol/style/Icon';
const shuiwenzhan = './static/map/layertree/水文站.png';
const shuiwenzhanno = './static/map/layertree/水文站no.png';
const shuiweizhan = './static/map/layertree/水位站.png';
const shuiku = './static/map/layertree/水库.png';
const yuliangzhan = './static/map/layertree/雨量站.png';
const zhengfazhan = './static/map/layertree/蒸发站.png';
const szjcz = './static/map/layertree/水质监测站.png';
const liudongzhan = './static/map/layertree/流动站.png';
const qixiangzhan = './static/map/layertree/气象站.png';
const chenjizhan = './static/map/layertree/沉积站.png';
const chaoweizhan = './static/map/layertree/潮位站.png';
const shuidianzhan = './static/map/layertree/水电站(大型).png';
const shuizha = './static/map/layertree/水闸(大型不依).png';
const shuizhano = './static/map/layertree/水闸(大型不依)去.png';
const bengzhan = './static/map/layertree/泵站.png';
const shuizhizhan = './static/map/layertree/地下水观测站.png';
const hanzha = './static/map/layertree/涵闸.png';
const xzhqareaFill = './static/map/layertree/xzhqareafill.png';
const xzhqareaOpacity = './static/map/layertree/xzhqareano.png'; //透明

const def = './static/map/layertree/潮位站.png';

//样式
//长江流域综合规划----一级水功能区划
const sgnqhStyle = {
  protect: 'RGB(111,186,44)', //保护区
  retain: 'RGB(38,73,157)', //保留
  buffer: 'RGB(229,230,71)' //缓冲
};

const egdrZoom = 10;
const egdrMin = 0.35;
const egdrMax = 0.5;
const egdrHover = 0.6;
let scale = 0.1;

//创建面图片填充-
let xzhqPatternFillStyle,
  cnvfill = document.createElement('canvas'),
  ctxfill = cnvfill.getContext('2d'),
  imgfill = new Image();
imgfill.src = xzhqareaFill;
imgfill.onload = () => {
  xzhqPatternFillStyle = ctxfill.createPattern(imgfill, 'repeat');
};

let xzhqPatternOpacityStyle,
  cnvop = document.createElement('canvas'),
  ctxop = cnvop.getContext('2d'),
  imgop = new Image();
imgop.src = xzhqareaOpacity;
imgop.onload = () => {
  xzhqPatternOpacityStyle = ctxop.createPattern(imgop, 'repeat');
};



export default [{
  id: 1,
  name: '图层对象',
  isRoot: true,
  icon: def,
  children: [{
      id: '10106',
      name: '水闸',
      isRoot: false,
      icon: shuizha,
      type: 'VECTORTILE',
      geoType: 'point',
      layerName: 'cjwshuizha3857',
      visible: false,
      declutter: true,
      layerUrl: '/geoserver166/gwc/service/tms/1.0.0/test:shuizha3857@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
      vectorConfig: {
        zoom: 14,
        labelField: 'MC',
        minZoomStyle: (text, zoom) => {
          if (zoom < 11) {
            scale = 0.05;
          } else if (zoom >= 11) {
            scale = 0.2;
          }
          return new Style({
            image: new Icon({
              src: yuliangzhan,
              scale: scale
            })
          });
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
              font: '13px sans-serif',
              padding: [5, 8, 5, 8],
              fill: new Fill({
                color: '#FC4F44'
              }),
              stroke: new Stroke({
                color: '#ffff',
                width: 1
              })
            })
          });
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
              font: 'bold 13px sans-serif',
              padding: [5, 8, 5, 8],
              fill: new Fill({
                color: '#FC4F44'
              }),
              stroke: new Stroke({
                color: '#ffff',
                width: 0
              })
            })
          });
        }
      }
    },
    {
      id: '10107',
      name: '泵站',
      isRoot: false,
      icon: bengzhan,
      type: 'VECTORTILE',
      geoType: 'point',
      layerName: 'cjwbengzhan3857',
      visible: false,
      declutter: true,
      layerUrl: '/geoserver166/gwc/service/tms/1.0.0/test:bengzhan3857@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
      vectorConfig: {
        zoom: 13,
        labelField: 'MC',
        minZoomStyle: (text, zoom) => {
          if (zoom < 11) {
            scale = 0.05;
          } else if (zoom >= 11) {
            scale = 0.2;
          }
          return new Style({
            image: new Icon({
              src: yuliangzhan,
              scale: scale
            })
          });
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
              font: '13px sans-serif',
              padding: [5, 8, 5, 8],
              fill: new Fill({
                color: '#2DA7F7'
              }),
              stroke: new Stroke({
                color: '#ffff',
                width: 1
              })
            })
          });
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
              font: 'bold 13px sans-serif',
              padding: [5, 8, 5, 8],
              fill: new Fill({
                color: '#2DA7F7'
              }),
              stroke: new Stroke({
                color: '#ffff',
                width: 0
              })
            })
          });
        }
      }
    },
    {
      id: '10104',
      name: '河段',
      isRoot: false,
      icon: def,
      type: 'WMTS',
      geoType: 'polygon',
      layerName: 'heduannew',
      visible: true,
      layerUrl: '/map172166/rest/services/demos/heduan3857/MapServer/tile/{z}/{y}/{x}',
      queryConfig: {
        name: '河段',
        url: '/map172166/rest/services/demos/heduan3857/MapServer/identify',
        canquery: true
      }
    },
    {
      id: '10146',
      name: '蓄滞洪区分布',
      isRoot: false,
      icon: def,
      type: 'VECTORTILE',
      geoType: 'polygon',
      layerName: 'newcjXZHQnew',
      visible: true,
      layerUrl: '/geoserver166/gwc/service/tms/1.0.0/new:cjXZHQnew1@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
      vectorConfig: {
        zoom: 0,
        labelField: 'XZHQMC',
        uuId: 'XZHQDM', //唯一标识，判断鼠标点选和pointmove时获取的唯一属性，用于图层重新刷新时重置所有带着个属性要素的样式
        maxZoomStyle: (text, zoom, feature, selection) => {
          var selected = !!selection[feature.get('XZHQDM')];
          return new Style({
            stroke: new Stroke({
              color: selected ? 'rgba(0,0,255,1)' : 'rgba(0,0,255,1)',
              width: selected ? 2 : 1
            }),
            fill: new Fill({
              color: selected ? xzhqPatternOpacityStyle : xzhqPatternFillStyle
            }),
            text: new Text({
              text: text,
              offsetY: -20,
              offsetX: 20,
              font: 'bold 13px sans-serif',
              padding: [5, 8, 5, 8],
              fill: new Fill({
                color: "blue"
              }),
              stroke: new Stroke({
                color: '#ffff',
                width: 0
              })
            })
          });
        }
      }
    }
  ]
}];
