// mine-foot.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
Page({
    data: {
        customerInfo: {},
        footList: [],
        hasMore: true,
        showLoading: true,
        start: 1,//从第几页开始
        count: 10, //一页展示多少行
        nullTip: {
            tipText: '数据加载中...',
            actionText: '返回',
            routeUrl: '/pages/mine/mine'
        }
    },
    onLoad: function (options) {
        var that = this
        //更新数据
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
            nullTip: {
                tipText: '数据加载中...'
            }
        })
        that.onLoad()
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

    initData: function () {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (that.data.hasMore) {
            var params = {
                apiname: 'person/track',
                customerSeq: that.data.customerInfo.customerSeq,
                page: that.data.start,
                rows: that.data.count
            }
            request.getData(params, function (res) {
                var data = res.data.data;
                if (res.data.state == 1) {
                    if (that.data.start == 1) {//只有初始化时时 需要重置
                        that.setData({
                            footList: data.dataList,
                            nullTip: {
                                tipText: '您还没浏览过拍品'
                            },
                            showLoading: false
                        });
                    }
                    if (data.dataList.length === 0) {
                        that.setData({
                            hasMore: false,
                        })
                    } else {
                        if (data.dataList.length < params.rows) {
                            that.setData({
                                hasMore: false
                            })
                        }
                        if (that.data.start != 1) {
                            that.setData({
                                footList: that.data.footList.concat(data.dataList)
                            })
                        }
                        that.setData({
                            //每次查询之后 将页码+1
                            start: that.data.start + 1,
                            showLoading: false
                        })
                    }
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

    clearBtn: function () {
        var that = this;
        wx.showModal({
            content: '确定要清除全部足迹吗？',
            confirmText: '确定',
            cancelText: '取消',
            success: function (res) {
                if (res.confirm) {
                    var params = {
                        apiname: 'person/deletetAll/' + that.data.customerInfo.customerSeq,
                    }
                    request.getData(params, function (res) {
                        if (res.data.state === 1) {
                            app.showToastMsg(0, '操作成功')
                            that.setData({
                                hasMore: true,
                                showLoading: true,
                                start: 1,//从第几页开始
                                count: 10, //一页展示多少行
                                nullTip: {
                                    tipText: '数据加载中...'
                                }
                            })
                            that.onLoad();
                        } else {
                            app.showToastMsg(-1, res.data.message)
                        }
                    }, that)
                } else if (res.cancel) {}
            }
        })
    },
})