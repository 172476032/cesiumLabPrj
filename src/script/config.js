/**
 * 存储全局变量
 * gll 2019-6-11
 */


const types = {
  MAP_VIEW: "MAP_VIEW",
  $STORE: "$STORE", //app.vue组件中vue实例
  $APP: "$APP", //app.vue组件中vue实例
};

const config = {
  [types.MAP_VIEW]: {
    center: [11815338.577971682, 3558032.468689678], // [103.91678460032786, 26.735038084423355], // 金沙江流域
    zoom: 5,
    minZoom: 1,
    maxZoom: 18,
    projection: "EPSG:3857",
  }
}

export default config;
