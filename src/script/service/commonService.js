import {
    getAPI,
    getQueryAPI
} from './serviceConfig';
import axios from 'axios';

/**
 *
 * @param {string} apiName 调用的接口名称,在commonService中设置
 * @param {object} [urlFormat={}] 动态匹配api中的{}包裹的参数
 * @param {object} [data={}] 传给服务端的数据
 * @return {promise} 返回promise，在success回调中返回服务端发送的数据
 *                    在失败回调中，进行所有的错误处理
 */
function asynData(apiName, urlFormat, queryFormat, data, headers) {
    let api = '';

    // 如果queryFormat存在，则调用getQueryAPI拼接查询字符串
    // 否则调用getAPI 拼接
    if (!queryFormat) {
        api = getAPI(apiName, urlFormat);
    } else {
        api = getQueryAPI(apiName, urlFormat, queryFormat);
    }

    var url = encodeURI(api.url);
    return axios({
        method: api.method,
        url: url,
        data: data,
        headers: headers
    })
        .then(function (response) {
            // console.log(response);
            if (response.status == 200) {
                var resData = response.data;
                if (api.replaceMethod) {
                    resData = api.replaceMethod(resData);
                    // console.log(resData);
                }
                return resData;
            } else {
                throw new Error(response);
            }
        }, function (err) {
            console.error(err);
            throw new Error(err);
        });
}

const servicePlugin = {};

servicePlugin.install = function (Vue, options) {
    Vue.prototype.$$http = asynData;
};

export {
    asynData,
    servicePlugin
};
