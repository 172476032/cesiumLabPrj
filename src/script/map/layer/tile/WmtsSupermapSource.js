import ol from 'openlayers'


ol.source.WMTS = function(options) {
    
      // TODO: add support for TileMatrixLimits
    
      /**
       * @private
       * @type {string}
       */
      this.version_ = options.version !== undefined ? options.version : '1.0.0';
    
      /**
       * @private
       * @type {string}
       */
      this.format_ = options.format !== undefined ? options.format : 'image/jpeg';
    
      /**
       * @private
       * @type {!Object}
       */
      this.dimensions_ = options.dimensions !== undefined ? options.dimensions : {};
    
      /**
       * @private
       * @type {string}
       */
      this.layer_ = options.layer;
    
      /**
       * @private
       * @type {string}
       */
      this.matrixSet_ = options.matrixSet;
    
      /**
       * @private
       * @type {string}
       */
      this.style_ = options.style;
    
      var urls = options.urls;
      if (urls === undefined && options.url !== undefined) {
        urls = ol.TileUrlFunction.expandUrl(options.url);
      }
    
      // FIXME: should we guess this requestEncoding from options.url(s)
      //        structure? that would mean KVP only if a template is not provided.
    
      /**
       * @private
       * @type {ol.source.WMTSRequestEncoding}
       */
      this.requestEncoding_ = options.requestEncoding !== undefined ?
        /** @type {ol.source.WMTSRequestEncoding} */ (options.requestEncoding) :
        ol.source.WMTSRequestEncoding.KVP;
    
      var requestEncoding = this.requestEncoding_;
    
      // FIXME: should we create a default tileGrid?
      // we could issue a getCapabilities xhr to retrieve missing configuration
      var tileGrid = options.tileGrid;
    
      // context property names are lower case to allow for a case insensitive
      // replacement as some services use different naming conventions
      var context = {
        'layer': this.layer_,
        'style': this.style_,
        'tilematrixset': this.matrixSet_
      };
    
      if (requestEncoding == ol.source.WMTSRequestEncoding.KVP) {
        ol.obj.assign(context, {
          'Service': 'WMTS',
          'Request': 'GetTile',
          'Version': this.version_,
          'Format': this.format_
        });
      }
    
      var dimensions = this.dimensions_;
    
      /**
       * @param {string} template Template.
       * @return {ol.TileUrlFunctionType} Tile URL function.
       */
      function createFromWMTSTemplate(template) {
    
        // TODO: we may want to create our own appendParams function so that params
        // order conforms to wmts spec guidance, and so that we can avoid to escape
        // special template params
    
        template = (requestEncoding == ol.source.WMTSRequestEncoding.KVP) ?
          ol.uri.appendParams(template, context) :
          template.replace(/\{(\w+?)\}/g, function(m, p) {
            return (p.toLowerCase() in context) ? context[p.toLowerCase()] : m;
          });
    
        return (
          /**
           * @param {ol.TileCoord} tileCoord Tile coordinate.
           * @param {number} pixelRatio Pixel ratio.
           * @param {ol.proj.Projection} projection Projection.
           * @return {string|undefined} Tile URL.
           */
          function(tileCoord, pixelRatio, projection) {
            if (!tileCoord) {
              return undefined;
            } else {
              var localContext = {
                'TileMatrix': tileGrid.getMatrixId(tileCoord[0]),
                'TileCol': tileCoord[1],
                'TileRow': -tileCoord[2] - 1
              };
              ol.obj.assign(localContext, dimensions);
              var url = template;
              if (requestEncoding == ol.source.WMTSRequestEncoding.KVP) {
                url = ol.uri.appendParams(url, localContext);
              } else {
                url = url.replace(/\{(\w+?)\}/g, function(m, p) {
                  return localContext[p];
                });
              }
              return url;
            }
          });
      }
    
      var tileUrlFunction = (urls && urls.length > 0) ?
        ol.TileUrlFunction.createFromTileUrlFunctions(
            urls.map(createFromWMTSTemplate)) :
        ol.TileUrlFunction.nullTileUrlFunction;
    
      ol.source.TileImage.call(this, {
        attributions: options.attributions,
        cacheSize: options.cacheSize,
        crossOrigin: options.crossOrigin,
        logo: options.logo,
        projection: options.projection,
        reprojectionErrorThreshold: options.reprojectionErrorThreshold,
        tileClass: options.tileClass,
        tileGrid: tileGrid,
        tileLoadFunction: options.tileLoadFunction,
        tilePixelRatio: options.tilePixelRatio,
        tileUrlFunction: tileUrlFunction,
        urls: urls,
        wrapX: options.wrapX !== undefined ? options.wrapX : false
      });
    
      this.setKey(this.getKeyForDimensions_());
    
    };
    ol.inherits(ol.source.WMTS, ol.source.TileImage);