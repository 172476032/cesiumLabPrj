import plotConstant from './plotConstant'
import plotTool from './plot'

// 设置标绘符号显示的默认样式

//鼠标移动过程中的样式
const drawLineStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: '#ADBFE6'
    }),
    stroke: new ol.style.Stroke({
        color: '#5082E5',
        width: 2
    })
});
const drawPolygonStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: '#F0C7CF'
    }),
    stroke: new ol.style.Stroke({
        color: '#EEB9C4',
        width: 1.25
    })
});

//绘制结束之后的样式
const lineStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: '#008000'
    }),
    stroke: new ol.style.Stroke({
        color: '#008000',
        width: 5
    })
});
const polygonStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: "#ADBFE6"
    }),
    stroke: new ol.style.Stroke({
        color: '#5082E5',
        width: 2
    })
});
const pointStyle = new ol.style.Style({
    image: new ol.style.Circle({
        fill: new ol.style.Fill({
            color: "#ADBFE6"
        }),
        stroke: new ol.style.Stroke({
            color: '#5082E5',
            width: 2
        }),
        radius: 5
    })
});

//线高亮样式
const highlightLineStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#008000',
        width: 8
    }),
    fill: new ol.style.Fill({
        color: '#008000'
    })
});

//面高亮样式
const highlightPolygonStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#5082E5',
        width: 8
    }),
    fill: new ol.style.Fill({
        color: '#ADBFE6'
    })
});

//正在绘制过程中样式函数
const drawingStyle = function (feature) {
    if (!(feature instanceof ol.Feature))
        feature = this;

    var constant = plotTool.getConstant();
    var geometryType = constant.geometryType;

    if (geometryType == "polygon") {
        return drawPolygonStyle
    }

    return drawLineStyle;
}


//绘制结束之后样式函数
const drawEndStyle = function (feature) {
    if (!(feature instanceof ol.Feature))
        feature = this;
    var name = feature.get("type");
    var constant = plotConstant.getPlotConstant(name);
    var geometryType = constant.geometryType;

    if (geometryType == "polygon") {
        return polygonStyle
    } else if (geometryType == "point") {
        var style = new ol.style.Style({
            image: new ol.style.Icon({
                scale: 0.6,
                src: `/src/assets/img/plot-icon/plot-${name}.png`
            })
        });
        // var map = plotTool.state.map;
        // var overlay = plotTool.state.imgOverlayer;
        // if(overlay)
        //     map.removeOverlay(overlay);
        return style;
    }
    return lineStyle;
}

//高亮显示样式函数
const highlightStyle = function (feature) {
    if (!(feature instanceof ol.Feature))
        feature = this;

    var name = feature.get("type");
    var constant = plotConstant.getPlotConstant(name);
    var geometryType = constant.geometryType;

    if (geometryType == "polygon") {
        return highlightPolygonStyle
    } else if (geometryType == "point") {
        var style = new ol.style.Style({
            image: new ol.style.Icon({
                src: `/src/assets/img/plot-icon/plot-${name}.png`,
                scale: 0.8
            })
        });
        return style;
    }
    return highlightLineStyle;
}

export {
    drawingStyle,
    drawEndStyle,
    highlightStyle
}
