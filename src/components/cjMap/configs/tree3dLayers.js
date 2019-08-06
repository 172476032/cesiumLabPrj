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
      "id": "10142",
      "name": "水闸",
      "isRoot": false,
      "icon": shuizha,
      "type": "WMTS",
      "geoType": "point",
      "layerName": "shuizha",
      "visible": false,
      "layerUrl": "/map178/rest/services/cjcenter/水闸/MapServer/tile/{z}/{y}/{x}",
      "queryConfig": {
        "name": "水闸",
        "url": "/map178/rest/services/cjcenter/水闸/MapServer/identify",
        "canquery": false
      }
    },
    {
      "id": "10143",
      "name": "泵站",
      "isRoot": false,
      "icon": bengzhan,
      "type": "WMTS",
      "geoType": "point",
      "layerName": "bangzhan",
      "visible": false,
      "layerUrl": "/map166/rest/services/XZHQ/BZ/MapServer/tile/{z}/{y}/{x}",
      "queryConfig": {
        "name": "泵站",
        "url": "/map166/rest/services/XZHQ/BZ/MapServer/identify",
        "canquery": false
      }
    },
    {
      "id": "10001",
      "name": "河段",
      "isRoot": false,
      "icon": def,
      "type": "WMTS",
      "geoType": "polygon",
      "layerName": "heduannew",
      "visible": false,
      "layerUrl": "/map166/rest/services/demos/heduan3857/MapServer/tile/{z}/{y}/{x}",
      "queryConfig": {
        "name": "河段",
        "url": "/map166/rest/services/demos/heduan3857/MapServer/identify",
        "canquery": false
      }
    }, {
      "id": "13343",
      "name": "水闸",
      "isRoot": false,
      "icon": shuizha,
      "type": "DATASOURCE",
      "geoType": "point",
      "layerName": "shuizhadatasource",
      "visible": false,
      "layerIcon": shuizha,
      "layerIconColor": "#FC4F44",
            "labelField":"MC",
      "layerUrl": "/map178/rest/services/cjcenter/水闸/MapServer/2/query/2/query?where=1=1&outFields=*&f=pjson",

    }, {
      "id": "13443",
      "name": "泵站",
      "isRoot": false,
      "icon": bengzhan,
      "type": "DATASOURCE",
      "geoType": "point",
      "layerName": "bangzhandatasource",
      "visible": false,
      "layerIcon": bengzhan,
      "layerIconColor": "#2DA7F7",
      "labelField":"MC",
      "layerUrl": "/map166/rest/services/XZHQ/BZ/MapServer/2/query?where=1=1&outFields=*&f=pjson",

    }, {
      "id": "103201",
      "name": "地名",
      "isRoot": false,
      "icon": def,
      "type": "WMTS",
      "geoType": "point",
      "layerName": "adresslayer",
      "visible": false,
      "layerUrl": "/map166/rest/services/XZHQ/JMD/MapServer/tile/{z}/{y}/{x}",
      "queryConfig": {
        "name": "地名",
        "url": "/map166/rest/services/XZHQ/JMD/MapServer/identify",
        "canquery": false
      }
    }, {
      "id": "10002",
      "name": "蓄滞洪区",
      "isRoot": false,
      "icon": def,
      "type": "WMTS",
      "geoType": "polygon",
      "layerName": "newcjXZHQnew",
      "visible": false,
      "layerUrl": "/map166/rest/services/XZHQ/XZHQ/MapServer/tile/{z}/{y}/{x}",
      "queryConfig": {
        "name": "蓄滞洪区",
        "url": "/map166/rest/services/XZHQ/XZHQ/MapServer/identify",
        "canquery": false
      }
    }
  ]
}]
