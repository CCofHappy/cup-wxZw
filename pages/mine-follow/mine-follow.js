// pages/mine-follow/mine-follow.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    data: {
        imgUrl: app.globalData.imagePath,
        followList: '',
        hasMore: true,
        showLoading: true,
        start: 1,//从第几页开始
        count: 10, //一页展示多少行
        nullTip: {
            tipText: '数据加载中...'
        }
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
        })
        this.initData();
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.setData({
            hasMore: true,
            showLoading: true,
            start: 1,//从第几页开始
            count: 10, //一页展示多少行
            nullTip: {
                tipText: '数据加载中...',
            }
        })
        this.initData()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.initData();
    },

    initData: function () {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (that.data.hasMore) {
            var params = {
                apiname: 'bbs/post/queryFollowByUid',
                uid: that.data.customerInfo.customerSeq,
                customerSeq: that.data.customerInfo.customerSeq,
                page: that.data.start,
                rows: that.data.count
            }
            that.setData({
                showLoading: true,
            });
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    if (that.data.start == 1) {//只有初始化时时 需要重置
                        that.setData({
                            followList: res.data.data.dataList,
                            nullTip: {
                                tipText: '没有相关数据哦'
                            }
                        });
                    }
                    if (!res.data.data.dataList) {
                        that.setData({
                            hasMore: false,
                            showLoading: false
                        })
                    } else {
                        if (res.data.data.dataList.length < params.rows) {
                            that.setData({
                                hasMore: false
                            })
                        }
                        if (that.data.start != 1) {
                            that.setData({
                                followList: that.data.followList.concat(res.data.data.dataList)
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
                            tipText: '数据加载失败...',
                            showLoading: false
                        }
                    });
                }
            }, that)
        }
    },

    aboutFollow: function (e) {
        var that = this;
        if (!app.checkLogin()) return;//校验登录
        var params = {
            apiname: "bbs/post/follow",
            uid: that.data.customerInfo.customerSeq,
            followUid: e.currentTarget.dataset.upid,
        },
            title = "关注成功";

        if (e.currentTarget.dataset.cancel) {
            params.apiname = "bbs/post/cancelFollow";
            title = "取消关注成功";
        }
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                app.showToastMsg(0, title)
            }
            var nowCount = 10 * that.data.start;
            that.setData({
                start: 1,//从第几页开始
                count: nowCount, //一页展示多少行
                hasMore: true,
            })
            that.initData();
        })
    },
})