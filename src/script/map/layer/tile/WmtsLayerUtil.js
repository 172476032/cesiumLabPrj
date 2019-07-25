import ol from 'openlayers';
import config from '../../../config.js'

var ol3dEnabled = false;

function getResolutionFromScaleDpi(scale, dpi, type, equatorialRadius) {
  var result = null,
    d = 10000;
  equatorialRadius = equatorialRadius || 6378137; //赤道半径
  type = type || "";
  // 0.025428517203021826, 0.254
  var ratio = 0.0254;
  // var ratio = 0.025428517203021826;
  if (scale > 0 && dpi > 0) {
    scale = scale > 1 ? scale : 1 / scale;
    if (type.toLowerCase() === "degree" || type.toLowerCase() === "degrees" || type.toLowerCase() === "dd") {
      result = ratio * d / dpi * scale / ((Math.PI * 2 * equatorialRadius) / 360) / d;
      // result = ratio * d / dpi / scale / 111194.872221777 / d;
      // console.log(`${ratio}*${d}/${dpi}*${scale}/${d}/${result}*180/Math.PI = `, ratio * d / dpi * scale / d / result * 180 / Math.PI);
      return result
    } else {
      result = ratio * d / dpi * scale / d;
      return result
    }
  }
  return -1
}

/**
 * 辅助函数
 * 构造瓦片服务的ol.source.WMTS对象
 * @param {Object} option
 * @param {Function} xyzTransform
 */
function createWmtsSource(option, xyzTransform) {
  var scaleDenominators_ = option.scaleDenominators;
  var originCoord_ = option.originCoord;
  var bottomLeft_ = option.bottomLeft;
  var topRight_ = option.topRight;
  var url_ = option.url;
  var matrixSet_ = option.matrixSet;
  var style_ = option.style;
  var layer_ = option.layer;
  var requestEncoding_ = option.requestEncoding || "KVP";
  var equatorialRadius_ = option.equatorialRadius;
  var dpi_ = option.dpi || 96;
  var tileMatrixset_ = option.tileMatrixset || option.matrixSet;
  var offsetZoom_ = option.offsetZoom || 0;

  var context = {
    SERVICE: 'WMTS',
    VERSION: '1.0.0',
    REQUEST: 'GetTile',
    STYLE: 'Default',
    FORMAT: 'image/png',
    LAYER: layer_,
    TILEMATRIXSET: tileMatrixset_
  }

  var geoResolutions = new Array(scaleDenominators_.length);
  var matrixIds = new Array(scaleDenominators_.length);
  for (var z = 0; z < scaleDenominators_.length; ++z) {
    matrixIds[z] = z;
    geoResolutions[z] = getResolutionFromScaleDpi(1 / scaleDenominators_[z], dpi_, 'degree', equatorialRadius_);
  }
  var wmtsSource = new ol.source.WMTS({
    url: url_,
    format: "image/png",
    matrixSet: matrixSet_,
    style: style_,
    layer: layer_,
    projection: 'EPSG:4490',
    wrapX: true,
    requestEncoding: requestEncoding_,
    tileGrid: new ol.tilegrid.WMTS({
      extent: bottomLeft_.concat(topRight_),
      origin: originCoord_,
      resolutions: geoResolutions,
      matrixIds: matrixIds
    }),
    tileLoadFunction: function (imageTile, src) {
      var tileCoord = imageTile.getTileCoord();
      imageTile.getImage().src = src;
    }
  });

  function createFromWMTSTemplate(template) {
    var dimensions = wmtsSource.dimensions_;
    var requestEncoding = wmtsSource.requestEncoding_;

    template = (requestEncoding == ol.source.WMTSRequestEncoding.KVP) ?
      ol.uri.appendParams(template, context) :
      template.replace(/\{(\w+?)\}/g, function (m, p) {
        return (p.toLowerCase() in context) ? context[p.toLowerCase()] : m;
      });

    return (
      /**
       * @param {ol.TileCoord} tileCoord Tile coordinate.
       * @param {number} pixelRatio Pixel ratio.
       * @param {ol.proj.Projection} projection Projection.
       * @return {string|undefined} Tile URL.
       */
      function (tileCoord, pixelRatio, projection) {
        if (!tileCoord) {
          return undefined;
        } else {
          var localContext = xyzTransform(tileCoord, offsetZoom_)
          if (!localContext) {
            return undefined;
          }
          ol.obj.assign(localContext, dimensions);
          var url = template;
          if (requestEncoding == ol.source.WMTSRequestEncoding.KVP) {
            url = ol.uri.appendParams(url, localContext);
          } else {
            url = url.replace(/\{(\w+?)\}/g, function (m, p) {
              return localContext[p];
            });
          }
          return url;
        }
      }
    );
  }

  if (wmtsSource.urls && wmtsSource.urls.length > 0) {
    var tileUrlFunction = ol.TileUrlFunction.createFromTileUrlFunctions(
      wmtsSource.urls.map(createFromWMTSTemplate));
    wmtsSource.tileUrlFunction = tileUrlFunction
  }

  return wmtsSource;
}

/**
 * 请求arcgis发的地图服务
 * @param {Object} option 地图瓦片服务配置
 */
function createWmtsLayer(option) {
  function xyzTransform(tileCoord, offsetZoom_) {
    var zoom = ol3dEnabled ? tileCoord[0] : tileCoord[0] + offsetZoom_;
    var localContext = {
      'TileMatrix': zoom,
      'TileCol': tileCoord[1],
      'TileRow': -tileCoord[2] - 1
    };
    if (ol3dEnabled) {
      // 控制是否显示
      if (zoom < offsetZoom_) {
        return undefined;
      }
      // 计算瓦片范围
      let bottomLeft = option.bottomLeft;
      let topRight = option.topRight;
      let resolution = 360 / 256 / Math.pow(2, localContext.TileMatrix);
      let minX = -180 + localContext.TileCol * 256 * resolution;
      let maxX = -180 + (localContext.TileCol + 1) * 256 * resolution;
      let maxY = 90 - localContext.TileRow * 256 * resolution;
      let minY = 90 - (localContext.TileRow + 1) * 256 * resolution;
      // console.log(localContext, minX, maxX, minY, maxY, bottomLeft, topRight)
      if (maxX <= bottomLeft[0] || minX >= topRight[0] || maxY <= bottomLeft[1] || minY >= topRight[1]) {
        return undefined;
      }
    }
    return localContext;
  }
  var wmtsSource = createWmtsSource(option, xyzTransform);
  var geoResolutions = wmtsSource.getTileGrid().getResolutions();
  var layer = new ol.layer.Tile({
    source: wmtsSource,
    maxResolution: geoResolutions[0],
    minResolution: geoResolutions[geoResolutions.length - 1]
  });
  return layer;
}

/**
 * 请求supermap发的地图服务
 * @param {Object} option 地图瓦片服务配置
 */
function createSupermapWmtsLayer(option) {
  function xyzTransform(tileCoord, offsetZoom_) {
    var zoom = ol3dEnabled ? tileCoord[0] - 1 : tileCoord[0] + offsetZoom_;
    var localContext = {
      'TileMatrix': zoom,
      'TileCol': tileCoord[1],
      'TileRow': -tileCoord[2] - 1
    };
    return localContext;
  }
  var wmtsSource = createWmtsSource(option, xyzTransform);
  var geoResolutions = wmtsSource.getTileGrid().getResolutions();
  var layer = new ol.layer.Tile({
    source: wmtsSource,
    maxResolution: geoResolutions[0],
    minResolution: geoResolutions[geoResolutions.length - 1]
  });

  return layer;
}

/**
 * 设置三维状态
 * @param {boolean} ol3dEnabled_
 */
function setOl3dEnabled(ol3dEnabled_) {
  ol3dEnabled = ol3dEnabled_;
}

export {
  createWmtsLayer,
  createSupermapWmtsLayer,
  setOl3dEnabled
}
