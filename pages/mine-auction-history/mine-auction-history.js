var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    data: {
        imgUrl: app.globalData.imagePath,
        customerInfo: {},
        auctionList: {},
        hasMore: true,
        showLoading: true,
        start: 1,//从第几页开始
        count: 10, //一页展示多少行
        nullTip: {
            tipText: '数据加载中...'
        }
    },
    onLoad: function (options) {
        var that = this
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo')
        })
        that.initData();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        var that = this
        that.setData({
            hasMore: true,
            showLoading: true,
            start: 1,//从第几页开始
            count: 10, //一页展示多少行
            auctionList: {},
            nullTip: {
                tipText: '数据加载中...'
            }
        })
        that.initData()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this;
        if (!that.data.showLoading) {
            that.initData()
        }
    },

    initData: function (page, rows) {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (that.data.hasMore) {
            var params = {
                apiname: 'person/auctionRecord',
                states: "4,5",
                customerSeq: that.data.customerInfo.customerSeq,
                page: page ? page : that.data.start,
                rows: rows ? rows : that.data.count,
            }
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    var data = res.data.data;
                    if (data.dataList) {
                        for (var i = 0; i < data.dataList.length; i++) {
                            data.dataList[i].startTime = util.toDate(data.dataList[i].startTime, 2)
                            data.dataList[i].endTime = util.toDate(data.dataList[i].endTime, 2)
                            data.dataList[i].createTime = util.toDate(data.dataList[i].createTime, 2)
                        }
                    }
                    if (params.page == 1) {//只有初始化时时 需要重置
                        that.setData({
                            auctionList: data.dataList,
                            nullTip: {
                                tipText: '没有相关数据哦'
                            }
                        });
                    }
                    if (!data.dataList) {
                        that.setData({
                            hasMore: false,
                            showLoading: false
                        })
                    } else {
                        if (data.dataList.length < params.rows) {
                            that.setData({
                                hasMore: false,
                                showLoading: false
                            })
                        }
                        if (params.page != 1) {
                            that.setData({
                                auctionList: that.data.auctionList.concat(data.dataList)
                            })
                        }
                    }
                    that.setData({
                        //每次查询之后 将页码+1
                        start: that.data.start + 1,
                        showLoading: false
                    })
                } else {
                    that.setData({
                        nullTip: {
                            tipText: '数据加载失败...'
                        }
                    });
                }
            }, that)
        }
    },

})