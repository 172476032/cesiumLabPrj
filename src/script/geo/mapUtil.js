import _ from "lodash";
import ol from "openlayers";

function getExtent(feature) {
  var coordinates = feature.getGeometry().getCoordinates();
  coordinates = coordinates[0];
  console.log(coordinates);
  var extent = [
    Number.MAX_VALUE,
    Number.MAX_VALUE,
    Number.MIN_VALUE,
    Number.MIN_VALUE
  ];
  coordinates.forEach(coord => {
    if (coord[0] < extent[0]) extent[0] = coord[0];
    if (coord[0] > extent[2]) extent[2] = coord[0];
    if (coord[1] < extent[1]) extent[1] = coord[1];
    if (coord[1] > extent[3]) extent[3] = coord[1];
  });
  return extent;
}

function createBox(coordinates, optGeometry) {
  var extent = ol.extent.boundingExtent(coordinates);
  var geometry = optGeometry || new ol.geom.Polygon(null);
  geometry.setCoordinates([
    [
      ol.extent.getBottomLeft(extent),
      ol.extent.getBottomRight(extent),
      ol.extent.getTopRight(extent),
      ol.extent.getTopLeft(extent),
      ol.extent.getBottomLeft(extent)
    ]
  ]);
  return geometry;
}

function getArrayString(list) {
  var resultStr = "";
  if (!list || !(list instanceof Array)) return resultStr;
  resultStr += "[";
  list.forEach((item, i) => {
    if (item instanceof Array) {
      resultStr += getArrayString(item);
    } else {
      resultStr += item;
    }
    if (i < list.length - 1) resultStr += ",";
  });
  resultStr += "]";
  return resultStr;
}

export { getExtent, createBox, getArrayString };
