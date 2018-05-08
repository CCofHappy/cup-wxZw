// component/shareOrder/shareOrder.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        shareOrder: {
            type: Object,
            value: '',
            observer: function (newVal, oldVal) {
                var that = this;
                var pages = getCurrentPages();
                var prePage = pages[pages.length - 1];
                that.setData({
                    navigateLock: false,
                })
                if (!newVal)return;
                for (var i = 0; i < newVal.length;i++){
                    if (newVal[i].state==0){
                        var time = 1800 - newVal[i].outTime;
                        var orderCount = that.data.orderCount;
                        var orderCountDown = that.data.orderCountDown;
                        orderCount.push(time);
                        var minute = parseInt(time / 60);
                        var second = time % 60;
                        orderCountDown.push(minute + '分' + second + '秒');
                        that.setData({
                            orderCountDown: orderCountDown,
                            orderCount: orderCount
                        })
                    }
                }
                clearInterval(that.data.setIntervalTimeId);
                var setIntervalTimeId = setInterval(function () {
                    var arr = that.data.orderCount;
                    for(var i =0;i<arr.length;i++){
                        var time = arr[i]-1;
                        var orderCountDown = that.data.orderCountDown;
                        orderCount[i] = time;
                        that.setData({
                            orderCount: orderCount
                        })
                        if (time < 0) {
                            orderCountDown[i]=''
                            that.setData({
                                orderCountDown: orderCountDown
                            })
                        } else {
                            minute = parseInt(time / 60);
                            second = time % 60;
                            orderCountDown[i] = minute + '分' + second + '秒';
                            that.setData({
                                orderCountDown: orderCountDown
                            })
                        }
                    }
                }, 1000)
                that.setData({
                    setIntervalTimeId: setIntervalTimeId
                })
            }
        },
        hasMore: {
            type: Boolean,
            value: '',
            observer: function (newVal, oldVal) {
            }
        },
        showLoading: {
            type: Boolean,
            value: '',
            observer: function (newVal, oldVal) {
            }
        },
        nullTip: {
            type: Object,
            value: '',
            observer: function (newVal, oldVal) {
            }
        },
        type: {
            type: String,
            value: '',
            observer: function (newVal, oldVal) {  
                this.setData({
                    conType: newVal
                })
            }
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        goodsImage: app.globalData.imagePath + 'default/default@5x3.png',
        conType:'',
        orderCountDown: [],
        orderCount: [],
        navigateLock: false,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        cancelOrder: function (e) {
            var pages = getCurrentPages(); 
            var page = pages[pages.length - 1];
            var that = this;
            wx.showModal({
                title: '确认要取消订单吗？',
                content: '取消后，您可以在已取消页面查到',
                success: function (res) {
                    if (res.confirm) {
                        var params = {
                            apiname: 'bbs/bottle/orderCancel',
                            orderNo: e.currentTarget.dataset.orderno,
                        }
                        request.getData(params, function (res) {
                            if (res.data.state === 1) {
                                var windowWidth = page.data.windowWidth;
                                page.setData({
                                    unPayhasMore: true,
                                    unPayStart: 1,//已完成第几页
                                    cancelhasMore: true,
                                    cancelStart: 1,//已完成第几页
                                    activeIndex: 3,
                                    sliderOffset: windowWidth / 4 * 3,
                                    nullTip: {
                                        tipText: '数据加载中...'
                                    }
                                })
                                page.initData(0);
                                page.initData(3);
                                app.showToastMsg(0, "取消成功");
                            } else {
                                app.showToastMsg(-1, res.data.message);
                            }
                        }, that)
                    } else if (res.cancel) {
                    }
                }
            })
        },
        confirmGet: function (e) {
            var pages = getCurrentPages();
            var that = this;
            var page = pages[pages.length - 1];
            var data = e.currentTarget.dataset.itemdata;
            wx.showModal({
                title: '确认已收到货物吗？',
                content: '感谢您的支持！越分享，越精彩！',
                success: function (res) {
                    if (res.confirm) {
                        var params = {
                            apiname: 'bbs/bottle/receOrder',
                            uid: '' +data.uid,
                            orderNo: data.order_no,
                        }
                        if (that.data.conType == "shareOrder") {
                            params.apiname = 'bbs/post/receOrder';
                        }
                        request.getData(params, function (res) {
                            if (res.data.state === 1) {
                                var windowWidth = page.data.windowWidth;
                                page.setData({
                                    unGethasMore: true,
                                    unGetStart: 1,//已完成第几页
                                    finishedhasMore: true,
                                    finishedStart: 1,//已完成第几页
                                    activeIndex: 2,
                                    sliderOffset: windowWidth / 2,
                                    nullTip: {
                                        tipText: '数据加载中...'
                                    }
                                })
                                page.initData(1);
                                page.initData(2);
                                app.showToastMsg(0, "操作成功");
                            } else {
                                app.showToastMsg(-1, res.data.message);
                            }
                        }, that)
                    } else if (res.cancel) {
                    }
                }
            })
        },
        deleteOrder: function (e) {
            var pages = getCurrentPages();
            var that = this;
            var page = pages[pages.length - 1];
            wx.showModal({
                title: '确认删除订单吗？',
                content: '删除后，您将不能再查询到该订单！',
                success: function (res) {
                    if (res.confirm) {
                        var params = {
                            apiname: 'bbs/bottle/deleteBottleOrder',
                            boid: e.currentTarget.dataset.orderid,
                        }
                        if (that.data.conType == "shareOrder") {
                            params.apiname ='post/post/deletePost';
                        }
                        request.getData(params, function (res) {
                            if (res.data.state === 1) {
                                page.setData({
                                    nullTip: {
                                        tipText: '数据加载中...'
                                    }
                                })
                                if (e.currentTarget.dataset.state == 3) {
                                    page.setData({
                                        finishedhasMore: true,
                                        finishedStart: 1,//已完成第几页
                                    })
                                    page.initData(2)
                                } else {
                                    page.setData({
                                        cancelhasMore: true,
                                        cancelStart: 1,//已完成第几页
                                    })
                                    page.initData(3)
                                }
                                app.showToastMsg(0, "删除成功");
                            } else {
                                app.showToastMsg(-1, res.data.message);
                            }
                        }, that)
                    } else if (res.cancel) {
                    }
                }
            })
        },
        buyNow: function (e) {
            var data = e.currentTarget.dataset.itemdata;
            var pages = getCurrentPages();
            var page = pages[pages.length - 1];
            if (this.data.navigateLock) return;
            this.setData({
                navigateLock:true,
            })
            if (this.data.conType == "shareOrder") {
                wx.setStorageSync('shareDetail', data);
                wx.navigateTo({
                    url: '/pages/share-join/share-join?orderNo=' + data.orderNo + '&number=' + data.number + '&index=sp'
                })
            } else {
                wx.setStorageSync('buyNowData', data);
                wx.navigateTo({
                    url: '/pages/share-bottle-orderConfirm/share-bottle-orderConfirm?type=buyNow&num=' + data.number + '&price=' + data.price
                })
            }
        },
        checkLogistics: function (e) {
            var data = e.currentTarget.dataset.itemdata;
            if (this.data.conType == "shareOrder") {
                wx.setStorageSync('shareLogistics', data);
                var url = '/pages/logistics-detail/logistics-detail?type=share&uid=' + data.uid;
                if (data.state == 2 || data.state == 201) {
                    url = url + '&orderNo=' + data.order_no;
                }
                wx.navigateTo({
                    url: url
                })
            } else {
                wx.setStorageSync("shareBottleLogistics", data);
                wx.navigateTo({
                    url: '/pages/logistics-detail/logistics-detail?type=shareBottle'
                })
            }
        }
    }
})
