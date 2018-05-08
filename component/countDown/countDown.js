// component/countDown/countDown.js
var app = getApp();
var util = require('../../utils/util');
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isEnd: {
            type: Number,
            value: 0,
            observer: function (newVal, oldVal) {
            }
        },
        endTime: { // 属性名
            type: Number, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
            value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
            observer: function (newVal, oldVal) {
            } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串
        },
        presellTime: { 
            type: Number, 
            value: '', 
            observer: function (newVal, oldVal) {
            } 
        },
        serverTime: { // 属性名
            type: Number, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
            value: 0, // 属性初始值（可选），如果未指定则会根据类型选择一个
            observer: function (newVal, oldVal) {
                this.setPresellTime();
                this.setEndTime();
            } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        imgUrl: app.globalData.imagePath,
        countDownTime: "",
        comEndTime: "",
        presellTimeId:"",
        endTimeId: "",
        thisEndTime:"",
    },

    /**
     * 组件的方法列表
     */

    methods: {
        setPresellTime:function(){
            var that = this;
            if (!that.data.presellTime || that.data.presellTime==0) {
                that.setData({
                    countDownTime: "",
                })
            } else {
                var preCountDown = that.data.presellTime - that.data.serverTime;
                var pages = getCurrentPages();
                var prePage = pages[pages.length - 1];
                if (preCountDown > 0) {
                    var countTimeArr = util.countDown(preCountDown);
                    that.setData({
                        countDownTime: countTimeArr.day + " 天 " + countTimeArr.hour + " 时 " + countTimeArr.minute + " 分 " + countTimeArr.second + " 秒"
                    })
                    clearInterval(that.data.presellTimeId);
                    var setIntervalTimeId = setInterval(function () {
                        preCountDown = preCountDown - 1000;
                        if (preCountDown < 0) {
                            that.setData({
                                countDownTime: "",
                            })
                            clearInterval(that.data.presellTimeId);
                            setTimeout(function () {
                                prePage.onPullDownRefresh();
                            }, 2000)
                        } else {
                            countTimeArr = util.countDown(preCountDown)
                            that.setData({
                                countDownTime: countTimeArr.day + " 天 " + countTimeArr.hour + " 时 " + countTimeArr.minute + " 分 " + countTimeArr.second + " 秒"
                            })
                        }
                    }, 1000)
                    that.setData({
                        presellTimeId: setIntervalTimeId
                    })
                } else {
                    that.setData({
                        countDownTime: "",
                    })
                }
            }
        },
        setEndTime:function(){
            var that=this;
            var time = util.toDate(that.data.endTime, 2);
            this.setData({
                thisEndTime: time
            })
            var countTime = that.data.endTime - that.data.serverTime;
            var pages = getCurrentPages();
            var prePage = pages[pages.length - 1];
            if (countTime > 0) {
                var countTimeArr = util.countDown(countTime);
                that.setData({
                    comEndTime: countTimeArr.day + " 天 " + countTimeArr.hour + " 时 " + countTimeArr.minute + " 分 " + countTimeArr.second + " 秒"
                })
                clearInterval(that.data.endTimeId);
                var setIntervalTimeId = setInterval(function () {
                    countTime = countTime - 1000;
                    if (countTime < 0) {
                        that.setData({
                            comEndTime: "",
                        })
                        clearInterval(that.data.endTimeId);
                        setTimeout(function () {
                            prePage.onPullDownRefresh();
                        }, 2000)
                    } else {
                        countTimeArr = util.countDown(countTime)
                        that.setData({
                            comEndTime: countTimeArr.day + " 天 " + countTimeArr.hour + " 时 " + countTimeArr.minute + " 分 " + countTimeArr.second + " 秒"
                        })
                    }
                }, 1000)
                that.setData({
                    endTimeId: setIntervalTimeId
                })
            }
        }
        
    },

})


