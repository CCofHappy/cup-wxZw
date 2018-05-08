// pages/mine-post-join/mine-post-join.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabs: ["分享瓶", "交流贴", "酒评贴"],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: 90,
        imgUrl: app.globalData.imagePath,
        postList: '',
        hasMore: true,
        start: 1,//从第几页开始
        interflowList: '',
        interflowStart: 1,//从第几页开始
        interflowHasMore: true,
        commentList: '',
        commentStart: 1,//从第几页开始
        commentHasMore: true,
        count: 10, //一页展示多少行
        showLoading: true,
        reCall: 'ic_good_unpress.png',
        nullTip: {
            tipText: '数据加载中...'
        },
        serverTime: 0,
        rewardPid: "",
        rewardName: "",
        rewardImgUrl: "",
        giveRewardOpen: false,
        payAfter: false,
        payAfterPrice: 0,
        postType: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
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
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            hasMore: true,
            interflowHasMore: true,
            commentHasMore: true,
        })
        if (this.data.activeIndex == 0) {
            if (this.data.start == 1) {
                this.initData();
            } else {
                this.initData(1, 10 * this.data.start);
            }
        } else if (this.data.activeIndex == 1) {
            if (this.data.interflowStart == 1) {
                this.initIntreflow();
            } else {
                this.initIntreflow(1, 10 * this.data.interflowStart);
            }
        } else {
            if (this.data.commentStart == 1) {
                this.initComment();
            } else {
                this.initComment(1, 10 * this.data.commentStart);
            }
        }
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
            this.initData();
        } else if (this.data.activeIndex == 1) {
            this.setData({
                interflowHasMore: true,
                interflowStart: 1,//从第几页开始
                count: 10, //一页展示多少行
                nullTip: {
                    tipText: '数据加载中...',
                }
            })
            this.initIntreflow();
        } else {
            this.setData({
                commentHasMore: true,
                commentStart: 1,//从第几页开始
                count: 10, //一页展示多少行
                nullTip: {
                    tipText: '数据加载中...',
                }
            })
            this.initComment();
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.showLoading) return;
        if (this.data.activeIndex == 0) {
            this.initData();
        } else if (this.data.activeIndex == 1) {
            this.initIntreflow();
        } else {
            this.initComment();
        }
    },

    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });
        if (e.currentTarget.id == 1 && !this.data.interflowList) {
            this.initIntreflow();
        } else if (e.currentTarget.id == 2 && !this.data.commentList) {
            this.initComment();
        }
    },

    initData: function (page, rows) {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (that.data.hasMore) {
            var params = {
                apiname: 'bbs/post/list',
                state: 1,
                customerSeq: that.data.customerInfo.customerSeq,
                puid: that.data.customerInfo.customerSeq,
                page: page || that.data.start,
                rows: rows || that.data.count,
                orderBy: 5,
                sort: 2,
            }
            that.setData({
                showLoading: true,
            });
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    var serverTime = util.getServerTime();//获取服务器时间
                    if (res.data.data.dataList.length > 0) {
                        for (var i = 0; i < res.data.data.dataList.length; i++) {
                            res.data.data.dataList[i].auditTime = util.changeTime(util.toDate(res.data.data.dataList[i].auditTime, 7));
                        }
                    }
                    if (res.data.data.dataList.length < 0) {
                        that.setData({
                            hasMore: false,
                            nullTip: {
                                tipText: '您还没参与过帖子'
                            }
                        })
                    } else {
                        if (res.data.data.dataList.length < params.rows) {
                            that.setData({
                                hasMore: false
                            })
                        }
                        if (params.page == 1) {//只有初始化时时 需要重置
                            that.setData({
                                postList: res.data.data.dataList
                            });
                        } else {
                            that.setData({
                                postList: that.data.postList.concat(res.data.data.dataList),
                            })
                        }
                        that.setData({
                            serverTime: serverTime,
                            //每次查询之后 将页码+1
                            start: page ? that.data.start : that.data.start + 1,
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

    initIntreflow: function (page, rows) {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (that.data.interflowHasMore) {
            var params = {
                apiname: 'bbs/post/assess/queryInterflowList',
                customerSeq: that.data.customerInfo.customerSeq,
                puid: that.data.customerInfo.customerSeq,
                page: page || that.data.interflowStart,
                rows: rows || that.data.count,
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
                    if (res.data.data.dataList.length < 1) {
                        that.setData({
                            interflowHasMore: false,
                            showLoading: false,
                            nullTip: {
                                tipText: '您还没参与过帖子'
                            }
                        })
                    } else {
                        if (res.data.data.dataList.length < params.rows) {
                            that.setData({
                                interflowHasMore: false
                            })
                        }
                        if (params.page== 1) {//只有初始化时时 需要重置
                            that.setData({
                                interflowList: res.data.data.dataList
                            });
                        } else {
                            that.setData({
                                interflowList: that.data.interflowList.concat(res.data.data.dataList),
                            })
                        }
                        that.setData({
                            //每次查询之后 将页码+1
                            interflowStart: page ? that.data.interflowStart : that.data.interflowStart + 1,
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

    initComment: function (page, rows) {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (that.data.commentHasMore) {
            var params = {
                apiname: 'bbs/post/assess/list',
                customerSeq: that.data.customerInfo.customerSeq,
                puid: that.data.customerInfo.customerSeq,
                page: page || that.data.commentStart,
                rows: rows || that.data.count,
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
                    if (res.data.data.dataList.length < 1) {
                        that.setData({
                            commentHasMore: false,
                            showLoading: false,
                            nullTip: {
                                tipText: '您还没参与过帖子'
                            }
                        })
                    } else {
                        if (res.data.data.dataList.length < params.rows) {
                            that.setData({
                                commentHasMore: false
                            })
                        }
                        if (params.page == 1) {//只有初始化时时 需要重置
                            that.setData({
                                commentList: res.data.data.dataList
                            });
                        } else {
                            that.setData({
                                commentList: that.data.commentList.concat(res.data.data.dataList),
                            })
                        }
                        that.setData({
                            //每次查询之后 将页码+1
                            commentStart: page ? that.data.commentStart : that.data.commentStart + 1,
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


    //加关注/取消关注
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
            if (res.data.state == 0) {
                app.showToastMsg(-1, title)
                if (activeTab == 0) {
                    var nowPage = 10 * (_this.data.start - 1)
                    that.setData({
                        hasMore: true,
                    })
                    that.initData(1, nowPage);
                } else if (activeTab == 1) {
                    var nowPage = 10 * (_this.data.interflowStart - 1)
                    that.setData({
                        interflowHasMore: true,
                    })
                    that.initInterflow(1, nowPage);
                } else {
                     var nowPage = 10 * (that.data.commentStart-1)
                    that.setData({
                        commentHasMore: true,
                    })
                    that.initComment(1, nowPage);
                }
            } else {
                app.showToastMsg(-1, res.data.message)
            }
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
            type: _this.data.activeIndex == 0 ? 1 : _this.data.activeIndex == 1 ? 3 : 2,
        };
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                app.showToastMsg(0, '点赞成功');
                if (activeTab == 0) {
                    var nowPage = 10 * (_this.data.start-1)
                    _this.setData({
                        hasMore: true,
                    })
                    _this.initData(1, nowPage);
                } else if (activeTab == 1) {
                    var nowPage = 10 * (_this.data.interflowStart-1)
                    _this.setData({
                        interflowHasMore: true,
                    })
                    _this.initInterflow(1, nowPage);
                } else {
                    var nowPage = 10 * (_this.data.commentStart - 1)
                    _this.setData({
                        commentHasMore: true,
                    })
                    _this.initComment(1, nowPage);
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