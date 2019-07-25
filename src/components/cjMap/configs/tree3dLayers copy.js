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

export default [{
  "id": 1,
  "name": "图层对象",
  "isRoot": true,
  "icon": def,
  "children": [{
    "id": "10002",
    "name": "蓄滞洪区",
    "isRoot": false,
    "icon": def,
    "type": "WMTS",
    "geoType": "polygon",
    "layerName": "xushihongqu",
    "visible": false,
    "layerUrl": "/map178/rest/services/cjcenter/蓄滞洪区分布/MapServer/tile/{z}/{y}/{x}",
    "queryConfig": {
      "name": "蓄滞洪区",
      "url": "/map178/rest/services/cjcenter/蓄滞洪区分布/MapServer/identify",
      "canquery": false
    }
  }]

}]
