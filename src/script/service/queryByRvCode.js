import config from "../config";
import axios from "axios";
import ol from "openlayers";

import removeLayerWhenOutExtent from "./removeLayerWhenOutExtent";

const map = config.$STORE.getters.map;

var vectorLayer;

function removeLayer() {
  if (vectorLayer) config.$STORE.commit("REMOVE_MAP_OVERLAY", vectorLayer);
}

var highlightFeatureStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    // color: [255, 0, 0],
    color: [121, 95, 245],
    width: 4
  }),
  image: new ol.style.Circle({
    radius: 5,
    fill: new ol.style.Fill({
      color: [255, 0, 0]
    })
  })
});
/**
 * 查询参数
 *
 * @param {Number} code 河流编码
 * @returns
 */
function constructQueryParam(code) {
  return `<SOAP-ENV:Envelope
    xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <SOAP-ENV:Body>
        <ns1:execute
            xmlns:ns1="http://logic.services.wegis.supermap.com/">
            <arg0>{
        "fitchResultType": null,
        "queryShowItemsOnly": null,
        "keyWords": null,
        "sumConditions": null,
        "queryAreaData": null,
        "sessionId": "",
        "queryType": null,
        "scale": "1",
        "lucenelevel": null,
        "userId": "",
        "objectCodeList": ["${code}"],
        "targetId": "vector.Vector0010SearchLogic",
        "spatialQueryType": null,
        "keyId": "",
        "sortField": null,
        "spatialId": null,
        "isAsc": null,
        "pageIndex": 0,
        "objectCode": null,
        "fetchStatistic": null,
        "pageSize": 30,
        "mapBounds": "26.455078125000007,-7.668457031249993,180,69.58740234375",
        "mapBoundsList": null,
        "queryStatisticData": null,
        "pointsArray": null,
        "middleTypeList": ["P101"],
        "timeStamp": "2017-10-25 10:45:16",
        "conditonList": null
    }</arg0>
        </ns1:execute>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

/**
 * webService结果转化为geoJson
 *
 * @param {String} data webService结果
 * @returns
 */
function convertWebserviceResToGeoJson(data) {
  data = JSON.parse(data.split("<return>")[1].split("</return>")[0]);
  let pointList = data.vectorPointsList[0][0].vectorPoints,
    crdList = [];
  pointList.forEach(item => {
    item.split("#").forEach(l => {
      let line = [];
      l.split(";").forEach(p => {
        if (p.indexOf("," > -1) && !isNaN(parseFloat(p.split(",")[0]))) {
          line.push([parseFloat(p.split(",")[0]), parseFloat(p.split(",")[1])]);
        }
      });
      crdList.push(line);
    });
  });
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiLineString",
          coordinates: crdList
        }
      }
    ]
  };
}

/**
 * 根据河流编码高亮河流，不支持河段
 *
 * @param {any} code
 */
function queryByRvCode(code) {
  if (code.length != 12) return;
  config.$STORE.commit("SHOW_WAITE_MARKER");
  var url = "/WEGIS-00-WEB_SERVICE_ONEMAP/WSWebService",
    data = constructQueryParam(code);
  axios(url, {
    method: "POST",
    data: data
  }).then(res => {
    showFeatures(convertWebserviceResToGeoJson(res.data));
  });
}

function showFeatures(data) {
  if (vectorLayer) config.$STORE.commit("REMOVE_MAP_OVERLAY", vectorLayer);
  let GeoJSONFormat = new ol.format.GeoJSON(),
    geoFeatures = GeoJSONFormat.readFeatures(data);
  vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: geoFeatures
    }),
    zIndex: 10020,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [255, 255, 0, 1],
        // color: 'yellow',
        width: 4
      })
    })
  });
  config.$STORE.commit("ADD_MAP_OVERLAY", vectorLayer);
  removeLayerWhenOutExtent(vectorLayer);
  console.log(geoFeatures);
  let extent = geoFeatures[0].getGeometry().getExtent(),
    center = ol.extent.getCenter(extent);
  console.log(extent, center);
  config.$STORE.commit("SET_ANIMATE", {
    center: center,
    extent: extent
  });
  config.$STORE.commit("HIDE_WAITE_MARKER");
}

export default queryByRvCode;
