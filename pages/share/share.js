var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    data: {
        tabs: ["最新分享", "历史分享"],
        customerInfo: {},
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: 90,
        imgUrl: app.globalData.imagePath,
        shareList: '',
        shareHisList: '',
        hasMore: true,
        showLoading: true,
        hasMoreHis: true,
        isTop: 1,//默认是最新分享 带置顶 查询
        start: 1,//从第几页开始
        startHis: 1,//从第几页开始 历史分享
        count: 10, //一页展示多少行
        countHis: 10,//一页展示多少行
        reCall:'ic_good_unpress.png',
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
        rewardUCount: 0,
        rewardAmountAll: 0,
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
            hasMore: true,
            hasMoreHis: true
        });
        if (this.data.activeIndex == 0) {
            this.initData();
        } else {
            this.initHisData();
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
        } else {
            this.setData({
                hasMoreHis: true,
                startHis: 1,//从第几页开始
                countHis: 10, //一页展示多少行
                nullTip: {
                    tipText: '数据加载中...',
                }
            })
            this.initHisData();
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
            this.initHisData();
        }
    },

    initData: function (page, rows) {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (that.data.hasMore) {
            var params = {
                apiname: 'bbs/post/list',
                newOrOld: 1,
                state: 1,
                isTop: that.data.isTop,
                customerSeq: that.data.customerInfo.customerSeq,
                page: page||that.data.start,
                rows: rows||that.data.count,
                orderBy: 5,  //5 审核时间排序
                sort: 2,  //1 正序 2 倒序
            }
            that.setData({
                showLoading: true,
            });
            request.getData(params, function (res) {
                var test = res.data;
                if (typeof test == 'string') {
                    console.log(JSON.parse(test))
                }
                if (res.data.state == 1) {
                    var serverTime = util.getServerTime();//获取服务器时间
                    if (res.data.data.dataList.length > 0) {
                        for (var i = 0; i < res.data.data.dataList.length; i++) {
                            res.data.data.dataList[i].auditTime = util.changeTime(util.toDate(res.data.data.dataList[i].auditTime, 7));
                        }
                    }
                    if (params.page == 1) {//只有初始化时时 需要重置
                        that.setData({
                            shareList: res.data.data.dataList,
                            serverTime: serverTime,
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
                                shareList: that.data.shareList.concat(res.data.data.dataList),
                                serverTime: serverTime,
                            })
                        }
                        that.setData({
                            //每次查询之后 将页码+1
                            start: page ? that.data.start : that.data.start + 1,
                            showLoading: false
                        })
                    }
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

    initHisData: function (page,rows) {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (that.data.hasMoreHis) {
            var params = {
                apiname: 'bbs/post/list',
                newOrOld: 2,
                state: 1,
                customerSeq: that.data.customerInfo.customerSeq,
                orderBy: 2, //2 结束时间排序
                sort: 2, //1 正序 2 倒序
                page: page||that.data.startHis,
                rows: rows||that.data.countHis
            }
            that.setData({
                showLoading: true,
            });
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    if (res.data.data.dataList.length > 0) {
                        for (var i = 0; i < res.data.data.dataList.length; i++) {
                            res.data.data.dataList[i].auditTime = util.changeTime(util.toDate(res.data.data.dataList[i].auditTime, 7));
                            res.data.data.dataList[i].endTime = util.toDate(res.data.data.dataList[i].endTime, 2);
                        }
                    }
                    if (params.page == 1) {//只有初始化时时 需要重置
                        that.setData({
                            shareHisList: res.data.data.dataList,
                            nullTip: {
                                tipText: '暂无相关帖子哦'
                            }
                        });
                    }
                    if (!res.data.data.dataList) {
                        that.setData({
                            hasMoreHis: false
                        })
                    } else {
                        if (res.data.data.dataList.length < params.rows) {
                            that.setData({
                                hasMoreHis: false
                            })
                        }
                        if (params.page!= 1) {
                            that.setData({
                                shareHisList: that.data.shareHisList.concat(res.data.data.dataList)
                            })
                        }
                        that.setData({
                            //每次查询之后 将页码+1
                            startHis: page ? that.data.startHis : that.data.stratHis + 1,
                            showLoading: false
                        })
                    }
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
        if (e.currentTarget.id == 1 && !this.data.shareHisList) {
            this.setData({showLoading:true});
            this.initHisData();
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
                    var nowCount = 10 * (that.data.startHis - 1);
                    that.setData({
                        hasMoreHis: true,
                        isTop: 0,
                    })
                    that.initHisData(1, nowCount);
                }
            } else {
                app.showToastMsg(-1, res.data.message);
            }
        })
    },
    goPublish: function () {
        var that = this;
        if (!app.checkLogin()) return;//校验登录
        wx.navigateTo({
            url: '/pages/share-publish/share-publish',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    //点赞
    clickCall:function(e){
        if (!app.checkLogin()) return;//校验登录
        var _this = this;
        var pid = e.currentTarget.dataset.pid
        var activeTab = _this.data.activeIndex;
        var params = {
            apiname: "bbs/post/insertPostPraise",
            uid: _this.data.customerInfo.customerSeq,
            pid: pid
        };
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                app.showToastMsg(0, '点赞成功');
                if (activeTab == 1){
                    var nowCount = 10 * (_this.data.startHis - 1);
                    _this.setData({
                        hasMoreHis: true,
                    })
                    _this.initHisData(1, nowCount);
                }else{
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
    openGiveReward:function(e){
        if (!app.checkLogin()) return;//校验登录
        var data = e.currentTarget.dataset.data;
        this.setData({
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