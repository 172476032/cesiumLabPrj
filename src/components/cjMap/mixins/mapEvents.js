import RenderFeature from 'ol/render/Feature';
import Style from 'ol/style/Style';
import turf from 'turf';
import centerOfMass from '@turf/center-of-mass';
import {
  changeKeys
} from '@/script/mapUtils/myMaputils/myUtils.js';
const fieldConfig = require('../configs/fieldsConfig.json');

//底图点击事件
export default {
  data() {
    return {};
  },
  methods: {
    //-----------------------------------------------------------------------------	 
    vtPointMoveEvt(e) {
      let f = this.map.getFeaturesAtPixel(e.pixel);
      // console.log("f: ", f);
      if (!f) {
        this.map.getTargetElement().style.cursor = this.cursorType;
        //重置点
        this.hoverFullPoint.setStyle(new Style({}));
      } else {
        // console.log(" f[0]: ", f[0]);
        //矢量瓦片的特有feature
        //对点状要素禁止交互，优化流畅度
        if (
          f[0] instanceof RenderFeature &&
          f[0].getProperties().setprops.layerZoom <= this.curMapZoom
        ) {
          let props = f[0].getProperties(),
            type = f[0].getType(),
            coords = f[0].getFlatCoordinates(),
            labelName = props[props.setprops.labelField], //图标的标注字段
            hoverStyle = props.setprops.hoverStyle,
            layerName = props.setprops.layerName,
            uuId = props.setprops.uuId; //图标的hover样式
          this.map.getTargetElement().style.cursor = "pointer";
          if (type == "Point") {
            this.hoverFullPoint.getGeometry().setCoordinates(coords);
            this.hoverFullPoint.setStyle(hoverStyle(labelName));
          } else if (type == "LineString") {
            this.selection = {};
            this.selection[f[0].get(uuId)] = f[0];
            this.map
              .get(layerName)
              .setStyle(this.map.get(layerName).getStyle());
          } else if (type == "Polygon") {
            this.selection = {};
            this.selection[f[0].get(uuId)] = f[0];
            this.map
              .get(layerName)
              .setStyle(this.map.get(layerName).getStyle());
          }
        }
      }
    },
    vtClick(map, e) {
      let f = map.getFeaturesAtPixel(e.pixel);
      console.log("f: ", f);
      if (f) {
        for (let i = 0; i < f.length; i++) {
          let v = f[i]
          //矢量瓦片的特有feature
          //对点状要素禁止交互，优化流畅度
          if (
            v instanceof RenderFeature &&
            v.getProperties().setprops.layerZoom <= this.curMapZoom
          ) {
            let type = v.getType(),
              props = v.getProperties(),
              coords = v.getFlatCoordinates(),
              labelName = props[props.setprops.labelField], //图标的标注字段
              hoverStyle = props.setprops.hoverStyle, //图标的hover样式
              layerName = props.setprops.layerName, //图层英文名
              realName = props.setprops.realName, //图层真实名称
              uuId = props.setprops.uuId,
              feature; //图标的hover样式
            if (type == "Point") {
              this.clickFullPoint.getGeometry().setCoordinates(coords);
              this.clickFullPoint.setStyle(hoverStyle(labelName));
            } else if (type == "LineString") {
              let len = coords.length;
              coords =
                (len / 2) % 2 == 0 ? [coords[len / 2], coords[len / 2 + 1]] : [coords[len / 2 - 1], coords[len / 2]];
              this.selection = {};
              this.selection[v.get(uuId)] = v;
              this.map
                .get(layerName)
                .setStyle(this.map.get(layerName).getStyle());
            } else if (type == "Polygon") {
              coords = this.getCenterOfRenderFeature(coords);
              this.selection = {};
              this.selection[v.get(uuId)] = v;
              this.map
                .get(layerName)
                .setStyle(this.map.get(layerName).getStyle());
            }
            // 设置散射点           
            map.getView().animate({
              center: coords
            });
            //弹出模态框
            this.showModal({
              mapServerName: realName,
              featureName: labelName,
              attributes: props
            });
            console.log('v: ', v);
            break; //click会依次获取点击到的点、线、面要素，按照index添加到数组内，渲染第一个，然后终止
          }
        };
      }
    },
    showModal(data) {
      //弹出模态框
      this.mapServerName = data.mapServerName;
      this.featureName = data.featureName;
      //确定所需显示的数据类型，根据图层的类型判断
      this.attributes = this.deleteAddProps(data.attributes, data.mapServerName);
      this.getSttpStcd(data.mapServerName, data.attributes);
      this.infoShow = true;
    },
    deleteAddProps(props, mapServerName) {
      let attr = Object.assign({}, props),
        sortAttr = {};
      // console.log("attr,props: ", attr, props);
      attr.OBJECTID ? delete attr.OBJECTID : true;
      attr.layer ? delete attr.layer : true;
      attr.setprops ? delete attr.setprops : true;
      attr.RuleID ? delete attr.RuleID : true;
      attr.SHAPE_Area ? delete attr.SHAPE_Area : true;
      attr.SHAPE_Leng ? delete attr.SHAPE_Leng : true;
      if (mapServerName == '蓄滞洪区分布') {
        sortAttr.LYDM = attr.LYDM;
        sortAttr.XZQDM = attr.XZQDM && attr.XZQDM != 'NULL' ? attr.XZQDM : '-';
        sortAttr.XZHQDM = attr.XZHQDM;
        sortAttr.MC = attr.XZHQMC;
        sortAttr.XZHQLX = attr.XZHQLX;
        sortAttr.XZHQLX_GH = attr.XZHQGHLX != '' ? attr.XZHQGHLX : '-';
        sortAttr.DJ = attr.DJ != 0 ? attr.DJ : '-';
        sortAttr.BW = attr.BW != 0 ? attr.BW : '-';
        sortAttr.SZHX = attr.SZHX;
        sortAttr.SZXZQH = attr.SZXZQH;
        sortAttr.XJSJ = attr.XJSJ;
        sortAttr.QYBZ = attr.QYBZ;
        sortAttr.GLDWMC = attr.GLDWMC;
        sortAttr.ZGDWMC = attr.ZGDWMC;
        sortAttr.JJRK = attr.JJRK;
        sortAttr.ZYRK = attr.ZYRK;
        sortAttr.SJXZS = attr.SJXZS;
        sortAttr.SJXZCS = attr.SJXZCS;
        sortAttr.RK = attr.RK;
        sortAttr.XZHQMJ = attr.XZHQMJ;
        sortAttr.XZHQRJ = attr.XZHQRJ;
        sortAttr.ZDXHSH = attr.ZDXHSH;
        sortAttr.XZHQFWJS = attr.XZHQFWJS;
        sortAttr.GDMJ = attr.GDMJ;
        sortAttr.ZYQY = attr.ZYQY;
        sortAttr.ZYDL = attr.ZYDL;
        sortAttr.ZYQL = attr.ZYQL;
        sortAttr.XZHQ_GDP = attr.XZHQ_GDP;
        sortAttr.NYZCZ = attr.NYZCZ;
        sortAttr.GYZCZ = attr.GYZCZ;
        sortAttr.SHZCZ = attr.SHZCZ;
        sortAttr.GDZCZ = attr.GDZCZ;
        sortAttr = changeKeys(sortAttr, fieldConfig.xzhq);
      } else if (mapServerName == '水闸') {
        // let coords;
        // if (attr.DJ && attr.DJ != 0 && attr.BW && attr.BW != 0) {
        //   coords = ol.proj.transform(
        //     [attr.BW, attr.DJ],
        //     "EPSG:3857",
        //     "EPSG:4326"
        //   );
        // } else {
        //   coords = ["-", "-"];
        // }
        sortAttr.MC = attr.MC;
        sortAttr.XZHQDM = attr.XZHQDM;
        sortAttr.GCDM = attr.GCDM != '' ? attr.GCDM : '-';
        sortAttr.DJ = attr.DJ != 0 ? attr.DJ : '-';
        sortAttr.BW = attr.BW != 0 ? attr.BW : '-';
        sortAttr.GCWZ = attr.GCWZ;
        sortAttr.SZLX = attr.SZLX;
        sortAttr.SZHL = attr.SZHL;
        sortAttr.JCRQ = attr.JCRQ;
        sortAttr.GCDB = attr.GCDB;
        sortAttr.ZKSL = attr.ZKSL;
        sortAttr.ZKZJK = attr.ZKZJK;
        sortAttr.SJHL = attr.SJHL;
        sortAttr.GZLL = attr.GZLL;
        sortAttr.SJKSBZ = attr.SJKSBZ;
        sortAttr.JXKSBZ = attr.JXKSBZ;
        sortAttr.XZ = attr.XZ;
        sortAttr.LYDM = attr.LYDM;
        sortAttr.XZQDM = attr.XZQDM && attr.XZQDM != 'NULL' ? attr.XZQDM : '-';
        sortAttr.CODE = attr.CODE;
        sortAttr = changeKeys(sortAttr, fieldConfig.shuizha);
      } else if (mapServerName == '泵站') {
        //排序
        sortAttr.MC = attr.MC;
        sortAttr.XZHQDM = attr.XZHQDM;
        sortAttr.GCDM = attr.GCDM != '' ? attr.GCDM : '-';
        sortAttr.DJ = attr.DJ != 0 ? attr.DJ : '-';
        sortAttr.BW = attr.BW != 0 ? attr.BW : '-';
        sortAttr.GCWZ = attr.GCWZ;
        sortAttr.SZHL = attr.SZHL;
        sortAttr.JCRQ = attr.JCRQ;
        sortAttr.GCDB = attr.GCDB;
        sortAttr.ZJLL = attr.ZJLL;
        sortAttr.ZJGL = attr.ZJGL;
        sortAttr.SJYC = attr.SJYC;
        sortAttr.SBSL = attr.SBSL;
        sortAttr.LYDM = attr.LYDM;
        sortAttr.XZQDM = attr.XZQDM;
        sortAttr.CODE = attr.CODE;
        //key翻译中文
        sortAttr = changeKeys(sortAttr, fieldConfig.bengzhan);
      } else {
        sortAttr = attr;
      }
      // console.log("翻译成中文: ", sortAttr);

      return sortAttr;
    },

    //每个图层的基本信息和监测数据根据此来配置，需要类型sttp和编码stcd
    getSttpStcd(layerName, attributes) {
      if (layerName == '水文站' || layerName == '设计院-水文站') {
        this.sttp = attributes['编码'];
        this.stcd = attributes['编号'];
      } else if (layerName == '水库' || layerName == '设计院-水库') {
        this.sttp = attributes['测站类'];
        this.stcd = attributes['测站编'];
      } else if (layerName == '雨量站' || layerName == '设计院-雨量站') {
        this.sttp = attributes.STTP;
        this.stcd = attributes.STCD;
      } else {
        this.sttp = '';
        this.stcd = '';
      }
    },
    getCenterOfRenderFeature(arr) {
      let newArr = [];
      for (let i = 0; i < arr.length / 2; i++) {
        newArr.push([arr[2 * i], arr[2 * i + 1]]);
      }
      newArr.push(newArr[0]);
      return centerOfMass(turf.polygon([newArr])).geometry.coordinates;
    }
  },
  destroyed() {}
};
