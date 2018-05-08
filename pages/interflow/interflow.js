// pages/interflow/interflow.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    data: {
        tabs: ["交流", "酒评"],
        customerInfo: {},
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: 90,
        imgUrl: app.globalData.imagePath,
        interflowList: '',
        commentList: '',
        hasMore: true,
        showLoading: true,
        hasMoreCom: true,
        isTop: 1,//默认是最新分享 带置顶 查询
        start: 1,//从第几页开始
        startCom: 1,//从第几页开始 历史分享
        count: 10, //一页展示多少行
        countCom: 10,//一页展示多少行
        reCall: 'ic_good_unpress.png',
        nullTip: {
            tipText: '数据加载中...'
        },
        rewardPid: "",
        rewardName: "",
        rewardImgUrl: "",
        giveRewardOpen: false,
        payAfter: false,
        payAfterPrice: 0,
        postType:"2",
    },
    onLoad: function (options) {
        var that = this;
        var sliderWidth = that.data.sliderWidth;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
                });
            }
        });
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            start: 1,//从第几页开始
            startCom: 1,//从第几页开始 历史分享
            hasMore: true,
            hasMoreCom: true
        });
        if (this.data.activeIndex == 0) {
            this.initData();
        } else {
            this.initCommentData()
        }
    },
    onShow:function(){

    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        if (this.data.activeIndex == 0) {
            this.setData({
                hasMore: true,
                start: 1,//从第几页开始
                count: 10, //一页展示多少行
                nullTip: {
                    tipText: '数据加载中...',
                }
            })
            this.initData()
        } else {
            this.setData({
                hasMoreCom: true,
                startCom: 1,//从第几页开始
                countCom: 10, //一页展示多少行
                nullTip: {
                    tipText: '数据加载中...',
                }
            })
            this.initCommentData()
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.showLoading) return;
        if (this.data.activeIndex == 0) {
            this.initData();
        } else {
            this.initCommentData();
        }
    },

    initData: function (page,rows) {
        //初始化页面
        var that = this;
        if (that.data.hasMore) {
            var params = {
                apiname: 'bbs/post/assess/queryInterflowList',
                customerSeq: that.data.customerInfo.customerSeq,
                page: page||that.data.start,
                rows: rows||that.data.count,
                orderBy: 1,
                sort: 2,
            }
            that.setData({
                showLoading: true,
            });
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

    initCommentData: function (page,rows) {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (that.data.hasMoreCom) {
            var params = {
                apiname: 'bbs/post/assess/list',
                customerSeq: that.data.customerInfo.customerSeq,
                orderBy: 1,
                sort: 2,
                page: page||that.data.startCom,
                rows: rows||that.data.countCom
            }
            that.setData({
                showLoading: true,
            });
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    if (res.data.data.dataList.length > 0) {
                        for (var i = 0; i < res.data.data.dataList.length; i++) {
                            res.data.data.dataList[i].createTime = util.changeTime(util.toDate(res.data.data.dataList[i].createTime, 7));
                        }
                    }
                    if (params.page == 1) {//只有初始化时时 需要重置
                        that.setData({
                            commentList: res.data.data.dataList,
                            nullTip: {
                                tipText: '暂无相关帖子哦'
                            }
                        });
                    }
                    if (!res.data.data.dataList) {
                        that.setData({
                            hasMoreCom: false
                        })
                    } else {
                        if (res.data.data.dataList.length < params.rows) {
                            that.setData({
                                hasMoreCom: false
                            })
                        }
                        if (params.page != 1) {
                            that.setData({
                                commentList: that.data.commentList.concat(res.data.data.dataList)
                            })
                        }
                        that.setData({
                            //每次查询之后 将页码+1
                            startCom: page?that.data.startCom :that.data.startCom + 1,
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

    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id,
        });
        if (e.currentTarget.id == 1 && !this.data.commentList) {
            this.setData({ showLoading: true });
            this.initCommentData();
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
                app.showToastMsg(0, title);
                if (that.data.activeIndex == 0) {
                    var nowCount = 10 * (that.data.start-1);
                    that.setData({
                        hasMore: true,
                        isTop: 1,
                    })
                    that.initData(1, nowCount);
                } else {
                    var nowCount = 10 * (that.data.startCom-1);
                    that.setData({
                        hasMoreCom: true,
                        isTop: 0,
                    })
                    that.initCommentData(1, nowCount);
                }
            } else {
                app.showToastMsg(-1, res.data.message);
            }
        })
    },
    goPublish: function () {
        var that = this;
        if (!app.checkLogin()) return;//校验登录
        var url = "/pages/interflow-publish/interflow-publish";
        if (this.data.activeIndex != 0) {
            url = "/pages/comment-publish/comment-publish";
        }
        wx.navigateTo({
            url: url,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    //点赞
    clickCall: function (e) {
        if (!app.checkLogin()) return;//校验登录
        var _this = this;
        var pid = e.currentTarget.dataset.pid
        var activeTab = _this.data.activeIndex;
        var params = {
            apiname: "bbs/post/assess/insertPostPraise",
            uid: _this.data.customerInfo.customerSeq,
            pid: pid,
            type: this.data.activeIndex == 0 ? 3 : 2,
        };
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                app.showToastMsg(0, '点赞成功');
                if (activeTab == 1) {
                    var nowCount = 10 * (_this.data.startCom - 1);
                    _this.setData({
                        hasMoreCom: true,
                    })
                    _this.initCommentData(1, nowCount);
                } else {
                    var nowCount = 10 * (_this.data.start - 1);
                    _this.setData({
                        hasMore: true,
                    })
                    _this.initData(1, nowCount);
                }
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
            rewardPid: data.pid,
            rewardUCount: data.uCount || 0,
            rewardAmountAll: data.amountAll || 0,
        })
    }
})