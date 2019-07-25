import P from '../../plugin/p-ol3.debug'


const basePlot = function(type, title, geometryType, visible) { //src
    visible = !!visible;
    if(!visible) {
        visible = !visible;
    }
    if(!geometryType)
        geometryType = 'point';
    return {
        'name': '',
        'type': type,
        'title': title,
        // 'src': src,
        'visible': visible,
        'geometryType': geometryType
    }
}

let constant = {
    tool: {
        'polyline': basePlot(P.PlotTypes.POLYLINE, '直线', 'polyline'),
        'curve': basePlot(P.PlotTypes.CURVE, '自由曲线', 'polyline'),
        'polygon': basePlot(P.PlotTypes.POLYGON, '自由区域', 'polygon'),
        'attack_arrow': basePlot(P.PlotTypes.ATTACK_ARROW, '手绘自由线型箭头', 'polygon'),
        'fine_arrow': basePlot(P.PlotTypes.FINE_ARROW, '行军箭头', 'polygon'),
        'squad_combat': basePlot(P.PlotTypes.SQUAD_COMBAT, '可调整的平滑曲线箭头', 'polygon')
    },
    normal: {
        'normal-1': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-2': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-3': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-4': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-5': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-6': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-7': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-8': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-9': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-10': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-11': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-12': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-13': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-14': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-15': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-16': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-17': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-18': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-19': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-20': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-21': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-22': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-23': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-24': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-25': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-26': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-27': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-28': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-29': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-30': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-31': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-32': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-33': basePlot(P.PlotTypes.MARKER, '普通兴趣点'),
        'normal-34': basePlot(P.PlotTypes.MARKER, '普通兴趣点')
    },
    water: {
        'water-1': basePlot(P.PlotTypes.MARKER, '大型水库'),
        'water-2': basePlot(P.PlotTypes.MARKER, '中型水库'),
        'water-3': basePlot(P.PlotTypes.MARKER, '小型水库'),
        'water-4': basePlot(P.PlotTypes.MARKER, '大型水电站'),
        'water-5': basePlot(P.PlotTypes.MARKER, '中型水电站'),
        'water-6': basePlot(P.PlotTypes.MARKER, '小型水电站'),
        'water-7': basePlot(P.PlotTypes.MARKER, '涵闸'),
        'water-8': basePlot(P.PlotTypes.MARKER, '机电井'),
        'water-9': basePlot(P.PlotTypes.MARKER, '地下水监测站'),
        'water-10': basePlot(P.PlotTypes.MARKER, '水井'),
        'water-11': basePlot(P.PlotTypes.MARKER, '水厂'),
        'water-12': basePlot(P.PlotTypes.MARKER, '水质监测站'),
        'water-13': basePlot(P.PlotTypes.MARKER, '塘坝、氺堰'),
        'water-14': basePlot(P.PlotTypes.MARKER, '雨量站'),
        'water-15': basePlot(P.PlotTypes.MARKER, '泵站'),
        'water-16': basePlot(P.PlotTypes.MARKER, '堤防'),
        'water-17': basePlot(P.PlotTypes.MARKER, '供水工程'),
        'water-18': basePlot(P.PlotTypes.MARKER, '潮位站'),
        'water-19': basePlot(P.PlotTypes.MARKER, '跨河工程'),
        'water-20': basePlot(P.PlotTypes.MARKER, '气象站'),
        'water-21': basePlot(P.PlotTypes.MARKER, '水库坝线'),
        'water-22': basePlot(P.PlotTypes.MARKER, '墒情监测站'),
        'water-23': basePlot(P.PlotTypes.MARKER, '水文站'),
        'water-24': basePlot(P.PlotTypes.MARKER, '水位站'),
        'water-25': basePlot(P.PlotTypes.MARKER, '堤防'),
        'water-26': basePlot(P.PlotTypes.MARKER, '水闸'),
        'water-27': basePlot(P.PlotTypes.MARKER, '险工险段'),
        'water-28': basePlot(P.PlotTypes.MARKER, '治河工程')
    },
    traffic: {
        'traffic-1': basePlot(P.PlotTypes.MARKER, '交通标识符'),
        'traffic-2': basePlot(P.PlotTypes.MARKER, '交通标识符'),
        'traffic-3': basePlot(P.PlotTypes.MARKER, '交通标识符'),
        'traffic-4': basePlot(P.PlotTypes.MARKER, '交通标识符'),
        'traffic-5': basePlot(P.PlotTypes.MARKER, '交通标识符'),
        'traffic-6': basePlot(P.PlotTypes.MARKER, '交通标识符'),
        'traffic-7': basePlot(P.PlotTypes.MARKER, '交通标识符'),
        'traffic-8': basePlot(P.PlotTypes.MARKER, '交通标识符'),
        'traffic-9': basePlot(P.PlotTypes.MARKER, '交通标识符'),
        'traffic-10': basePlot(P.PlotTypes.MARKER, '交通标识符'),
        'traffic-11': basePlot(P.PlotTypes.MARKER, '交通标识符')
    },
    flood: {
        'flood-1': basePlot(P.PlotTypes.MARKER, '火灾'),
        'flood-2': basePlot(P.PlotTypes.MARKER, '城市防洪'),
        'flood-3': basePlot(P.PlotTypes.MARKER, '溃口'),
        'flood-4': basePlot(P.PlotTypes.MARKER, '避水楼、安全楼'),
        'flood-5': basePlot(P.PlotTypes.MARKER, '避水台、庄台'),
        'flood-6': basePlot(P.PlotTypes.MARKER, '超强台风'),
        'flood-7': basePlot(P.PlotTypes.MARKER, '强台风'),
        'flood-8': basePlot(P.PlotTypes.MARKER, '台风'),
        'flood-9': basePlot(P.PlotTypes.MARKER, '强热带风暴'),
        'flood-10': basePlot(P.PlotTypes.MARKER, '热带低压'),
        'flood-11': basePlot(P.PlotTypes.MARKER, '热带风暴'),
        'flood-12': basePlot(P.PlotTypes.MARKER, '山洪地质灾害隐患点'),
        'flood-13': basePlot(P.PlotTypes.MARKER, '山洪灾害点'),
        'flood-14': basePlot(P.PlotTypes.MARKER, '山洪灾害预警点'),
        'flood-15': basePlot(P.PlotTypes.MARKER, '堰塞湖'),
        'flood-16': basePlot(P.PlotTypes.MARKER, '视频监控点'),
        'flood-17': basePlot(P.PlotTypes.MARKER, '防汛备用土、石料'),
        'flood-18': basePlot(P.PlotTypes.MARKER, '防汛机动抢险队'),
        'flood-19': basePlot(P.PlotTypes.MARKER, '防汛抗旱物资仓库'),
        'flood-20': basePlot(P.PlotTypes.MARKER, '预警设施'),
        'flood-21': basePlot(P.PlotTypes.MARKER, '退洪口门'),
        'flood-22': basePlot(P.PlotTypes.MARKER, '分洪口门'),
        'flood-23': basePlot(P.PlotTypes.MARKER, '分退合用'),
        'flood-24': basePlot(P.PlotTypes.MARKER, '指挥部'),
        'flood-25': basePlot(P.PlotTypes.MARKER, '紧急救护站'),
        'flood-26': basePlot(P.PlotTypes.MARKER, '抗旱服务队'),
        'flood-27': basePlot(P.PlotTypes.MARKER, '通讯基站'),
        'flood-28': basePlot(P.PlotTypes.MARKER, '卫星地面接收站'),
        'flood-29': basePlot(P.PlotTypes.MARKER, '贮水池、水窖'),
        'flood-30': basePlot(P.PlotTypes.MARKER, '转移安置点')
    },
    weather: {
        'weather-1': basePlot(P.PlotTypes.MARKER, '天气标志符'),
        'weather-2': basePlot(P.PlotTypes.MARKER, '天气标志符'),
        'weather-3': basePlot(P.PlotTypes.MARKER, '天气标志符'),
        'weather-4': basePlot(P.PlotTypes.MARKER, '天气标志符'),
        'weather-5': basePlot(P.PlotTypes.MARKER, '天气标志符'),
        'weather-6': basePlot(P.PlotTypes.MARKER, '天气标志符'),
        'weather-7': basePlot(P.PlotTypes.MARKER, '天气标志符')
    }
}

// const convert = function() {
//     for (var key in constant) {  
//         var val = constant[key];
//         for (var key2 in val) {  
//             var val2 = val[key2];
//             val2.name = key2;
//             if(!val2.src) {
//                 if(key == 'tool') {
//                     val2.src = '/src/assets/img/plot/tool/' + key2 + '.png';
//                 }
//                 var list = key2.split('-');
//                 if(list.length == 2) {
//                     val2.src = '/src/assets/img/plot/' + list[0] + '/' + list[1] + '.png';
//                 }
                
//             }
//         }
//     }
// }

// convert();

const getPlotConstant = function(name) {
    var con;
    for (var key in constant) {  
        var val = constant[key];
        if (name in val) {
            con = val[name];
            con.name = name;
            return con;
        }
    }
    return null;  
}

export default {
    getPlotConstant,
    constant
}