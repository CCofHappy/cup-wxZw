var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    data: {
        imgUrl: app.globalData.imagePath,
        tabs: ["待付款", "待收货", "已完成", "已取消"],
        goodsImage: app.globalData.imagePath + 'default/default@5x3.png',
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: 90,
        unPayOrderList: "",
        unGetOrderList: "",
        finishedOrderList: "",
        cancelOrderList: "",
        unPayhasMore: true,
        unGethasMore: true,
        finishedhasMore: true,
        cancelhasMore: true,
        showLoading: false,
        unPayStart: 1,//待付款第几页
        unGetStart: 1,//待收货第几页
        finishedStart: 1,//已完成第几页
        cancelStart: 1,//已取消第几页
        count: 10, //一页展示多少行
        nullTip: {
            tipText: '数据加载中...'
        },
        orderType: 'bottle',
    },
    // 生命周期函数--监听页面加载
    onLoad: function (options) {
        var that = this;
        var sliderWidth = that.data.sliderWidth;
        if (options&&options.type==1){
            that.setData({
                activeIndex:1,
            })  
        }
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
                    windowWidth: res.windowWidth,
                });
            }
        });
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
        });
    },
    onShow:function(){
        var _this = this;
        _this.setData({unPayStart:1});
        _this.initData(this.data.activeIndex);
    },
    //  *页面相关事件处理函数--监听用户下拉动作
    onPullDownRefresh: function () {
        this.setData({
            showLoading: true,
            count: 10, //一页展示多少行
            nullTip: {
                tipText: '数据加载中...',
            }
        })
        var num = parseInt(this.data.activeIndex)
        switch (num) {
            case 0:
                this.setData({
                    unPayhasMore: true,
                    unPayStart: 1,//待付款第几页
                })
                break;
            case 1:
                this.setData({
                    unGethasMore: true,
                    unGetStart: 1,//待收货第几页
                })
                break;
            case 2:
                this.setData({
                    finishedhasMore: true,
                    finishedStart: 1,//已完成第几页
                })
                break;
            case 3:
                this.setData({
                    cancelhasMore: true,
                    cancelStart: 1,//已取消第几页
                })
                break;
        }
        this.initData(this.data.activeIndex)
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.showLoading) return;
        this.initData(this.data.activeIndex)
    },

    //tab 切换
    tabClick: function (e) {
        if (e.currentTarget.id != this.data.activeIndex){
            this.setData({
                sliderOffset: e.currentTarget.offsetLeft,
                activeIndex: e.currentTarget.id,
                showLoading: true,
            });
            this.initData(e.currentTarget.id);
        }
    },

    initData: function (state) {
        var that = this;
        var state = state ? parseInt(state) : 0;
        var dataState = ""
        var page = that.data.unPayStart;
        switch (state) {
            case 0:
                page = that.data.unPayStart;
                dataState = 0;
                break;
            case 1:
                page = that.data.unGetStart;
                dataState = "1,2";
                break;
            case 2:
                page = that.data.finishedStart;
                dataState = 3;
                break;
            case 3:
                page = that.data.cancelStart;
                dataState = 4;
                break;
        }
        var params = {
            apiname: 'bbs/bottle/queryBottleOrder',
            uid: wx.getStorageSync('customerInfo').customerSeq,
            state: dataState,
            page: page,
            rows: that.data.count
        }
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                var data = res.data.data.dataList;
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        data[i].createTime = util.toDate(data[i].createTime,7);
                    }
                }
                if (params.page == 1) {//只有初始化时时 需要重置
                    switch (state) {
                        case 0:
                            that.setData({ unPayOrderList: data })
                            break;
                        case 1: 
                            that.setData({ unGetOrderList: data})
                            break;
                        case 2:
                            that.setData({ finishedOrderList: data})
                            break;
                        case 3:
                            that.setData({ cancelOrderList: data })
                            break;
                    }
                    that.setData({
                        nullTip: {
                            tipText: '暂无相关订单'
                        }
                    });
                }
                if (data.length < params.rows) {
                    switch (state) {
                        case 0:
                            that.setData({ unPayhasMore: false })
                            break;
                        case 1:
                            that.setData({ unGethasMore: false })
                            break;
                        case 2:
                            that.setData({ finishedhasMore: false })
                            break;
                        case 3:
                            that.setData({ cancelhasMore: false })
                            break;
                    }
                }
                if (params.page != 1) {
                    switch (state) {
                        case 0:
                            that.setData({ unPayOrderList: that.data.unPayOrderList.concat(data) })
                            break;
                        case 1:
                            that.setData({ unGetOrderList: that.data.unGetOrderList.concat(data) })
                            break;
                        case 2:
                            that.setData({ finishedOrderList: that.data.finishedOrderList.concat(data) })
                            break;
                        case 3:
                            that.setData({ cancelOrderList: that.data.cancelOrderList.concat(data) })
                            break;
                    }
                }
                //每次查询之后 将页码+1
                switch (state) {
                    case 0:
                        that.setData({ unPayStart: that.data.unPayStart + 1, })
                        break;
                    case 1:
                        that.setData({ unGetStart: that.data.unGetStart + 1, })
                        break;
                    case 2:
                        that.setData({ finishedStart: that.data.finishedStart + 1, })
                        break;
                    case 3:
                        that.setData({ cancelStart: that.data.cancelStart + 1, })
                        break;
                }
                that.setData({
                    showLoading: false
                })
            } else {
                that.setData({
                    nullTip: {
                        tipText: '数据加载失败...'
                    },
                    showLoading: false
                });
            }
        }, that)
    },
})