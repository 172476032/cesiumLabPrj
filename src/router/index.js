import Vue from 'vue'
import Router from 'vue-router'
import sceneMap from "../components/scene/sceneMap"

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'sceneMap',
    component: sceneMap
  }]
})
