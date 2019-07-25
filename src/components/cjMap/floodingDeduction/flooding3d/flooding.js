import _ from "lodash"
import grids from '../../../../../static/jsons/flood4326';
export default {
  data() {
    return {
      speed: 1500,
      timeInterval: null,
      sortGroupGrids: null,
      waterEntities: null,
      // arrivalIndex: 0
    };
  },
  computed: {
    arrivalIndex() {
      return this.$store.state.map.arrivalIndex
    },
    colors() {
      return this.$store.state.map.floodingColors;
    }
  },
  methods: {
    replayFlooding() {
      this.reset();
      this.intervalSetting(this.sortGroupGrids)
    },
    beginFlooding() {
      if (this.sortGroupGrids) {
        this.intervalSetting(this.sortGroupGrids)
      }
    },
    pauseFlooding() {
      //清楚计时器
      window.clearInterval(this.timeInterval)
    },
    toggle(name) {
      console.log('name: ', name);
      if (name == "openFloodPanel") {
        console.log("打开推演面板")
        if (!this.sortGroupGrids) {
          //解析数据
          console.log('grids: ', grids);
          this.sortGroupGrids = this.praseData(grids.features);
          console.log('sortGroupGrids: ', this.sortGroupGrids);
          this.$store.state.map.sortGroupGridsLength = this.sortGroupGrids.length
        }
        this.floodShow = true;
        this.flyTo();
      } else if (name == "closeFloodPanel") {
        this.floodShow = false;
        this.reset()
      }
    },
    intervalSetting(sortGroupGrids) {
      this.timeInterval = setInterval(() => {
        if (this.arrivalIndex == sortGroupGrids.length) { //sortGroupGrids.length - 1
          window.clearInterval(this.timeInterval)
        } else {
          this.drawPrimitives(sortGroupGrids[this.arrivalIndex])
          console.log('sortGroupGrids[arrivalIndex]: ', sortGroupGrids[this.arrivalIndex]);
          this.$store.state.map.arrivalIndex++;
        }
        console.log("正在播放哦哦哦")
      }, this.speed);
    },
    reset() {
      //删除primitives
      this.Viewer.scene.primitives.removeAll();
      //清楚计时器
      window.clearInterval(this.timeInterval)
      this.$store.state.map.arrivalIndex = 0;
      this.Viewer.camera.zoomIn(0.005)
    },
    praseData(data) {
      let sort = _.groupBy(_.sortBy(data, (o) => {
          return o.properties.Value_1
        }), (a) => {
          return a.properties.Value_1
        }),
        sortGroupGrids = [];
      if (sort) {
        for (const key in sort) {
          if (sort.hasOwnProperty(key)) {
            sortGroupGrids.push(sort[key]);
          }
        }
        return sortGroupGrids
      }
    },
    drawPrimitives(features) {
      let instanceArray = [];
      features.forEach(v => {
        let id = v.properties.GridID,
          color = this.colors[v.properties.color]["color"],
          // color = "#FF0000",
          degreesArry = [];
        if (v.geometry.type == 'MultiPolygon') {
          v.geometry.coordinates.forEach(vv => {
            degreesArry = vv[0].reduce((pre, cur) => {
              return pre.concat(cur);
            }, []);
            instanceArray.push(this.createPolygonGeometryInstance(id, color, degreesArry))
          })
        } else {
          degreesArry = v.geometry.coordinates[0].reduce((pre, cur) => {
            return pre.concat(cur);
          }, []);
          instanceArray.push(this.createPolygonGeometryInstance(id, color, degreesArry))
        }
      })
      this.addPrimitivesToScene(this.Viewer, instanceArray)
    },

    addPrimitivesToScene(viewer, instanceArray) {
      viewer.scene.primitives.add(new Cesium.Primitive({
        // 用数组方式可以添加多个实例
        geometryInstances: instanceArray,
        // 几何外观根据自身的属性来设置
        appearance: new Cesium.PerInstanceColorAppearance()
      }))
      viewer.camera.zoomIn(0.005)
    },
    createPolygonGeometryInstance(id, color, degreesArry) {
      return new Cesium.GeometryInstance({
        id: id,
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray(degreesArry)
          ),
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromCssColorString(color)
          )
        }
      });
    },
    flyTo() {
      this.Viewer.camera.flyTo({
        //目前为大通湖东分洪区
        destination: new Cesium.Cartesian3(
          -2160719.0887458995,
          5164693.134828525,
          3086652.583725703
        ),
        orientation: {
          heading: 6.265965412948017,
          pitch: -0.7250628417712202,
          roll: 0.00007361600306232674
        }
      })
    },
    draw(features) {
      features.forEach(v => {
        // let color = this.colors[v.properties.color];
        let color = Cesium.Color.BLUE
        if (v.geometry.type == 'MultiPolygon') {
          v.geometry.coordinates.forEach(vv => {
            let cords = vv[0].reduce((pre, cur) => {
              return pre.concat(cur);
            }, []);
            this.addPolygonEntitys(this.Viewer, cords, color);
          })
        } else {
          let cords = v.geometry.coordinates[0].reduce((pre, cur) => {
            return pre.concat(cur);
          }, []);
          this.addPolygonEntitys(this.Viewer, cords, color);
        }
      })

    },
    addPolygonEntitys(viewer, cords, color) {
      viewer.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(cords),
          material: color,
          // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      });
    },
    _drawWater(targetHeight, adapCoordi) {
      // this.earth.entities.remove(this.waterEntities)
      let entity = this.earth.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(adapCoordi),
          material: new GV.Color.fromBytes(64, 157, 253, 150),
          perPositionHeight: true,
          extrudedHeight: 0.0
          // closeBottom:false
        }
      });
      this.waterEntities = entity;
      let waterHeight = adapCoordi[2];
      // this.earth.clock.onTick.addEventListener((clock)=> {
      //     waterHeight++
      //     entity.polygon.extrudedHeight.setValue(waterHeight)
      // })
      this.timeInterval = setInterval(() => {
        if (waterHeight < targetHeight) {
          waterHeight += 100;
          if (waterHeight > targetHeight) {
            waterHeight = targetHeight;
          }
          entity.polygon.extrudedHeight.setValue(waterHeight);
        }
      }, 100);
      this.entities.push(entity);
    }
  }

};
