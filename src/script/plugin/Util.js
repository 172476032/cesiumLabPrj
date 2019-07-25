// Util.js
/**
 * @description useful tools that always use
 * @{@link 'https://github.com/Leaflet/Leaflet/blob/master/src/core/Util.js'}
 */

// @function extend(dest: Object, src?: Object): Object
// Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter.
export function extend(dest) {
    var i, j, len, src;

    for (j = 1, len = arguments.length; j < len; j++) {
        src = arguments[j];
        for (i in src) {
            dest[i] = src[i];
        }
    }
    return dest;
};

// @function bind(fn: Function, …): Function
// Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
export function bind(fn, obj) {
    var slice = Array.prototype.slice;

    if (fn.bind) {
        return fn.bind.apply(fn, slice.call(arguments, 1));
    }

    var args = slice.call(arguments, 2);

    return function () {
        return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
    };
};

// @function stamp(obj: Object): Number
// Returns the unique ID of an object, assiging it one if it doesn't have it.
export function stamp(obj) {
    /*eslint-disable */
    obj._unique_id = obj._unique_id || ++this.lastId;
    return obj._unique_id;
    /*eslint-enable */
};

// @function throttle(fn: Function, time: Number, context: Object): Function
// Returns a function which executes function `fn` with the given scope `context`
// (so that the `this` keyword refers to `context` inside `fn`'s code). The function
// `fn` will be called no more than one time per given amount of `time`. The arguments
// received by the bound function will be any arguments passed when binding the
// function, followed by any arguments passed when invoking the bound function.
export function throttle(fn, time, context) {
    var lock, args, wrapperFn, later;

    later = function () {
        // reset lock and call if queued
        lock = false;
        if (args) {
            wrapperFn.apply(context, args);
            args = false;
        }
    };

    wrapperFn = function () {
        if (lock) {
            // called too soon, queue to call later
            args = arguments;
        } else {
            // call and lock until later
            fn.apply(context, arguments);
            setTimeout(later, time);
            lock = true;
        }
    };

    return wrapperFn;
};

// @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
// Returns the number `num` modulo `range` in such a way so it lies within
// `range[0]` and `range[1]`. The returned value will be always smaller than
// `range[1]` unless `includeMax` is set to `true`.
export function wrapNum(x, range, includeMax) {
    var max = range[1];
    var min = range[0];
    var d = max - min;
    return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
};

// @function falseFn(): Function
// Returns a function which always returns `false`.
export function falseFn() {
    return false;
};

// @function formatNum(num: Number, digits?: Number): Number
// Returns the number `num` rounded to `digits` decimals, or to 5 decimals by default.
export function formatNum(num, digits) {
    var pow = Math.pow(10, digits || 5);
    return Math.round(num * pow) / pow;
}

// @function trim(str: String): String
// Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
export function trim(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
};

// @function splitWords(str: String): String[]
// Trims and splits the string on whitespace and returns the array of parts.
export function splitWords(str) {
    return this.trim(str).split(/\s+/);
};

// @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
// Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
// translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
// be appended at the end. If `uppercase` is `true`, the parameter names will
// be uppercased (e.g. `'?A=foo&B=bar'`)
export function getParamString(obj, existingUrl, uppercase) {
    var params = [];
    for (var i in obj) {
        params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
    }
    return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
};

var templateRe = /\{ *([\w_\-]+) *\}/g;

// @function template(str: String, data: Object): String
// Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
// and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
// `('Hello foo, bar')`. You can also specify functions instead of strings for
// data values — they will be evaluated passing `data` as an argument.
export function template(str, data) {
    return str.replace(templateRe, function (str, key) {
        var value = data[key];

        if (value === undefined) {
            throw new Error('No value provided for variable ' + str);

        } else if (typeof value === 'function') {
            value = value(data);
        }
        return value;
    });
};

// @function indexOf(array: Array, el: Object): Number
// Compatibility polyfill for [Array.prototype.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
export function indexOf(array, el) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === el) {
            return i;
        }
    }
    return -1;
};

export function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || (type === 'object' && !!obj);
};

/**
 * [storeData write data in localstorage]
 * @param  {[string]} key    [name of data]
 * @param  {[string|object]} object [the data to store]
 * @return {[type]}        [data be stringfied]
 */
export function storeData(key, object) {
    var value = '';
    if (this.isObject(object)) {
        value = JSON.stringify(object);
    } else {
        value = object;
    }
    localStorage.setItem(key, value);
    return value;
};

/**
 * [getData get data from localstorage]
 * @param  {[string]} key [the key of data]
 * @return {[string|object]}     [data you want]
 */
export function getData(key) {
    var value = localStorage.getItem(key);
    try {
        var obj = JSON.parse(value);
        return obj;
    } catch (e) {
        return value;
    }
};

/**
 * [guid generate a unique string of 16 chars]
 * @return {[string]} [the unique sting]
 */
export function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16).replace('-', '');
    });
};

/**
 * [getFingerprint get the unique string of the device]
 * @return {[string]} [the unique string]
 */
export function getFingerprint() {
    if (!this.getData('guid')) {
        this.storeData('guid', this.guid());
    }
    return this.getData('guid');
};

/**
 *
 */
export function emptyArray(ary) {
    ary.splice(0, ary.length)
};

export function forEach(ary, fn) {
    for (var i = 0; i < ary.length; i++) {
        var result = fn(ary[i], i, ary);
        if (result === true) {
            return result;
        }
    }
};

export function removeByValue(ary, value) {
    for (var i = 0; i < ary.length; i++) {
        if (ary[i] === value) {
            ary.splice(i, 1);
            break;
        }
    }
};

export function log(msg) {
    console.log(msg);
};

/**
 * 给一个element绑定一个针对event事件的响应，响应函数为listener
 * @param {[type]} element  [description]
 * @param {[type]} event    [description]
 * @param {[type]} listener [description]
 */
export function addEvent(element, event, listener) {
    if (element.addEventListener) {
        element.addEventListener(event, listener, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + event, listener);
    } else {
        element["on" + event] = listener;
    }
};
/**
 * 取消一个element 已绑定的事件
 * @param  {[type]} element  [description]
 * @param  {[type]} event    [description]
 * @param  {[type]} listener [description]
 * @return {[type]}          [description]
 */
export function removeEvent(element, event, listener) {
    if (element.removeEventListener) {
        element.removeEventListener(event, listener, false);
    } else if (element.detachEvent) {
        element.detachEvent('on' + event, listener);
    } else {
        element['on' + event] = null;
    }
};

export function getStyle(element, attr) {
    //IE写法
    if (element.currentStyle) {
        return element.currentStyle[attr];
        //标准
    } else {
        return getComputedStyle(element, false)[attr];
    }
};
