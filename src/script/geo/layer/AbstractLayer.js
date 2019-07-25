/**
 * @author lxf emailAddressauthor:lxf
 * @description abstruct class for all of layer
 */

/**
 * 所有图层的基类
 * 
 * @class AbstractLayer
 */
class AbstractLayer {
    /**
     * Creates an instance of Layer.
     * @param {Number} id 图层ID
     * @param {String} name 图层名称
     * @param {String} name 图层英文名称
     * @param {String} url 图层URL
     * @param {Number} index 图层顺序
     * @param {boolean} visible 图层可见性
     * @param {layer} layer 图层对象
     * @param {String} geometryType 图层类型，分为点、线、面
     * 
     * @memberof Layer
     */
    constructor(id, name, type, realname, url, index, visible, layer, geometryType) {
        this._id = id;
        this._index = index || this.id;
        this._name = name;
        this._realname = realname;
        this._url = url;
        this._layer = layer;
        // this._visible = !!visible;
        this.visible = !!visible;
        this._geometryType = geometryType;
        this._type = type;
    }

    set id(val) {
        this._id = val;
    }
    get id() {
        return this._id;
    }

    set index(val) {
        if(this._visible == val) {
            return;
        }
        this._index = val;
        !!this.layer && this.layer.setZIndex && this.layer.setZIndex(val);
    }
    get index() {
        return this._index;
    }

    set name(val) {
        this._name = val;
    }
    get name() {
        return this._name;
    }

    set realname(val) {
        this._realname = val;
    }
    get realname() {
        return this._realname;
    }

    set url(val) {
        this._url = val;
    }
    get url() {
        return this._url;
    }

    get visible() {
        return this._visible;
    }

    set visible(val) {
        this._visible = val;
        !!this._layer && !!this._layer.setVisible && this._layer.setVisible(val);
    }

    set layer(val) {
        this._layer = val;
    }
    get layer() {
        return this._layer;
    }

    set geometryType(val) {
        this._geometryType = val;
    }

    get geometryType() {
        return this._geometryType;
    }

    set type(val) {
        this._type = val;
    }
    get type() {
        return this._type;
    }
}

export default AbstractLayer