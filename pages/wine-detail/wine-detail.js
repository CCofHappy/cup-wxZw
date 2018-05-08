// pages/wine-detail/wine-detail.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.globalData.imagePath,
        activeIndex:0,
        interflowList:"",
        hasMore: true,
        start: 1,
        count: 10,
        productId: "",
        rewardPid: "",
        rewardName: "",
        rewardImgUrl: "",
        giveRewardOpen: false,
        payAfter: false,
        payAfterPrice: 0,
        postType: "2",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            hasMore: true,
            showLoading: true,
            interflowWine: wx.getStorageSync('interflowWine'),
            customerInfo: wx.getStorageSync('customerInfo'),
            productId: this.data.productId||options.id,
        });
        this.initData()
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
        if (this.data.showLoading) return;
        this.initData();
    },

    initData: function (page, rows) {
        //初始化页面
        var that = this;
        if (that.data.hasMore) {
            var params = {
                apiname: 'bbs/post/assess/list',
                customerSeq: that.data.customerInfo.customerSeq,
                page: page || that.data.start,
                rows: rows || that.data.count,
                orderBy: 1,
                sort: 2,
                productId: that.data.productId
            }
            this.setData({
                showLoading: true,
            })
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    if (res.data.data.dataList.length > 0) {
                        for (var i = 0; i < res.data.data.dataList.length; i++) {
                            res.data.data.dataList[i].createTime = util.changeTime(util.toDate(res.data.data.dataList[i].createTime, 7));
                        }
                    }
                    if (params.page == 1) {//只有初始化时时 需要重置
                        that.setData({
                            interflowList: res.data.data.dataList,
                            nullTip: {
                                tipText: '暂无相关帖子哦'
                            }
                        });
                    }
                    if (!res.data.data.dataList) {
                        that.setData({
                            hasMore: false
                        })
                    } else {
                        if (res.data.data.dataList.length < params.rows) {
                            that.setData({
                                hasMore: false
                            })
                        }
                        if (params.page != 1) {
                            that.setData({
                                interflowList: that.data.interflowList.concat(res.data.data.dataList),
                            })
                        }
                        that.setData({
                            //每次查询之后 将页码+1
                            start: page ? that.data.start : that.data.start + 1,
                        })
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
        }
    },

    //点赞
    clickCall: function (e) {
        if (!app.checkLogin()) return;//校验登录
        var _this = this;
        var pid = e.currentTarget.dataset.pid
        var activeTab = _this.data.activeIndex;
        var params = {
            apiname: "bbs/post/insertPostPraise",
            uid: _this.data.customerInfo.customerSeq,
            pid: pid,
            type: 2,
        };
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                app.showToastMsg(0, '点赞成功');
                var nowCount = 10 * (_this.data.start - 1);
                _this.setData({
                    hasMore: true,
                })
                _this.initData(1, nowCount);
            } else {
                app.showToastMsg(-2, res.data.message);
            }
        }, _this)
    },

    //打赏
    openGiveReward: function (e) {
        if (!app.checkLogin()) return;//校验登录
        var data = e.currentTarget.dataset.data;
        this.setData({
            postType: e.currentTarget.dataset.type,
            giveRewardOpen: true,
            rewardPid: data.pid,
            rewardName: data.name,
            rewardImgUrl: data.customerImgUrl,
            rewardUCount: data.uCount || 0,
            rewardAmountAll: data.amountAll || 0,
        })
    }
})