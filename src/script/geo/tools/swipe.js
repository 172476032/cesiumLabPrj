/**
 * author: xr
 * descript: map layer swipe tools
 */
import ol from 'openlayers'

var state = {
    moving: false,
    map: null,
    viewport: null,
    swipeEl: null,
    currentValue: 0,
    width: 0,
    height: 0,
    firstSwipe: null,
    secondSwipe: null
}

/**
 * 获取实际样式函数
 * @param   {HTMLElement}   element  需要寻找的样式的html节点
 * @param   {String]} attr 在对象中寻找的样式属性
 * @returns {String} 获取到的属性
 */
function getStyle(element, attr) {
    //IE写法
    if (element.currentStyle) {
        return element.currentStyle[attr];
        //标准
    } else {
        return getComputedStyle(element, false)[attr];
    }
}

function pointerDownHandler(e) {
    let nowpixel = mode ? e.pixel[0] : e.pixel[1];
    if (state.currentValue - 4 <= nowpixel && nowpixel <= state.currentValue + 4) {
        state.moving = true;
    }
}

function pointerDragHandler(e) {
    let nowpixel = mode ? e.pixel[0] : e.pixel[1],
        styleCursor = mode ? 'col-resize' : 'row-resize';

    if (state.moving) {
        e.preventDefault();
        e.stopPropagation()
        if (mode) {
            state.swipeEl.style.width = nowpixel + 'px';
        } else {
            state.swipeEl.style.height = nowpixel + 'px';
        }
        state.currentValue = nowpixel;
        state.map.render();
    }

    if (state.currentValue - 4 <= nowpixel && nowpixel <= state.currentValue + 4) {
        state.swipeEl.style.cursor = styleCursor;
    } else {
        state.swipeEl.style.cursor = '';
    }
}

function pointerUpHandler() {
    state.moving = false;
    state.currentValue = mode ? +state.swipeEl.style.width.replace('px', '') : +state.swipeEl.style.height.replace('px', '')
}

function createSwipeEl() {
    if (!!state.swipeEl && state.mode == mode) {
        console.log('user old el');
        return state.swipeEl
    }!!state.swipeEl && state.viewport.removeChild(state.swipeEl);

    var swipeEl = document.createElement('div');
    state.currentValue = mode ? state.width / 2 : state.height / 2;

    swipeEl.style.width = mode ? state.width / 2 + 'px' : '100%';
    swipeEl.style.height = mode ? '100%' : state.height / 2 + 'px';
    swipeEl.style.position = 'absolute';
    swipeEl.style.top = '0px';
    swipeEl.style.left = '0px;'
    if (mode) {
        swipeEl.style.borderRight = '3px solid #000';
    } else {
        swipeEl.style.borderBottom = '3px solid #000';
    }

    return swipeEl
}

const SWIPEDIRECT = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
}

var mode = '';

// 左,上 显示的图层 卷帘计算
function firstPre(event) {
    let ctx = event.context,
        value = state.currentValue || (mode ? ctx.canvas.width : ctx.canvas.height),

        moveHeight = mode ? ctx.canvas.height : value,
        moveWidth = mode ? value : ctx.canvas.width;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, moveWidth, moveHeight);
    ctx.clip();
}

// 右，下 显示的图层 卷帘计算
function secondPre(event) {
    var ctx = event.context,
        value = state.currentValue,
        moveHeight = mode ? ctx.canvas.height : ctx.canvas.height - value,
        moveWidth = mode ? ctx.canvas.width - value : ctx.canvas.width;

    ctx.save();
    ctx.beginPath();
    if (mode) {
        ctx.rect(value, 0, moveWidth, moveHeight);
    } else {
        ctx.rect(0, value, moveWidth, moveHeight);
    }
    ctx.clip();
}

function postcomposeHandler(event) {
    var ctx = event.context;
    ctx.restore();
}

function active({
    map,
    first,
    second,
    direct
}) {
    if (direct == SWIPEDIRECT.HORIZONTAL) {
        mode = true;
    } else {
        mode = false;
    }

    !!state.secondSwipe && state.secondSwipe.setOwnVisible(false);
    state.firstSwipe = first;
    state.secondSwipe = second;
    state.map = map;
    //}{xr  todo
    first.setOwnVisible(true);
    second.setOwnVisible(true);

    let viewport = map.getViewport(),
        width = state.width = +getStyle(viewport, 'width').replace('px', ''),
        height = state.height = +getStyle(viewport, 'height').replace('px', '');


    var swipeEl = createSwipeEl()
    viewport.appendChild(swipeEl);
    if (state.mode != mode) {
        map.render();
    }

    state.mode = mode;
    state.swipeEl = swipeEl;
    state.viewport = viewport;

    if (first.layer instanceof ol.layer.Tile) {
        first.layer.on('precompose', firstPre);
        first.layer.on('postcompose', postcomposeHandler);
    } else if (first.layer instanceof ol.layer.Group) {
        first.layer.getLayers().getArray().forEach(function (value) {
            value.on('precompose', firstPre);
            value.on('postcompose', postcomposeHandler);
        })
    }

    if (second.layer instanceof ol.layer.Tile) {
        second.layer.on('precompose', secondPre);
        second.layer.on('postcompose', postcomposeHandler);

    } else if (second.layer instanceof ol.layer.Group) {
        second.layer.getLayers().getArray().forEach(function (value) {
            value.on('precompose', secondPre);
            value.on('postcompose', postcomposeHandler);
        })
    }

    map.on('pointerdown', pointerDownHandler)
    map.on('pointermove', pointerDragHandler)
    map.on('pointerup', pointerUpHandler)
}

function deactive() {
    !!state.swipeEl && state.viewport.removeChild(state.swipeEl);

    if (state.map) {
        state.map.un('pointerdown', pointerDownHandler)
        state.map.un('pointermove', pointerDragHandler)
        state.map.un('pointerup', pointerUpHandler)
        state.secondSwipe.setOwnVisible(false);

        state.map.render();
    }

    state = {
        moving: false,
        map: null,
        viewport: null,
        swipeEl: null,
        currentValue: 0,
        width: 0,
        height: 0
    };
}

export default {
    active: active,
    deactive: deactive
}
