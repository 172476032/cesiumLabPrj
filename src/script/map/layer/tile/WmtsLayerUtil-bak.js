import ol from 'openlayers';
import config from '../../../config.js'

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

function createWmtsSource(option) {
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
    var offsetZoom_ = option.offsetZoom || 0;

    var resolutions = new Array(scaleDenominators_.length);
    var geoResolutions = new Array(scaleDenominators_.length);
    var matrixIds = new Array(scaleDenominators_.length);
    for (var z = 0; z < scaleDenominators_.length; ++z) {
        matrixIds[z] = z;
        resolutions[z] = getResolutionFromScaleDpi(1 / scaleDenominators_[z], 96, '', equatorialRadius_);
        geoResolutions[z] = getResolutionFromScaleDpi(1 / scaleDenominators_[z], 96, 'degree', equatorialRadius_);
    }
    // console.log(resolutions);
    // console.log(url_, geoResolutions.join(", "));
    // console.log(url_, originCoord_, bottomLeft_.concat(topRight_));

    var wmtsSource = new ol.source.WMTS({
        // crossOrigin:'Anonymous',
        url: url_,
        format: "image/png",
        matrixSet: matrixSet_,
        style: style_,
        layer: layer_,
        projection: 'EPSG:4490',
        requestEncoding: requestEncoding_,
        wrapX: true,
        tileGrid: new ol.tilegrid.WMTS({
            // extent: ol.proj.fromLonLat(bottomLeft_).concat(ol.proj.fromLonLat(topRight_)),
            // origin: ol.proj.fromLonLat(originCoord_),
            // resolutions: resolutions,
            extent: bottomLeft_.concat(topRight_),
            origin: originCoord_,
            resolutions: geoResolutions,
            matrixIds: matrixIds
        }),
        tileLoadFunction: function (imageTile, src) {
            //     var tileCoord = imageTile.getTileCoord();
            //     var resolution = resolutions[tileCoord[0]];
            //     var geoResolution = geoResolutions[tileCoord[0]];
            //     var offsetY = Math.floor((originCoord_[1] - topRight_[1]) / geoResolution / 256);
            //     var centerY = (originCoord_[1] - (topRight_[1] + bottomLeft_[1]) / 2) / geoResolution / 256;
            //     var offsetY1 = Math.floor((ol.proj.fromLonLat(bottomLeft_)[1] - ol.proj.fromLonLat(
            //         originCoord_)[1]) / resolution / 256);
            //     var z = tileCoord[0];
            //     var x = tileCoord[2] - offsetY1 + offsetY;
            //     x = Math.floor(centerY * 2 - x);
            //     var y = tileCoord[1];
            // var reg = new RegExp("(.*TileMatrix=)\\d+(.*TileCol=)\\d+(.*TileRow=)\\d+");
            // var newSrc = src.replace(reg, "$1" + z + "$2" + y + "$3" + x);

            // imageTile.getImage().src = newSrc;
            var tileCoord = imageTile.getTileCoord();
            var z = tileCoord[0] + offsetZoom_;
            var reg = new RegExp("(.*TileMatrix=)\\d+(.*TileCol=)");
            var newSrc = src.replace(reg, "$1" + z + "$2");
            imageTile.getImage().src = newSrc;
            // console.log(tileCoord, newSrc)
        }
    });

    return wmtsSource;
}

function createWmtsLayer(option) {
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
    var offsetZoom_ = option.offsetZoom || 0;

    var resolutions = new Array(scaleDenominators_.length);
    var geoResolutions = new Array(scaleDenominators_.length);
    var matrixIds = new Array(scaleDenominators_.length);
    for (var z = 0; z < scaleDenominators_.length; ++z) {
        matrixIds[z] = z;
        resolutions[z] = getResolutionFromScaleDpi(1 / scaleDenominators_[z], 96, '', equatorialRadius_);
        geoResolutions[z] = getResolutionFromScaleDpi(1 / scaleDenominators_[z], 96, 'degree', equatorialRadius_);
    }

    var wmtsSource = createWmtsSource(option);
    var layer = new ol.layer.Tile({
        source: wmtsSource,
        // maxResolution: resolutions[0],
        // minResolution: resolutions[resolutions.length - 1]
        maxResolution: geoResolutions[0],
        minResolution: geoResolutions[geoResolutions.length - 1]
    });
    return layer;
}

function createExtendWmtsLayer(option) {
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
    var offsetZoom_ = option.offsetZoom || 0;

    var resolutions = new Array(scaleDenominators_.length);
    var geoResolutions = new Array(scaleDenominators_.length);
    var matrixIds = new Array(scaleDenominators_.length);
    for (var z = 0; z < scaleDenominators_.length; ++z) {
        matrixIds[z] = z;
        resolutions[z] = getResolutionFromScaleDpi(1 / scaleDenominators_[z], 96, '', equatorialRadius_);
        geoResolutions[z] = getResolutionFromScaleDpi(1 / scaleDenominators_[z], 96, 'degree', equatorialRadius_);
    }

    var wmtsSource = createWmtsSource(option);
    var layer;
    if (url_) {
        var url = url_.substring(0, url_.length - 5);
        var map = config.$STORE.getters.map;
        var view = map.getView();
        var reg = new RegExp("(.*TileMatrix=)\\d+(.*TileCol=)");
        var tileGrid = wmtsSource.getTileGrid();
        var projection = view.getProjection();
        var layerExtent = tileGrid.extent_;

        var projectionExtent = projection.getExtent();
        var size = ol.extent.getWidth(projectionExtent) / 256;
        var mapZoomCount = 22;
        var geoResolutionsRest = new Array(mapZoomCount);
        matrixIds = new Array(mapZoomCount);
        for (z = 0; z < mapZoomCount; ++z) {
            // generate resolutions and matrixIds arrays for this WMTS
            geoResolutionsRest[z] = size / Math.pow(2, z);
        }
        // console.log(geoResolutionsRest.join(", "));

        var matrixIdsLength = tileGrid.getMatrixIds().length;
        var tileUrlFunction = wmtsSource.tileUrlFunction;
        layer = new ol.layer.Tile({
            source: new ol.source.TileArcGISRest({
                // crossOrigin:'Anonymous',
                url: url,
                tileLoadFunction: function (imageTile, src) {
                    var tileCoord = imageTile.getTileCoord();
                    // console.log(tileCoord.join(", "), src);
                    if (tileCoord && tileCoord[0] >= offsetZoom_ && tileCoord[0] < offsetZoom_ + matrixIdsLength) {
                        var localTileCoord = [tileCoord[0] - offsetZoom_, tileCoord[1], tileCoord[2]];
                        // var extent = tileGrid.getTileCoordExtent(localTileCoord);
                        // if (extent[0] >= layerExtent[0] && extent[1] >= layerExtent[1] && extent[0] <= layerExtent[2] && extent[1] <= layerExtent[3] ||
                        //     extent[2] >= layerExtent[0] && extent[3] >= layerExtent[1] && extent[2] <= layerExtent[2] && extent[3] <= layerExtent[3]) {
                        var pixelRatio = 1;
                        // console.log(src);
                        src = tileUrlFunction(localTileCoord, pixelRatio, projection);
                        src = src.replace(reg, "$1" + tileCoord[0] + "$2");
                        // console.log(src);
                        // layer.getSource().getTileGrid().origin_ = originCoord_;
                        // console.log(tileCoord.join(", "), localTileCoord.join(", "), src);
                        // } else {
                        //     src = "";
                        // }
                    }
                    imageTile.getImage().src = src;
                },
                tileGrid: new ol.tilegrid.TileGrid({
                    // extent: ol.proj.fromLonLat(bottomLeft_).concat(ol.proj.fromLonLat(topRight_)),
                    // origin: ol.proj.fromLonLat(originCoord_),
                    // resolutions: resolutions,
                    extent: bottomLeft_.concat(topRight_),
                    origin: originCoord_,
                    resolutions: geoResolutionsRest
                })
            })
        });
    }

    return layer;
}

function createSupermapWmtsLayer(option) {
    var scaleDenominators_ = option.scaleDenominators;
    var originCoord_ = option.originCoord;
    var bottomLeft_ = option.bottomLeft;
    var topRight_ = option.topRight;
    var url_ = option.url;
    var matrixSet_ = option.matrixSet;
    var style_ = option.style;
    var layer_ = option.layer;
    var tileMatrixset_ = option.tileMatrixset;
    var requestEncoding_ = option.requestEncoding || "KVP";
    var equatorialRadius_ = option.equatorialRadius;
    var offsetZoom_ = option.offsetZoom || 0;
    var dpi_ = option.dpi || 96;

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
        projection: 'EPSG:4326',
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

    var context = {
        SERVICE: 'WMTS',
        VERSION: '1.0.0',
        REQUEST: 'GetTile',
        STYLE: 'Default',
        FORMAT: 'image/png',
        LAYER: layer_,
        TILEMATRIXSET: tileMatrixset_
    }

    function createFromWMTSTemplate(template) {
        var dimensions = wmtsSource.dimensions_;
        var requestEncoding = wmtsSource.requestEncoding_;

        // template += '/' + wmtsSource.layer_ + '/tileImage.png';

        // TODO: we may want to create our own appendParams function so that params
        // order conforms to wmts spec guidance, and so that we can avoid to escape
        // special template params

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
                    // if(tileCoord[0] === 1) {
                    //     debugger
                    // }
                    var zoom = tileCoord[0] + offsetZoom_;
                    var localContext = {
                        'TileMatrix': zoom,
                        'TileCol': tileCoord[1],
                        'TileRow': -tileCoord[2] - 1
                        // 'TileCol': tileCoord[1] - Math.pow(2, zoom) - Math.pow(2, zoom - 1),
                        // 'TileRow': -tileCoord[2] + Math.pow(2, zoom) + Math.pow(2, zoom - 1) - 1
                    };
                    ol.obj.assign(localContext, dimensions);
                    var url = template;
                    if (requestEncoding == ol.source.WMTSRequestEncoding.KVP) {
                        url = ol.uri.appendParams(url, localContext);
                    } else {
                        url = url.replace(/\{(\w+?)\}/g, function (m, p) {
                            return localContext[p];
                        });
                    }
                    // console.log(tileCoord, localContext.TileMatrix, localContext.TileCol, localContext.TileRow);
                    return url;
                }
            });
    }
    if (wmtsSource.urls && wmtsSource.urls.length > 0) {
        var tileUrlFunction = ol.TileUrlFunction.createFromTileUrlFunctions(
            wmtsSource.urls.map(createFromWMTSTemplate));
        wmtsSource.tileUrlFunction = tileUrlFunction
    }

    var layer = new ol.layer.Tile({
        source: wmtsSource,
        maxResolution: geoResolutions[0],
        minResolution: geoResolutions[geoResolutions.length - 1]
    });
    return layer;
}

export {
    createWmtsLayer,
    createExtendWmtsLayer,
    createSupermapWmtsLayer
}
