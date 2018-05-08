var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
Page({
    data: {
        customerInfo: {},
        logisticsData: {},
        id: "",
        logisticsData: {},
        logisticsState: "加载中",
        type: '',//只有帖子详情 查看物流才展示收货人信息 其余均不用展示
        nullTip: {
            tipText: '数据加载中...'
        }
    },
    onLoad: function (options) {
        var that = this;
        var shareLogistics ="";
        if (options.type && options.type=="share"){
            shareLogistics = wx.getStorageSync('shareLogistics');
        } else if (options.type &&options.type == "shareBottle"){
            shareLogistics = wx.getStorageSync('shareBottleLogistics');
        }
        //更新数据
        if (options.type){
            that.setData({
                customerInfo: wx.getStorageSync('customerInfo'),
                shareLogistics: shareLogistics,
                id: options.id ? options.id : "",
                sendid: options.sendid ? options.sendid : "",
                type: options.type ? options.type : "",
                express: options.express ? options.express : shareLogistics.express,
                expressNumber: options.express_number ? options.express_number : shareLogistics.express_number,
                orderNo: options.orderNo ? options.orderNo:'',
                uid: options.uid,
            })
        }else{
            that.setData({
                customerInfo: wx.getStorageSync('customerInfo'),
                id: options.id ? options.id : "",
                sendid: options.sendid ? options.sendid : "",
                uid: options.uid ? options.uid : "",
            })
        }
        
        that.initData();
    },

    initData: function () {
        //初始化页面
        var that = this;
        message.hide.call(that);
        var data = {
            apiname: 'delivery/getDelDes',
        }
        if (that.data.id) {
            data.nu = that.data.id;
        } else {
            data.sendLogisticsSeq = that.data.sendid;
        }
        if (that.data.type == 'share' || that.data.type == 'shareBottle') {
            data = {
                apiname: 'bbs/post/queryExpress',
                express: that.data.express,
                expressNumber: that.data.expressNumber
            }
        }

        request.getData(data, function (res) {
            if (res.data.state == 1) {
                var data = res.data.data;
                var logisticsState = "正在出库";
                if (that.data.sendid) {
                    logisticsState = "暂无订单状态";
                }
                var state = data.state;
                switch (parseInt(state)) {
                    case 0: logisticsState = "快件处于运输过程中"; break;
                    case 1: logisticsState = "快件已由快递公司揽收"; break;
                    case 2: logisticsState = "快递100无法解析的状态"; break;
                    case 3: logisticsState = "正常签收"; break;
                    case 4: logisticsState = "货物退回发货人并签收"; break;
                    case 5: logisticsState = "货物正在进行派件"; break;
                    case 6: logisticsState = "货物正处于返回发货人的途中"; break;
                }
                if (!data.express){
                    data.express = '暂无数据';
                }
                if (!data.expressNumber) {
                    data.nu = '暂无单号';
                }
                that.setData({
                    logisticsData: data,
                    logisticsState: logisticsState,
                    nullTip: { tipText: '暂无物流信息哦' }
                })
            } else {
                that.setData({
                    nullTip: {
                        tipText: '数据加载失败...'
                    }
                })
            }
        }, that)

    },
    getGoodsBtn: function (e) {
        var that = this;
        wx.showModal({
            title: '确认已收到货物吗？',
            content: '感谢您的支持！越分享，越精彩！',
            success: function (res) {
                if (res.confirm) {
                    var params = {
                        apiname: 'bbs/post/receOrder',
                        uid: that.data.uid,
                        orderNo: that.data.orderNo
                    }
                    request.getData(params, function (res) {
                        if (res.data.state === 1) {
                            that.setData({
                                hasMore: true,
                                showLoading: true,
                                start: 1,//从第几页开始
                                count: 10, //一页展示多少行
                                nullTip: {
                                    tipText: '数据加载中...'
                                }
                            })
                            that.initData()
                            app.showToastMsg(0, '操作成功');
                            var pages = getCurrentPages();
                            var page = pages[pages.length - 2];
                            if (page.data.orderType) {
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
                            }
                            setTimeout(function () {
                                wx.navigateBack({
                                    delta: 1,
                                })
                            }, 1000)
                        } else {
                            app.showToastMsg(-1, res.data.message)
                        }
                    }, that)
                } else if (res.cancel) {}
            }
        })
    }

})