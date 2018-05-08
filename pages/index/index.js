var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    data: {
        recommendBanner: [],
        brand: '',
        datAuction: '',
        showSession: '',
        saleSession: '',
        drinkAuction: '',
        recommendAuction: '',
        historyAuction: '',
        showTime: {},
        saleTime: {},
        showLoading: true,
        saleSetIntervalTime: '',
        showSetIntervalTime: '',
        imgUrl: app.globalData.imagePath,
        bannerWidth: 0,
        bannerHeight: 0,
    },
    onLoad: function (options) {
        var that = this;
        that.initData();
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    bannerWidth: res.windowWidth,
                    bannerHeight: res.windowWidth * 0.6
                });
            }
        })
    },
    onShow: function () {
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo')
        })
    },
    initData: function () {
        //初始化页面
        var that = this
        var data = {
            apiname: 'homepage/getData',
        }
        request.getData(data, function (res) {
            var data = res.data.data;
            that.setData({
                recommendBanner: data.recommendList,
                brand: data.recommendAreaList,
                datAuction: data.SessionRecommend1,
                showSession: data.showSession,
                saleSession: data.recommendSession,
                drinkAuction: data.recommend2,
                recommendAuction: data.recommend1,
                showLoading: false,
            })
            var serverTime = util.getServerTime();//获取服务器时间
            var countShow = 0, countSale = 0;
            //预展专场倒计时
            if (data.showSession) {//非空处理
                countShow = data.showSession.auctionSessionStart - serverTime;
                var showTime = util.countDown(countShow);
                that.setData({
                    showTime: showTime
                })
                //清除之前的倒计时
                if (that.data.showSetIntervalTime) {
                    clearInterval(that.data.showSetIntervalTime);
                }
                var showSetIntervalTime = setInterval(function () {
                    countShow = countShow - 1000;
                    showTime = util.countDown(countShow);
                    that.setData({
                        showTime: showTime
                    })
                }, 1000);
                //记录倒计时编号
                that.setData({
                    showSetIntervalTime: showSetIntervalTime
                })
            }
            //拍卖专场倒计时
            if (data.recommendSession) {//非空处理
                countSale = data.recommendSession.auctionSessionEnd - serverTime;
                var saleTime = util.countDown(countSale);
                that.setData({
                    saleTime: saleTime
                })
                //清除之前的倒计时
                if (that.data.saleSetIntervalTime) {
                    clearInterval(that.data.saleSetIntervalTime);
                }
                var saleSetIntervalTime = setInterval(function () {
                    countSale = countSale - 1000;
                    saleTime = util.countDown(countSale);
                    that.setData({
                        saleTime: saleTime
                    })
                }, 1000);
                //记录倒计时编号
                that.setData({
                    saleSetIntervalTime: saleSetIntervalTime
                })
            }
        }, that)
        var historyData = {
            apiname: 'auction/historyAuction',
        }
        request.getData(historyData, function (res) {
            if (res.data.state == 1) {
                var data = res.data.data;
                that.setData({
                    historyAuction: data
                })
            }
        }, that)
    },
    onPullDownRefresh: function () {
        // 页面相关事件处理函数--监听用户下拉动作
        var that = this
        that.setData({
            showLoading: true,
        })
        that.onLoad()
    }
})
