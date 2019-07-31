//地图
import Map from "ol/Map";
import View from "ol/View";
//图层
import OSM from "ol/source/OSM";
import BaseLayer from 'ol/layer/Base';
import TileLayer from "ol/layer/Tile";
import VectorLayer from 'ol/layer/Vector';
import ImageLayer from 'ol/layer/Image';
import LayerGroup from 'ol/layer/Group';
import VectorTileLayer from 'ol/layer/VectorTile';
//图层资源
import VectorSource from 'ol/source/Vector';
import VectorTile from 'ol/source/VectorTile';
import XYZ from 'ol/source/XYZ';
import WMTS from "ol/source/WMTS"
import TileWMS from 'ol/source/TileWMS';
import ImageArcGISRest from 'ol/source/ImageArcGISRest';
//要素
import Point from "ol/geom/Point"
import LineString from "ol/geom/LineString"
import Polygon from "ol/geom/Polygon"
import MultiPolygon from 'ol/geom/MultiPolygon';
import Feature from 'ol/Feature';
//样式
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import CircleStyle from "ol/style/Circle";
import Icon from 'ol/style/Icon';
import Text from 'ol/style/Text';
//绘图
import Draw from 'ol/interaction/Draw';
//覆盖物
import Overlay from "ol/Overlay"
//格式
import MVT from 'ol/format/MVT';
import GeoJSON from 'ol/format/GeoJSON';
import EsriJSON from "ol/format/EsriJSON"
//格网
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import TileGrid from 'ol/tilegrid/TileGrid';
//事件
import {
  unByKey
} from "ol/Observable"
//投影
import {
  transform,
  addProjection,
  addCoordinateTransforms
} from "ol/proj"
//范围
import {
  getCenter
} from "ol/extent"
//交互
import Select from "ol/interaction/Select"
import {
  pointerMove,
  singleClick
} from "ol/events/condition"

import axios from "axios"
import bus from '@/script/bus';
import config from '@/script/config.js';
import {
  removeAllOverlay,
  arryRemove
} from '@/script/mapUtils/myMaputils/myUtils.js';
import tree2dLayers from "../components/cjMap/configs/tree2dLayers";

let hoverLayer, clickLayer, hoverFullPoint, clickFullPoint;

const init2Map = () => {
  config['MAP_VIEW']["zoom"] -= 1;
  let map = new Map({
    view: new View(config['MAP_VIEW']),
    logo: false,
    controls: [],
  })
  initFullLayer(map);
  return map;
}
//初始化全局hover图层、click图层
const initFullLayer = (map) => {
  hoverLayer = new VectorLayer({
    source: new VectorSource(),
    zIndex: 9000
  })
  map.addLayer(hoverLayer)
  clickLayer = new VectorLayer({
    source: new VectorSource(),
    zIndex: 9000
  })
  map.addLayer(clickLayer)
  createFullPoints(hoverLayer, clickLayer)
}
const createFullPoints = (hoverLayer, clickLayer) => {
  hoverFullPoint = new Feature({
    geometry: new Point(config['MAP_VIEW'].center)
  })
  hoverFullPoint.setStyle(new Style({}));
  hoverLayer.getSource().addFeature(hoverFullPoint)
  clickFullPoint = new Feature({
    geometry: new Point(config['MAP_VIEW'].center)
  })
  clickFullPoint.setStyle(new Style({}));
  clickLayer.getSource().addFeature(clickFullPoint)
}

const treeLayersForeach = (treeconfigs, payload) => {
  treeconfigs.forEach(v => {
    if (v.type && v.layerName) {
      if (payload.layerName == v.layerName) {
        v.visible = payload.show
      }
    }
    if (v.children) {
      treeLayersForeach(v.children, payload)
    }
  })
}

const toggleAllLayers = (treeconfigs, show) => {
  treeconfigs.forEach(v => {
    if (v.type) {
      v.visible = show
    }
    if (v.children) {
      toggleAllLayers(v.children, show)
    }
  })
}

export default {
  state: {
    map: init2Map(),
    arrivalIndex: 0,
    arrivalOlIndex: 0,
    sortGroupGridsLength: 0,
    sortGroupGrids3857Length: 0,
    floodingColorsHtml: {
      1: "#A6FF00",
      2: "#82F630",
      3: "#52F13A",
      4: "#1DEC40",
      5: "#22DE31",
      6: "#33CD32"
    },
    floodingColors: { //由浅入深
      1: {
        name: "<0.5m  ",
        color: "rgba(166,255,0,0.4)"
      },
      2: {
        name: "0.5~1.0m",
        color: "rgba(130,246,48,0.4)"
      },
      3: {
        name: "1.0~1.5m",
        color: "rgba(82,241,58,0.4)"
      },
      4: {
        name: "1.5~2.0m",
        color: "rgba(29,236,64,0.4)"
      },
      5: {
        name: "2.5~5.0m",
        color: "rgba(34,222,49,0.4)"
      },
      6: {
        name: ">5.0m",
        color: "rgba(51,205,50,0.4)"
      }
    },
    floodingColors2d: { //由浅入深
      1: {
        name: "<0.5m  ",
        color: "rgba(166,255,0,0.6)"
      },
      2: {
        name: "0.5~1.0m",
        color: "rgba(130,246,48,0.6)"
      },
      3: {
        name: "1.0~1.5m",
        color: "rgba(82,241,58,0.6)"
      },
      4: {
        name: "1.5~2.0m",
        color: "rgba(29,236,64,0.6)"
      },
      5: {
        name: "2.5~5.0m",
        color: "rgba(34,222,49,0.6)"
      },
      6: {
        name: ">5.0m",
        color: "rgba(51,205,50,0.6)"
      }
    },
    hoverLayer: hoverLayer,
    clickLayer: clickLayer,
    hoverFullPoint: hoverFullPoint,
    clickFullPoint: clickFullPoint,
    is3dMap: false,
    cursorType: "default",
    fullScreen: [],
    treeConfigs: [], //二维图层树初始化数组对象
    tree3dConfigs: [], //三维图层树初始化对象
    identity3dHandler: null, //三维点击事件
    curDropDown: "",
    selectTreeLayers: [],
    select3dTreeLayers: [],
    addedLayers: [], //存储交互的图层对象
    modelIndex: 0,
    imageryLayerIndex: 0,
    locationArea: {
      厄瓜多尔: {
        two: {
          zoom: 7,
          center: [-8686221.462481024, -201351.12135328056]
        },
        three: {
          x: 1531796.6667358684,
          y: -7524542.170948848,
          z: -224259.17558360103
        }
      },
      长江流域: {
        two: {
          zoom: config["MAP_VIEW"].zoom + 1,
          center: config["MAP_VIEW"].center
        },
        three: {
          x: -2369656.078852757,
          y: 7695218.490253461,
          z: 4795273.229561688
        }
      },
      长江流域综合规划: {
        two: {
          zoom: config["MAP_VIEW"].zoom + 1,
          center: config["MAP_VIEW"].center
        },
        three: {
          x: -2369656.078852757,
          y: 7695218.490253461,
          z: 4795273.229561688
        }
      },
      水体: {
        two: {
          zoom: config["MAP_VIEW"].zoom + 1,
          center: config["MAP_VIEW"].center
        },
        three: {
          x: -2369656.078852757,
          y: 7695218.490253461,
          z: 4795273.229561688
        }
      },
      水利工程: {
        two: {
          zoom: config["MAP_VIEW"].zoom + 1,
          center: config["MAP_VIEW"].center
        },
        three: {
          x: -2369656.078852757,
          y: 7695218.490253461,
          z: 4795273.229561688
        }
      },
      区划: {
        two: {
          zoom: config["MAP_VIEW"].zoom + 1,
          center: config["MAP_VIEW"].center
        },
        three: {
          x: -2369656.078852757,
          y: 7695218.490253461,
          z: 4795273.229561688
        }
      },
      涉水建筑物: {
        two: {
          zoom: config["MAP_VIEW"].zoom + 1,
          center: config["MAP_VIEW"].center
        },
        three: {
          x: -2369656.078852757,
          y: 7695218.490253461,
          z: 4795273.229561688
        }
      },
      水文气象: {
        two: {
          zoom: config["MAP_VIEW"].zoom + 1,
          center: config["MAP_VIEW"].center
        },
        three: {
          x: -2369656.078852757,
          y: 7695218.490253461,
          z: 4795273.229561688
        }
      },
      水事及水行政: {
        two: {
          zoom: config["MAP_VIEW"].zoom + 1,
          center: config["MAP_VIEW"].center
        },
        three: {
          x: -2369656.078852757,
          y: 7695218.490253461,
          z: 4795273.229561688
        }
      },
    },
    searchCloseShow: false,
    searchLoadStatus: false,
    showCollapse: true,
    cesiumViewer: null,
    renderLayers: [], //用于渲染的所有图层对象，便于统一管理
    seachRenderLayers: [], //搜索框功能模块：用于渲染的所有图层
    current3dRenderFeatures: [], //3D场景实时数据
    fitExtent: null,
    themeLayer: null,
    inLayerinitOrNot: false, //鹰眼地图有没有初始化
    interactions: {},
    selectedFeature: null,
    selectedItem: null,
    stationsOverlay: [],

    hoveredFeature: {
      type: 'other',
      feature: null
    },
    showSeachPanel: true,
    wqMonitors: null,
    isOverviewShow: false,
    currentBasemap: {}, //当前选择底图
    basemap3857: [],
    //所有的注册事件管理器，注销事件，目前有测距、侧面、identify

    mapEventHistory: {
      removeInteraction: [],
      unByKey: []
    }, //地图事件管理器，管理用户当前事件，配合MapToolbar控件使用
    themeLayerList: [], //专题图层列表
    selectedThemeLayerList: [], //当前被选中的图层列表
    positionMarker: null, //定位查询overlay
    baseTreeNode: [], // 构建图层树状结构
    overviewMap: null, // 地图缩略图对象
    //xr test tree node exchange
    // locationData: [], //位置信息
    mapOverlay: [], // 地图当前高亮的河流，marker，便于清除
    // animation: null,
    // lastMapView: null, // 上次地图视图
    meatureMapOverlayHistory: {
      removeLayer: [],
      removeOverlay: []
    }, // 测量操作地图图层管理器，记录用户操作中在地图上添加的图层，配合MapToolbar控件使用
    searchWords: '',
    currentTheme: null, //当前专题的名称：wq 、wt等
    wqEstimate: null,
    //图例
    wqRate: null, //图例是否显示
    lengendTypeName: null, //图例类型名
    wtEstimate: null,
    searchboxShowDetail: false,
    //toolbar
    isMultiMonth: false,
    dateRange: null,
    norltShow: true,
    seachNorltShow: null,
    //info-panel
    showInfoPanel: false,
    //map-legend
    //map-layersManagerControl
    layersDataList: [], //专题图层配置文件数据：对应layer-config-tree.json
    baseLayersDataList: [], //底图图层配置文件数据：对应baselayer.json
    //identifyResult
    identifyMapNames: [], //按顺序排列的图层地图服务的名字
    identifyOldMapNames: [], //过滤后按顺序排列的图层地图服务的名字
    identifyListData: {
      total: 0,
      identifyList: []
    },
    //搜索条---搜索结果
    seachOldMapNames: [], //过滤后按顺序排列的图层地图服务的名字
    seachListData: {
      total: 0,
      seachList: []
    }, //查询解析后的结果
    isWait: false, //等待加载动画
    waitName: '查询中', //默认的等待名称

    //散射点动画对象（包括坐标和颜色属性）:用于定位点时设置动画，o对应组件sctterAmtOverlay.vue
    scatterAnimation: {
      coordinate: null,
      color: 'red'
    },

    //一张图模糊查询地图服务
    overAllSearchMapservices: [{
      name: '水闸', //蔡家湖闸
      url: `/map178/rest/services/cjcenter/水闸/MapServer/find?layers=1&f=pjson&searchFields=MC&searchText=`
    }, {
      name: '泵站', //杨河泵站
      url: `/map178/rest/services/cjcenter/泵站/MapServer/find?layers=1&f=pjson&searchFields=MC&searchText=`
    }, {
      name: '蓄滞洪区', //六角山
      url: `/map178/rest/services/cjcenter/蓄滞洪区分布/MapServer/find?layers=0&f=pjson&searchFields=XZHQMC&searchText=`
    }],
    riverSectionWQLayer: null,
    //basemap selector
    basemapList: {},

  },
  mutations: {
    //切换二维、三维同层显示与隐藏
    toggleLayerByName: (state, payload) => {
      console.log('payload: ', payload);
      if (payload.layerName) {
        if (payload.type == "two") {
          treeLayersForeach(state.treeConfigs, payload)
        } else if (payload.type == "three") {
          treeLayersForeach(state.tree3dConfigs, payload)
        }
      }
    },
    //隐藏二维、三维的所有图层
    toggleAllLayers: (state, payload) => {
      if (payload.type == "two") {
        toggleAllLayers(state.treeConfigs, payload.show)
      } else if (payload.type == "three") {
        toggleAllLayers(state.tree3dConfigs, payload.show)
      }
    },
    //清除交互产生的要素,目前有点拾取\宏数数据坐标点查看标注
    clearAddedLayersSource: (state) => {
      if (state.addedLayers.length > 0) {
        state.addedLayers.forEach(v => {
          if (v instanceof VectorLayer) {
            v.getSource()
              .clear()
          }
        })
      }
    },
    ["SET_ACTIVE_NAME"]: (state, val) => {
      state.curActiveName = val;
    },
    ["SET_SUBMENU_ACTIVE_NAME"]: (state, val) => {
      state.curSubmenuActiveName = val;
    },
    ["SET_ACTIVE_TOOL_INSTANCE"]: (state, val) => {
      state.curActiveToolInstance = val;
    },
    //等待加载动画
    SET_LOADING_ANIMATION_STATUS: (state, status, waitName) => {
      // debugger;
      state.isWait = status;
      state.waitName = waitName ? waitName : '查询中';
    },
    //map-layersControl/////////////////////////////////////////////////////////
    SET_LAYER_LIST(state, data) {
      //
      state.layersDataList = data;
    },
    SET_BASELAYER_LIST(state, data) {
      //
      state.baseLayersDataList = data;
    },
    SET_THEMELAYERLIST: (state, themeLayerList) => {
      state.themeLayerList = themeLayerList;
      // 每次重新获取layer list 的时候，init 图层树形结构
      state.baseTreeNode = getChildren(state.themeLayerList);
      //
      setZIndex(state.baseTreeNode);
    },
    //控制图例显示隐藏
    SET_LEGEND_SHOW_OR_HIDE(state, payload) {
      if (payload.show == true) {
        state.lengendTypeName = payload.lengendTypeName;
        state.wqRate = payload.show;
      } else {
        state.wqRate = null;
      }
    },
    //底图切换
    SET_BASEMAP_LIST: (state, basemapList) => {
      if (basemapList instanceof Array) {
        let basemapDict = {};
        _.forEach(basemapList, (v, i) => {
          basemapDict[v.id] = v;
        });
        state.basemapList = basemapDict;
      } else {
        state.basemapList = basemapList;
      }
    },
    SET_CURRENT_MAP_BASEMAP: (state, basemap) => {
      if (basemap.type == "arcgis-wmts3857") {
        state.map.get(basemap.realname).setVisible(true)
        for (let i = 0; i < state.basemap3857.length; i++) {
          if (state.basemap3857[i].real_name != basemap.realname) {
            state.map.get(state.basemap3857[i].real_name).setVisible(false)
          }
        }
        state.currentBasemap.visible = false
      } else {
        for (let i = 0; i < state.basemap3857.length; i++) {
          state.map.get(state.basemap3857[i].real_name).setVisible(false)
        }
        state.currentBasemap = basemap;
        basemap.visible = true;
      }
    },
    //map
    SET_MAP_TARGET(state, target) {
      state.map.setTarget(target);
    },

    SET_FIT_EXTENT(state, val) {
      state.fitExtent = val;
    },
    SET_MAP2(state, val) {
      state.map = val;
    },
    SET_THEME_LAYER2(state, val) {
      state.themeLayer = val;
      const map = state.map;
      if (map && map.addLayer && val) {
        map.addLayer(val);
      }
    },
    ADD_MAP_INTERACTION(state, kv) {
      state.interactions[kv.key] = kv.val;
      const map = state.map;
      if (map && map.addInteraction) {
        map.addInteraction(kv.val);
      }
    },
    CLEAR_MAP_INTERACTION(state) {
      const interactions = state.interactions;
      const map = state.map;
      if (map) {
        _.forEach(interactions, (v, k) => {
          map.removeInteraction(v);
        });
      }
      state.interactions = {};
    },
    REMOVE_THEME_LAYER(state) {
      const themeLayer = state.themeLayer;
      const map = state.map;

      if (themeLayer && themeLayer instanceof BaseLayer && map && map.removeLayer) {
        map.removeLayer(themeLayer);
      }
      state.themeLayer = null;
    },
    SET_SELECTED_FEATURE(state, val) {
      state.selectedFeature = val;
    },
    SET_SELECTED_ITEM(state, val) {
      console.log('val: ', val);
      state.selectedItem = val;
    },
    SET_HOVERED_FEATURE(state, val) {
      state.hoveredFeature = val;
    },
    //info panel
    SHOW_MAP_INFO_PANEL(state, val) {
      state.showInfoPanel = val;
    },
    //searchbox
    SET_CURRENT_THEME(state, val) {
      state.currentTheme = val;
    },
    SET_MONITORS_ESTATE(state, val) {
      state.wqEstimate = val;
    },
    SET_MONITORS_RATE(state, val) {
      state.wqRate = val;
    },
    SET_SEARCH_WORDS(state, val) {
      state.searchWords = val;
    },
    SET_SEARCHBOX_SHOW_DETAIL(state, val) {
      state.searchboxShowDetail = val;
    },
    //toolbar
    SET_MULTI_MONTH(state, val) {
      state.isMultiMonth = val;
    },
    SET_DATE_RANGE(state, val) {
      state.dateRange = val;
    },
    //清除事件管理器，注销事件，目前有测距、侧面、identify
    CLEAR_MAP_EVENTS(state) {
      let map = state.map;
      if (map instanceof Map) {
        _.forEach(state.mapEventHistory, (v, k) => {
          while (v[0]) {
            let event = v.pop();
            unByKey(event)
          }
        });
      }
      console.log('CLEAR_MAP_EVENTS后unByKey[]的值为：', state.mapEventHistory.unByKey);
    },
    CLEAR_MAP_OVERLAY(state) {
      let map = state.map;
      state.mapOverlay.forEach((item) => {
        if (item instanceof Overlay) {
          state.map.removeOverlay(item);
        } else {
          state.map.removeLayer(item);
        }
      });
      state.mapOverlay = [];

      //清除定位查询overlay
      state.positionMarker = null;
      //清除indentify功能添加的交互图层
      state.renderLayers.forEach((layer) => {
        if (layer instanceof VectorLayer) {
          layer.getSource().clear();
        }
      });
    },
    //清除除搜索框功能之外添加的交互图层 ，此处为identify的
    CLEAR_IDENTIFY_LAYERS(state) {
      state.renderLayers.forEach((layer) => {
        if (layer instanceof VectorLayer) {
          layer.getSource().clear();
        }
      });
    },
    //清除搜索框功能添加的交互图层 ，
    CLEAR_SEACH_LAYERS(state) {
      state.seachRenderLayers.forEach((layer) => {
        if (layer instanceof VectorLayer) {
          layer.getSource().clear();
        }
      });
    },
    ADD_MAP_OVERLAY(state, overlay) {
      if (overlay) {
        state.mapOverlay.push(overlay);
        if (overlay instanceof Overlay) {
          state.map.addOverlay(overlay);
        } else {
          state.map.addLayer(overlay);
        }
      }
    },
    REMOVE_MAP_OVERLAY(state, overlay) {
      if (overlay) {
        _.remove(state.mapOverlay, (item) => {
          return item == overlay;
        });
        if (overlay instanceof Overlay) {
          state.map.removeOverlay(overlay);
        } else {
          state.map.removeLayer(overlay);
        }
      }
    },
    CLEAR_MEASURE_MAP_OVERLAY(state) {
      let map = state.map;
      if (map instanceof Map) {
        _.forEach(state.meatureMapOverlayHistory, (v, k) => {
          while (v[0]) {
            let overlay = v.pop();
            // map[k].call(map, overlay);
            map[k](overlay);
          }
        });
      }
    },
    SET_CURSOR_TYPE(state, val) {
      state.cursorType = val;
    },
    //设置散射动画坐标点
    set_sctterAnimationPoint(state, scatterAnimation) {
      state.scatterAnimation = scatterAnimation;
    },
    //隐藏散射点
    hideScatterAnimation(state) {
      console.log('散射点隐藏');
      state.scatterAnimation = {
        coordinate: undefined,
        color: 'red'
      };
    },
    //回到全幅
    animateToOriginView(state) {
      state.map.getView().animate({
        center: config['MAP_VIEW'].center,
        zoom: config['MAP_VIEW'].zoom + 1
      });
    }
  },
  actions: {
    //搜索框关闭事件，清除搜索、identify等所有的渲染结果
    ALL_CLOSE_CLEAR({
      commit
    }) {
      //清楚搜索框渲染图层
      commit('CLEAR_SEACH_LAYERS');
      //清楚搜索框渲染图层
      commit('CLEAR_IDENTIFY_LAYERS');
      commit('hideScatterAnimation');
      //清除弹出标题
      commit("SET_HOVERED_FEATURE", {
        type: "overAllSearch",
        feature: null
      })
    },

    //----------------------------identifyAction---
    //根据选择的多个图层列表，请求identidfy数据
    LOAD_IDENTIFYLIST_DATA({
      state,
      commit
    }, payload) {
      // debugger
      console.log('点查询开始');
      let promiseArr = [];
      _.forEach(payload.LayersConfigs, (layerconfig) => {
        console.log('layerconfig: ', layerconfig);
        if (layerconfig.type && layerconfig.type == "prj4326") {
          let arr = payload.geometry.split(",");
          let leftbottm = transform([arr[0], arr[1]], "EPSG:3857", "EPSG:4326")
          let topright = transform([arr[2], arr[3]], "EPSG:3857", "EPSG:4326")
          payload.geometry = leftbottm[0] + "," + leftbottm[1] + "," + topright[0] + "," + topright[1];
          let mapExtent1 = transform([payload.mapExtent[0], payload.mapExtent[1]], "EPSG:3857", "EPSG:4326")
          let mapExtent2 = transform([payload.mapExtent[2], payload.mapExtent[3]], "EPSG:3857", "EPSG:4326")
          payload.mapExtent = mapExtent1.concat(mapExtent2)
        }
        let url = `${layerconfig.url}?geometry=${payload.geometry}&f=${payload.f}&geometryType=${payload.geometryType}&tolerance=${payload.tolerance}&mapExtent=${payload.mapExtent}&imageDisplay=${payload.imageDisplay}`;
        promiseArr.push(axios.get(url));
      });
      return axios.all(promiseArr);

    }
  },
  getters: {
    //map
    map(state) {
      return state.map;
    },

    cesiumViewer(state) {
      return state.cesiumViewer;
    },
    //获取图层管理配置文件数据layer-confi-tree.json
    getLayersConfigList(state) {
      return state.layersDataList;
    },

    themeLayerList(state) {
      return state.themeLayerList;
    },
    mapServices(state) {
      return state.mapServices;
    },
    mapMonitorCategories(state) {
      return state.monitorCategories;
    },
    mapCurrentTheme(state) {
      return state.currentTheme;
    },
    mapFitExtent(state) {
      return state.fitExtent;
    },
    mapSelectedFeature(state) {
      return state.selectedFeature;
    },
    mapHoveredFeature(state) {
      return state.hoveredFeature;
    },
    mapSelectedItem(state) {
      return state.selectedItem;
    },
    mapThemeLayer(state) {
      return state.themeLayer;
    },
    mapRiverSectionWQLayer(state) {
      return state.riverSectionWQLayer;
    },
    //searchbox
    mapSearchWords(state) {
      return state.searchWords;
    },
    mapSearchboxShowDetail(state) {
      return state.searchboxShowDetail;
    },
    //toolbar
    mapIsMultiMonth(state) {
      return state.isMultiMonth;
    },
    //map info panel
    mapShowInfoPanel(state) {
      return state.showInfoPanel;
    },
    //------------------------identifyGetters------------------------------
    getIdentifyData(state) {
      return state.identifyListData.identifyList;
    },


    getLoadingAnimationName(state) {
      return state.waitName;
    },
    getLoadingAnimationStatus(state) {
      return state.isWait;
    },
    //散射点动画属性
    getScatterAnimation(state) {
      return state.scatterAnimation;
    },



  }

}
