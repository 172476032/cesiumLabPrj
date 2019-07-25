/**
 * author: xr
 * descript: public service config
 */

import {template, getParamString} from '../plugin/Util.js';

// 模块化
import informationCenterService from './modules/informationCenterService'
// import riverTreeService from './modules/riverTreeService'
import inspectService from './modules/inspectService'
import mapThemeService from './modules/mapThemeService'
import organizationService from './modules/organizationService'
import standardService from './modules/standardService'
import searchService from './modules/searchService'
import rvlkService from './modules/rvlkService'
import newsService from './modules/newsService'
import mediaService from './modules/mediaService'

const postBaseUrl = 'http://10.42.113.26:8081/';

const jsonBaseUrl = '/static/';
const infoCenterUrl = '/WEGIS-00-WEB_SERVICENCS/WSWebService';
const infoCenterUrlNew = '/WEGIS-00-WEB_SERVICE_TEST/WSWebService';
const infoCenterUrlMap = '/WEGIS-00-WEB_SERVICE_ONEMAP/WSWebService';
const waterUrl = "/waterchief/"

const urlConfig = {
    geoserverUrl: 'http://172.22.163.12:8081'
}

var HTTPMETHOD = {
    'GET': 'get',
    'POST': 'post',
    'PUT': 'put',
    'DELETE': 'delete'
};

/**
 * 替换json中的URL参数
 * @param {*} data
 */
var replaceUrl = function (data) {
    var key,
        val,
        matchArr,
        i,
        arrVal,
        index;
    var reg = /\${(\S*?)\}/g;
    if (data instanceof Array) {
        for (i = 0; i < data.length; i++) {
            data[i] = replaceUrl(data[i]);
        }
    } else if (data instanceof Object) {
        for (key in data) {
            val = data[key];
            if (typeof val === 'string') {
                matchArr = val.match(reg);
                if (matchArr) {
                    for (i = 0; i < matchArr.length; i++) {
                        arrVal = matchArr[i].substring(2, matchArr[i].length - 1);
                        if (arrVal in urlConfig) {
                            index = val.indexOf(matchArr[i]);
                            val = val.substring(0, index) + urlConfig[arrVal] + val.substring(index + matchArr[i].length);
                        }
                    }
                    data[key] = val;
                }
            } else if (val instanceof Array || val instanceof Object) {
                data[key] = replaceUrl(val);
            }
        }
    }

    return data;
}

/**
 * 每个API有三个参数：
 * url {string} 访问地址
 * method {HTTPMETHOD} 访问方法
 */
var _apiList = {
    // ------------------ 这是一个公共请求，url作为参数传入
    GET_DATA_BY_URL: {
        url: '{url}',
        method: HTTPMETHOD.GET
    },
    POST_DATA_BY_URL: {
        url: '{url}',
        method: HTTPMETHOD.POST
    },
    // 获得图层树结构
    GET_LAYER_TREE: {
        url: jsonBaseUrl + 'jsons/layer-config-tree.json',
        method: HTTPMETHOD.GET,
        replaceMethod: replaceUrl
    },
    // 获得基础地图
    GET_BASE_LAYER: {
        url: jsonBaseUrl + 'jsons/baselayers.json',
        method: HTTPMETHOD.GET,
        replaceMethod: replaceUrl
    },
    //获取湖北省坐标数据
    GET_HUBEI_VECTOR: {
        url: jsonBaseUrl + 'geoJsons/hubeiVector.json',
        method: HTTPMETHOD.GET
    },
    //获取湖北省坐标数据
    GET_YUNNAN_VECTOR: {
        url: jsonBaseUrl + 'geoJsons/yunnanVector.json',
        method: HTTPMETHOD.GET
    },
    // 获取所有标绘
    GET_ALL_PLOT: {
        url: postBaseUrl + 'solr/icons',
        method: HTTPMETHOD.GET
    },
    // 新增标绘
    ADD_NEW_PLOT: {
        url: postBaseUrl + 'solr/icons',
        method: HTTPMETHOD.POST
    },
    // 添加标绘文件
    ADD_PLOT_FILES: {
        url: postBaseUrl + 'solr/files',
        method: HTTPMETHOD.POST
    },
    // 获取一个标绘
    GET_UNIQE_PLOT: {
        url: postBaseUrl + 'solr/icons/{iconid}',
        method: HTTPMETHOD.GET
    },
    // 获取一个标绘的所有file
    GET_PLOT_FILES: {
        url: postBaseUrl + 'solr/files/{iconid}',
        method: HTTPMETHOD.GET
    },
    // 获取共享标绘
    GET_SHARE_PLOT: {
        url: postBaseUrl + 'solr/icons/share?share=1',
        method: HTTPMETHOD.GET
    },
    // 获取个人标绘
    GET_SELF_PLOT: {
        url: postBaseUrl + 'solr/icons/user?user={uid}',
        method: HTTPMETHOD.GET
    },
    // 修改一个标绘
    EDIT_UNIQE_PLOT: {
        url: postBaseUrl + 'solr/updateicons/{iconid}',
        method: HTTPMETHOD.POST
    },
    // 删除一个标绘
    DELETE_UNIQE_PLOT: {
        url: postBaseUrl + 'solr/delicons/{iconid}',
        method: HTTPMETHOD.GET
    },
    // 删除一个文件
    DELETE_PLOT_FILE: {
        url: postBaseUrl + 'solr/delfiles/{fileid}',
        method: HTTPMETHOD.GET
    },

    /**
     * ******************************************************************************************************************
     * water-chief 接口
     * ******************************************************************************************************************
     */
    // 水利部信息中心服务请求统一接口
    GET_DATA_FROM_INFOCENTER: {
        url: infoCenterUrl,
        method: HTTPMETHOD.POST
    },
    // 水利部信息中心服务请求统一接口
    GET_DATA_FROM_INFOCENTER_NEW: {
        url: infoCenterUrlNew,
        method: HTTPMETHOD.POST
    },
    // 水利部信息中心服务请求统一接口
    GET_DATA_FROM_INFOCENTER_MAP: {
        url: infoCenterUrlMap,
        method: HTTPMETHOD.POST
    },

    // 由于数据量太大，省份数据直接从本地获取
    GET_PROVINCE_DATA: {
        url: jsonBaseUrl + 'jsons/area/province-sample.json',
        method: HTTPMETHOD.GET
    },

    // ----------------用户反馈----------------------------- 新增用户反馈
    User_Feedback: {
        url: waterUrl + 'User_Feedback',
        method: HTTPMETHOD.POST
    },

    // ----------------一河（湖）一档的公共基础信息----------------------------- 新增一河（湖）一档的公共基础信息
    ATT_RVALKS_RECORD: {
        url: waterUrl + 'ATT_RVALKS_RECORD',
        method: HTTPMETHOD.POST
    },

    //修改一河（湖）一档的公共基础信息
    PUT_RVALKS_RECORD: {
        url: waterUrl + 'ATT_RVALKS_RECORD/{recordCode}',
        method: HTTPMETHOD.PUT
    },

    //获取一河（湖）一档的公共基础信息
    GET_COMMON_RECORD: {
        url: waterUrl + 'ATT_RVALKS_RECORD?adCode={adCode}&pagesize={pagesize}&pagenum={pagenum}',
        method: HTTPMETHOD.GET
    },

    // 根据用户code获取一河一档总表数据
    GET_COMMON_RECORD_BY_USERCODE: {
        url: waterUrl + 'listATT_RVALKS_RECORD/user/{userCode}?pagesize={pagesize}&pagenum={pagenum}',
        method: HTTPMETHOD.GET
    },

    // 根据审核人员code获取一河一档总表数据
    GET_COMMON_RECORD_BY_CHECKCODE: {
        url: waterUrl + 'listATT_RVALKS_RECORD/check/{checkCode}?pagesize={pagesize}&pagenum={pagenum}',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的社会经济表信息-----------------------------
    // 新增一河（湖）一档的社会经济表信息
    ATT_SOC_ECO: {
        url: waterUrl + 'ATT_SOC_ECO',
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的社会经济表信息
    GET_ATT_SOC_ECO: {
        url: waterUrl + 'ATT_SOC_ECO/list',
        method: HTTPMETHOD.POST
    },

    //修改一河（湖）一档的社会经济表信息
    PUT_ATT_SOC_ECO: {
        url: waterUrl + 'ATT_SOC_ECO/{seCode}',
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的社会经济表信息导入
    IMPORT_ATT_SOC_ECO: {
        url: waterUrl + 'importATT_SOC_ECO',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_SHJJ_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/shjjConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的年度河垃圾状况信息-----------------------------
    // 新增一河（湖）一档的年度河垃圾状况信息
    ATT_WENV_RUBISH: {
        url: waterUrl + 'ATT_WENV_RUBISH',
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的年度河垃圾状况信息
    GET_ATT_WENV_RUBISH: {
        url: waterUrl + 'ATT_WENV_RUBISH?pagenum={pagenum}&pagesize={pagesize}&adCode={adCode}&werYear={w' +
                'erYear}',
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的年度河垃圾状况信息
    PUT_ATT_WENV_RUBISH: {
        url: waterUrl + 'ATT_WENV_RUBISH/{werCode}',
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的年度河垃圾状况信息导入
    IMPORT_ATT_WENV_RUBISH: {
        url: waterUrl + 'importATT_WENV_RUBISH',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_HHLJ_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/hhljConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的年度黑臭水体状况信息-----------------------------
    // 新增一河（湖）一档的年度黑臭水体状况信息
    ATT_WENV_BLACK: {
        url: waterUrl + 'ATT_WENV_BLACK',
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的年度黑臭水体状况信息
    GET_ATT_WENV_BLACK: {
        url: waterUrl + 'ATT_WENV_BLACK?pagenum={pagenum}&pagesize={pagesize}&adCode={adCode}&webYear={we' +
                'bYear}',
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的年度黑臭水体状况信息
    PUT_ATT_WENV_BLACK: {
        url: waterUrl + 'ATT_WENV_BLACK/{webCode}',
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的年度黑臭水体状况信息导入
    IMPORT_ATT_WENV_BLACK: {
        url: waterUrl + 'importATT_WENV_BLACK',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_HCS_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/hcsConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的取水口基础信息-----------------------------
    // 新增一河（湖）一档的取水口基础信息
    ATT_WAIN_BASE: {
        url: waterUrl + 'ATT_WAIN_BASE',
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的取水口基础信息
    GET_ATT_WAIN_BASE: {
        url: waterUrl + 'ATT_WAIN_BASE?pagenum={pagenum}&pagesize={pagesize}&relateCode={relateCode}&code' +
                'Type={codeType}',
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的取水口基础信息
    PUT_ATT_WAIN_BASE: {
        url: waterUrl + 'ATT_WAIN_BASE/{wainCode}',
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的取水口基础信息导入
    IMPORT_ATT_MEASURE_DUTY: {
        url: waterUrl + 'importATT_WAIN_BASE',
        method: HTTPMETHOD.POST
    },

    // 获取表头字段信息
    GET_QSK_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/qskConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的排水口基础信息-----------------------------
    // 新增一河（湖）一档的排水口基础信息
    ATT_PDO_BASE: {
        url: waterUrl + 'ATT_PDO_BASE',
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的排水口基础信息
    GET_ATT_PDO_BASE: {
        url: waterUrl + 'ATT_PDO_BASE?pagenum={pagenum}&pagesize={pagesize}&relateCode={relateCode}&codeT' +
                'ype={codeType}',
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的排水口基础信息
    PUT_ATT_PDO_BASE: {
        url: waterUrl + 'ATT_PDO_BASE/{pdoCode}',
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的排水口基础信息导入
    IMPORT_ATT_PDO_BASE: {
        url: waterUrl + 'importATT_PDO_BASE',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_PSK_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/pskConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的港口码头基础信息-----------------------------
    // 新增一河（湖）一档的港口码头基础信息
    ATT_PORT_BASE: {
        url: waterUrl + 'ATT_PORT_BASE',
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的港口码头基础信息
    GET_ATT_PORT_BASE: {
        url: waterUrl + 'ATT_PORT_BASE?pagenum={pagenum}&pagesize={pagesize}&relateCode={relateCode}&code' +
                'Type={codeType}',
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的港口码头基础信息
    PUT_ATT_PORT_BASE: {
        url: waterUrl + 'ATT_PORT_BASE/{pbCode}',
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的港口码头基础信息导入
    IMPORT_ATT_PORT_BASE: {
        url: waterUrl + 'importATT_PORT_BASE',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_GKMT_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/gkmtConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的水电站基础信息-----------------------------
    // 新增一河（湖）一档的水电站基础信息
    ATT_HYST_BASE: {
        url: waterUrl + 'ATT_HYST_BASE',
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的水电站基础信息
    GET_ATT_HYST_BASE: {
        url: waterUrl + 'ATT_HYST_BASE?pagenum={pagenum}&pagesize={pagesize}&relateCode={relateCode}&code' +
                'Type={codeType}',
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的水电站基础信息
    PUT_ATT_HYST_BASE: {
        url: waterUrl + 'ATT_HYST_BASE/{hystCode}',
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的水电站基础信息导入
    IMPORT_ATT_HYST_BASE: {
        url: waterUrl + 'importATT_HYST_BASE',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_SDZ_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/sdzConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的堤防基础信息----------------------------- 新增一河（湖）一档的堤防基础信息
    ATT_DIKE_BASE: {
        url: waterUrl + 'ATT_DIKE_BASE',
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的堤防基础信息
    GET_ATT_DIKE_BASE: {
        url: waterUrl + 'ATT_DIKE_BASE?pagenum={pagenum}&pagesize={pagesize}&relateCode={relateCode}&code' +
                'Type={codeType}',
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的堤防基础信息
    PUT_ATT_DIKE_BASE: {
        url: waterUrl + 'ATT_DIKE_BASE/{dikeCode}',
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的堤防基础信息导入
    IMPORT_ATT_DIKE_BASE: {
        url: waterUrl + 'importATT_DIKE_BASE',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_DF_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/dfConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的橡胶坝基础信息-----------------------------
    // 新增一河（湖）一档的橡胶坝基础信息
    ATT_RUDA_BASE: {
        url: waterUrl + 'ATT_RUDA_BASE',
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的橡胶坝基础信息
    GET_ATT_RUDA_BASE: {
        url: waterUrl + 'ATT_RUDA_BASE?pagenum={pagenum}&pagesize={pagesize}&relateCode={relateCode}&code' +
                'Type={codeType}',
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的橡胶坝基础信息
    PUT_ATT_RUDA_BASE: {
        url: waterUrl + 'ATT_RUDA_BASE/{rudaCode}',
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的橡胶坝基础信息导入
    IMPORT_ATT_RUDA_BASE: {
        url: waterUrl + 'importATT_RUDA_BASE',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_XJB_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/xjbConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的河湖饮用水水源地状况信息-----------------------------
    // 新增一河（湖）一档的河湖饮用水水源地状况信息
    ATT_WENV_DRINKW: {
        url: waterUrl + 'ATT_WENV_DRINKW',
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的河湖饮用水水源地状况信息
    GET_ATT_WENV_DRINKW: {
        url: waterUrl + 'ATT_WENV_DRINKW?pagenum={pagenum}&pagesize={pagesize}&adCode={adCode}&wedYear={w' +
                'edYear}',
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的河湖饮用水水源地状况信息
    PUT_ATT_WENV_DRINKW: {
        url: waterUrl + 'ATT_WENV_DRINKW/{wedCode}',
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的河湖饮用水水源地状况信息导入
    IMPORT_ATT_WENV_DRINKW: {
        url: waterUrl + 'importATT_WENV_DRINKW',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_YYS_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/yysConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的年（月）度河湖水生态需水状况信息-----------------------------
    // 新增一河（湖）一档的年（月）度河湖水生态需水状况信息
    ATT_WECO_NED: {
        url: waterUrl + 'ATT_WECO_NED',
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的年（月）度河湖水生态需水状况信息
    GET_ATT_WECO_NED: {
        url: waterUrl + 'ATT_WECO_NED?pagenum={pagenum}&pagesize={pagesize}&adCode={adCode}&wenYear={wenY' +
                'ear}',
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的年（月）度河湖水生态需水状况信息
    PUT_ATT_WECO_NED: {
        url: waterUrl + 'ATT_WECO_NED/{wenCode}',
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的年（月）度河湖水生态需水状况信息导入
    IMPORT_ATT_WECO_NED: {
        url: waterUrl + 'importATT_WECO_NED',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_STXS_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/stxsConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的年度河湖水质状况信息-----------------------------
    // 新增一河（湖）一档的年度河湖水质状况信息
    ATT_WENV_WQUA: {
        url: waterUrl + 'ATT_WENV_WQUA',
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的年度河湖水质状况信息
    GET_ATT_WENV_WQUA: {
        url: waterUrl + 'ATT_WENV_WQUA?pagenum={pagenum}&pagesize={pagesize}&adCode={adCode}&wewYear={wew' +
                'Year}',
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的年度河湖水质状况信息
    PUT_ATT_WENV_WQUA: {
        url: waterUrl + 'ATT_WENV_WQUA/{wewCode}',
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的年度河湖水质状况信息导入
    IMPORT_ATT_WENV_WQUA: {
        url: waterUrl + 'importATT_WENV_WQUA',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_HHSZ_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/hhszConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的年度河湖水域岸线空间基本情况-----------------------------
    // 新增一河（湖）一档的年度河湖水域岸线空间基本情况
    ATT_WBANK_INFO: {
        url: waterUrl + "ATT_WBANK_INFO",
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的年度河湖水域岸线空间基本情况
    GET_ATT_WBANK_INFO: {
        url: waterUrl + "ATT_WBANK_INFO?pagenum={pagenum}&pagesize={pagesize}&adCode={adCode}&wbiYear={wb" +
                "iYear}",
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的年度河湖水域岸线空间基本情况
    PUT_ATT_WBANK_INFO: {
        url: waterUrl + "ATT_WBANK_INFO/{wbiCode}",
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的年度河湖水域岸线空间基本情况导入
    IMPORT_ATT_WBANK_INFO: {
        url: waterUrl + 'importATT_WBANK_INFO',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_AXKJ_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/axkjConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的年度河湖水资源开发利用状况-----------------------------
    // 新增一河（湖）一档的年度河湖水资源开发利用状况
    ATT_WRES_USE: {
        url: waterUrl + "ATT_WRES_USE",
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的年度河湖水资源开发利用状况
    GET_ATT_WRES_USE: {
        url: waterUrl + "ATT_WRES_USE/list",
        method: HTTPMETHOD.POST
    },

    //修改一河（湖）一档的年度河湖水资源开发利用状况
    PUT_ATT_WRES_USE: {
        url: waterUrl + "ATT_WRES_USE/{wruCode}",
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的年度河湖水域岸线利用情况导入
    IMPORT_ATT_WRES_USE: {
        url: waterUrl + 'importATT_WRES_USE',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_KFLY_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/kflyConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的年度河湖水域岸线利用情况-----------------------------
    // 新增一河（湖）一档的年度河湖水域岸线利用情况
    ATT_WBANK_USE: {
        url: waterUrl + "ATT_WBANK_USE",
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的年度河湖水域岸线利用情况
    GET_ATT_WBANK_USE: {
        url: waterUrl + "ATT_WBANK_USE?pagenum={pagenum}&pagesize={pagesize}&adCode={adCode}&wbuYear={wbu" +
                "Year}",
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的年度河湖水域岸线利用情况
    PUT_ATT_WBANK_USE: {
        url: waterUrl + "ATT_WBANK_USE/{wbuCode}",
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的年度河湖水域岸线利用情况导入
    IMPORT_ATT_WBANK_USE: {
        url: waterUrl + 'importATT_WBANK_USE',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_AXLY_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/axlyConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的年度河湖水域岸线侵占及非法采砂情况-----------------------------
    // 新增一河（湖）一档的年度河湖水域岸线侵占及非法采砂情况
    ATT_WBANK_OCCUP: {
        url: waterUrl + "ATT_WBANK_OCCUP",
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的年度河湖水域岸线侵占及非法采砂情况
    GET_ATT_WBANK_OCCUP: {
        url: waterUrl + "ATT_WBANK_OCCUP?pagenum={pagenum}&pagesize={pagesize}&adCode={adCode}&wboYear={w" +
                "boYear}",
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的年度河湖水域岸线侵占及非法采砂情况
    PUT_ATT_WBANK_OCCUP: {
        url: waterUrl + "ATT_WBANK_OCCUP/{wboCode}",
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的年度河湖水域岸线侵占及非法采砂情况导入
    IMPORT_ATT_WBANK_OCCUP: {
        url: waterUrl + 'importATT_WBANK_OCCUP',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_QZCS_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/qzcsConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的年度河湖来水量和取水量信息-----------------------------
    // 新增一河（湖）一档的年度河湖来水量和取水量信息
    ATT_WRES_INT: {
        url: waterUrl + "ATT_WRES_INT",
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的年度河湖来水量和取水量信息
    GET_ATT_WRES_INT: {
        url: waterUrl + "ATT_WRES_INT?pagenum={pagenum}&pagesize={pagesize}&adCode={adCode}&wriYear={wriY" +
                "ear}",
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的年度河湖来水量和取水量信息
    PUT_ATT_WRES_INT: {
        url: waterUrl + "ATT_WRES_INT/{wriCode}",
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的年度河湖来水量和取水量信息导入
    IMPORT_ATT_WRES_INT: {
        url: waterUrl + 'importATT_WRES_INT',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_LSQS_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/lsqsConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的年度河湖断流干涸信息-----------------------------
    // 新增一河（湖）一档的年度河湖断流干涸信息
    ATT_WECO_DRY: {
        url: waterUrl + "ATT_WECO_DRY",
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的年度河湖断流干涸信息
    GET_ATT_WECO_DRY: {
        url: waterUrl + "ATT_WECO_DRY?pagenum={pagenum}&pagesize={pagesize}&adCode={adCode}&wedYear={wedY" +
                "ear}",
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的年度河湖断流干涸信息
    PUT_ATT_WECO_DRY: {
        url: waterUrl + "ATT_WECO_DRY/{wedCode}",
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的年度河湖断流干涸信息导入
    IMPORT_ATT_WECO_DRY: {
        url: waterUrl + 'importATT_WECO_DRY',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_DLGK_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/dlgkConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河（湖）一档的年度河湖水生态监测状况信息-----------------------------
    // 新增一河（湖）一档的年度河湖水生态监测状况信息
    ATT_WECO_MON: {
        url: waterUrl + "ATT_WECO_MON",
        method: HTTPMETHOD.POST
    },

    //获取一河（湖）一档的年度河湖水生态监测状况信息
    GET_ATT_WECO_MON: {
        url: waterUrl + "ATT_WECO_MON?pagenum={pagenum}&pagesize={pagesize}&adCode={adCode}&wbmYear={wbmY" +
                "ear}",
        method: HTTPMETHOD.GET
    },

    //修改一河（湖）一档的年度河湖水生态监测状况信息
    PUT_ATT_WECO_MON: {
        url: waterUrl + "ATT_WECO_MON/{wbmCode}",
        method: HTTPMETHOD.PUT
    },

    //一河（湖）一档的年度河湖水生态监测状况信息导入
    IMPORT_ATT_WECO_MON: {
        url: waterUrl + 'importATT_WECO_MON',
        method: HTTPMETHOD.POST
    },

    //获取表头字段信息
    GET_STJC_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/ledgertable/stjcConfig.json',
        method: HTTPMETHOD.GET
    },

    // // ----------------一河（湖）一档的年度河湖水生态监测状况信息-----------------------------
    // //新增一河（湖）一档的河湖动态监控测站基础信息 ATT_MON_BASE: {     url: waterUrl + "ATT_MON_BASE",
    //   method: HTTPMETHOD.POST }, //修改一河（湖）一档的河湖动态监控测站基础信息 PUT_ATT_MON_BASE: {
    // url: waterUrl + "ATT_MON_BASE/{mbCode}",     method: HTTPMETHOD.PUT },
    // ----------------一河一策基础信息列表-----------------------------
    // 根据用户code获取一河（湖）一策的公共基本信息
    GET_INFO_BY_USERCODE: {
        url: waterUrl + "listATT_RVLK_POLICY/user/{userCode}?pagenum={pagenum}&pagesize={pagesize}",
        method: HTTPMETHOD.GET
    },

    //根据审核code获取一河（湖）一策的公共基本信息
    GET_INFO_BY_CHECKCODE: {
        url: waterUrl + "listATT_RVLK_POLICY/check/{checkCode}?pagenum={pagenum}&pagesize={pagesize}",
        method: HTTPMETHOD.GET
    },

    //获取一河一策基础信息列表
    GET_POLICY_LIST: {
        url: waterUrl + "ATT_RVLK_POLICY?pagenum={pagenum}&pagesize={pagesize}&adCode={adCode}",
        method: HTTPMETHOD.GET
    },
    // 添加一条基本信息
    ADD_POLICY: {
        url: waterUrl + "ATT_RVLK_POLICY",
        method: HTTPMETHOD.POST
    },
    // 修改一条基本信息
    EDIT_POLICY: {
        url: waterUrl + "ATT_RVLK_POLICY/{rlpCode}",
        method: HTTPMETHOD.PUT
    },
    // 获取表头字段信息
    GET_RLP_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/table-field/rlpListConfig.json',
        method: HTTPMETHOD.GET
    },
    // 获取表头字段信息
    ADD_RLP_UPLOAD_File: {
        url: waterUrl + 'ATT_RVLK_POLICY/uploadfile/{rlpCode}',
        method: HTTPMETHOD.POST
    },

    // ----------------一河一策日志---------------------------------- 获取一河一策日志
    GET_RLP_LOG: {
        url: waterUrl + 'WATER_STRATEGY_LOG/{rlpcode}',
        method: HTTPMETHOD.GET
    },
    SAVE_RLP_LOG: {
        url: waterUrl + 'WATER_STRATEGY_LOG',
        method: HTTPMETHOD.POST
    },

    // ----------------一河一策问题清单---------------------------------- 获取一河一策基础信息列表
    GET_QUSLIST_LIST: {
        url: waterUrl + "ATT_QUS_LIST/{rlpCode}",
        method: HTTPMETHOD.GET
    },
    //添加一个问题清单
    ADD_NEW_QUSLIST: {
        url: waterUrl + "ATT_QUS_LIST",
        method: HTTPMETHOD.POST
    },
    // 修改一条问题清单
    EDIT_QUSLIST: {
        url: waterUrl + "ATT_QUS_LIST/{qusCode}",
        method: HTTPMETHOD.PUT
    },
    // 获取表头字段信息
    GET_QUS_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/table-field/qusListConfig.json',
        method: HTTPMETHOD.GET
    },
    QUS_UPLOAD_EXCEL_FILE: {
        url: waterUrl + 'importATT_QUS_LIST',
        method: HTTPMETHOD.POST
    },

    // ----------------一河一策目标清单---------------------------------- 获取一河一策目标清单列表
    GET_TARGET_LIST: {
        url: waterUrl + 'ATT_TARGET/{rlpCode}',
        method: HTTPMETHOD.GET
    },
    // 添加一个目标清单
    ADD_NEW_TARGET: {
        url: waterUrl + 'ATT_TARGET',
        method: HTTPMETHOD.POST
    },
    // 修改一个目标清单
    EDIT_TARGET: {
        url: waterUrl + 'ATT_TARGET/{tgCode}',
        method: HTTPMETHOD.PUT
    },
    // 获取表头字段限制条件
    GET_TARGET_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/table-field/targetListConfig.json',
        method: HTTPMETHOD.GET
    },

    // ----------------一河一策年度目标---------------------------------- 修改一个年度目标
    EDIT_YEAR_TARGET: {
        url: waterUrl + 'ATT_TARGET_YEAR/{tyCode}',
        method: HTTPMETHOD.PUT
    },
    ADD_YEAR_TARGET: {
        url: waterUrl + 'ATT_TARGET_YEAR',
        method: HTTPMETHOD.POST
    },
    IMPORT_YEAR_TARGET: {
        url: waterUrl + 'importATT_TARGET',
        method: HTTPMETHOD.POST
    },

    // ----------------一河一策分解目标---------------------------------- 获取河湖段的分解目标
    GET_RESO_TARGET: {
        url: waterUrl + 'ATT_TARGET_RESO/{rlpCode}',
        method: HTTPMETHOD.GET
    },
    // 修改分解目标
    EDIT_RESO_TARGET: {
        url: waterUrl + 'ATT_TARGET_RESO/{tgCode}',
        method: HTTPMETHOD.PUT
    },
    // 添加分解目标
    ADD_RESO_TARGET: {
        url: waterUrl + 'ATT_TARGET_RESO',
        method: HTTPMETHOD.POST
    },
    IMPORT_RESO_TRAGET: {
        url: waterUrl + 'importATT_TARGET_RESO',
        method: HTTPMETHOD.POST
    },

    // ----------------一河一策分解目标年度目标---------------------------------- 修改一个分解目标年度目标
    EDIT_RESO_LIST: {
        url: waterUrl + 'ATT_TARGET_RESO_YEAR/{tsyCode}',
        method: HTTPMETHOD.PUT
    },
    ADD_RESO_LIST: {
        url: waterUrl + 'ATT_TARGET_RESO_YEAR',
        method: HTTPMETHOD.POST
    },

    // ----------------一河一策任务清单---------------------------------- 获取河湖段的任务列表
    GET_TASK_LIST: {
        url: waterUrl + 'ATT_TASK/{rlpCode}',
        method: HTTPMETHOD.GET
    },
    // 修改任务列表
    EDIT_TASK_LIST: {
        url: waterUrl + 'ATT_TASK/{tsCode}',
        method: HTTPMETHOD.PUT
    },
    IMPORT_TASK: {
        url: waterUrl + 'importATT_TASK',
        method: HTTPMETHOD.POST
    },
    // 添加任务列表
    ADD_TASK_LIST: {
        url: waterUrl + 'ATT_TASK',
        method: HTTPMETHOD.POST
    },
    // 获取表头字段限制条件
    GET_TASK_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/table-field/taskListConfig.json',
        method: HTTPMETHOD.GET
    },

    //  ----------------一河一策任务清单年度清单---------------------------------- 修改任务列表年度任务信息
    EDIT_TASK_YEAR: {
        url: waterUrl + 'ATT_TASK_YEAR/{tyCode}',
        method: HTTPMETHOD.PUT
    },
    ADD_TASK_YEAR: {
        url: waterUrl + 'ATT_TASK_YEAR',
        method: HTTPMETHOD.POST
    },

    // ----------------一河一策责任清单---------------------------------- 获取河湖段的责任清单
    GET_MEASURE_DUTY: {
        url: waterUrl + 'ATT_MEASURE_DUTY/{rlpCode}',
        method: HTTPMETHOD.GET
    },
    // 编辑一个责任清单
    EDIT_MEASURE_DUTY: {
        url: waterUrl + 'ATT_MEASURE_DUTY/{mdCode}',
        method: HTTPMETHOD.PUT
    },
    ADD_MEASURE_DUTY: {
        url: waterUrl + 'ATT_MEASURE_DUTY',
        method: HTTPMETHOD.POST
    },
    MEASURE_DUTY_UPLOAD_EXCEL_FILE: {
        url: waterUrl + 'importATT_MEASURE_DUTY',
        method: HTTPMETHOD.POST
    },
    // 获取表头字段限制条件
    GET_MEASURE_TABLE_FIELS: {
        url: jsonBaseUrl + 'jsons/table-field/measureListConfig.json',
        method: HTTPMETHOD.GET
    }
};

var modules = {
    informationCenterService,
    // riverTreeService,
    inspectService,
    mapThemeService,
    organizationService,
    standardService,
    searchService,
    rvlkService,
    newsService,
    mediaService
}

// 模块化
Object.assign(_apiList, ...Object.values(modules));

const getAPI = function (apiName, urlFormat) {
    // 判断传入字符串类型
    var _api;
    if (/^http:/.test(apiName)) {
        _api = {
            url: apiName,
            method: 'get'
        }
    } else {
        _api = _apiList[apiName];
    }
    // 有传入的动态参数，替换后导出
    if (_api) {
        // deepCopy TODO
        if (urlFormat) {
            return {
                url: template(_api.url, urlFormat),
                method: _api.method,
                isMap: _api.isMap
            };
        } else {
            return _api;
        }
    }
    return _apiList[apiName];
};

const getQueryAPI = function (apiName, urlFormat, queryFormat) {
    var _api;
    if (/^http:/.test(apiName)) {
        _api = {
            url: apiName,
            method: 'get'
        }
    } else {
        _api = _apiList[apiName];
    }

    if (queryFormat && _api) {
        return {
            url: template(_api.url, urlFormat) + 'query?' + getParamString(queryFormat),
            method: _api.method,
            isMap: _api.isMap
        }
    }
}

export {getAPI, getQueryAPI, postBaseUrl}
