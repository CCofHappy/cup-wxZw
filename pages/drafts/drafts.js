// pages/drafts/drafts.js
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
        shareList:'',
        start: 1,//从第几页开始
        hasMore: true,
        interflowList: '',
        interflowStart: 1,//从第几页开始
        interflowHasMore: true,
        commentList: '',
        commentStart: 1,//从第几页开始
        commentHasMore: true,
        count: 10, //一页展示多少行
        showLoading: true,
        nullTip: {
            tipText: '数据加载中...'
        },
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
        var _this = this;
        _this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            start: 1,//从第几页开始
            hasMore: true,
            interflowStart: 1,//从第几页开始
            interflowHasMore: true,
            commentStart: 1,//从第几页开始
            commentHasMore: true,
            nullTip: {
                tipText: '数据加载中...',
            }
        })
        if (this.data.activeIndex == 0) {
            this.initData()
        } else if (this.data.activeIndex == 1) {
            this.initInterflow()
        } else {
            this.initComment()
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
                nullTip: {
                    tipText: '数据加载中...',
                }
            })
            this.initData()
        } else if (this.data.activeIndex == 1) {
            this.setData({
                interflowHasMore: true,
                interflowStart: 1,//从第几页开始
                nullTip: {
                    tipText: '数据加载中...',
                }
            })
            this.initInterflow()
        } else {
            this.setData({
                commentHasMore: true,
                commentStart: 1,//从第几页开始
                nullTip: {
                    tipText: '数据加载中...',
                }
            })
            this.initComment()
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.showLoading) return;
        if (this.data.activeIndex == 0) {
            this.setData({
                nullTip: {
                    tipText: '数据加载中...',
                }
            })
            this.initData()
        } else if (this.data.activeIndex == 1) {
            this.setData({
                nullTip: {
                    tipText: '数据加载中...',
                }
            })
            this.initInterflow()
        } else {
            this.setData({
                nullTip: {
                    tipText: '数据加载中...',
                }
            })
            this.initComment()
        }
    },

    initData: function () {
        //初始化页面
        var that = this;
        if (that.data.hasMore) {
            this.setData({ showLoading: true });
            var params = {
                apiname: 'bbs/post/assess/queryPostDraft',
                uid: that.data.customerInfo.customerSeq,
                page: that.data.start,
                rows: that.data.count,
                type: 1,
            }
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    var dataList = res.data.data.dataList;
                    if (dataList.length > 0) {
                        for (var i = 0; i < dataList.length; i++) {
                            dataList[i].create_time = util.changeTime(util.toDate(dataList[i].create_time, 1));
                        }
                    }
                    if (params.page == 1) {//只有初始化时时 需要重置
                        that.setData({
                            shareList: dataList
                        });
                    } 
                    if (dataList.length<1) {
                        that.setData({
                            hasMore: false,
                            showLoading: false,
                            nullTip: {
                                tipText: '暂无草稿'
                            }
                        })
                    } else {
                        if (dataList.length < params.rows) {
                            that.setData({
                                hasMore: false
                            })
                        }
                        if (params.page != 1) {
                            that.setData({
                                shareList: that.data.shareList.concat(dataList),
                            })
                        }
                        that.setData({
                            //每次查询之后 将页码+1
                            start: params.page + 1,
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

    initInterflow: function () {
        //初始化页面
        var that = this;
        if (that.data.interflowHasMore) {
            this.setData({ showLoading: true });
            var params = {
                apiname: 'bbs/post/assess/queryPostDraft',
                uid: that.data.customerInfo.customerSeq,
                page: that.data.interflowStart,
                rows: that.data.count,
                type: 3,
            }
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    var dataList = res.data.data.dataList;
                    if (dataList.length > 0) {
                        for (var i = 0; i < dataList.length; i++) {
                            dataList[i].create_time = util.changeTime(util.toDate(dataList[i].create_time, 1));
                        }
                    }
                    if (params.page == 1) {//只有初始化时时 需要重置
                        that.setData({
                            interflowList: dataList,
                        });
                    }
                    if (dataList.length < 1) {
                        that.setData({
                            interflowHasMore: false,
                            showLoading: false,
                            nullTip: {
                                tipText: '暂无草稿'
                            }
                        })
                    } else {
                        if (dataList.length < params.rows) {
                            that.setData({
                                interflowHasMore: false
                            })
                        }
                        if (params.page != 1) {
                            that.setData({
                                interflowList: that.data.interflowList.concat(dataList),
                            })
                        }
                        that.setData({
                            //每次查询之后 将页码+1
                            interflowStart: params.page + 1,
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

    initComment: function () {
        //初始化页面
        var that = this;
        if (that.data.commentHasMore) {
            this.setData({ showLoading: true });
            var params = {
                apiname: 'bbs/post/assess/queryPostDraft',
                uid: that.data.customerInfo.customerSeq,
                page: that.data.commentStart,
                rows: that.data.count,
                type: 2,
            }
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    var dataList = res.data.data.dataList;
                    if (dataList.length > 0) {
                        for (var i = 0; i < dataList.length; i++) {
                            dataList[i].create_time = util.changeTime(util.toDate(dataList[i].create_time, 1));
                        }
                    }
                    if (params.page == 1) {//只有初始化时时 需要重置
                        that.setData({
                            commentList: dataList,
                        });
                    }
                    if (dataList.length < 1) {
                        that.setData({
                            commentHasMore: false,
                            showLoading: false,
                            nullTip: {
                                tipText: '暂无草稿'
                            }
                        })
                    } else {
                        if (dataList.length < params.rows) {
                            that.setData({
                                commentHasMore: false
                            })
                        }
                        if (params.page != 1) {
                            that.setData({
                                commentList: that.data.commentList.concat(dataList),
                            })
                        }
                        that.setData({
                            //每次查询之后 将页码+1
                            commentStart: params.page + 1,
                            showLoading: false
                        })
                    }
                } else {
                    app.showToastMsg(-1, res.data.message);
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
            activeIndex: e.currentTarget.id
        });
        if (e.currentTarget.id == 1 && !this.data.interflowList) {
            this.initInterflow();
        } else if (e.currentTarget.id == 2 && !this.data.commentList) {
            this.initComment();
        }
    },

    delDrafts:function(e){
        var id = e.currentTarget.dataset.id;
        var that = this;
        var params = {
            apiname: 'bbs/post/assess/deletePostDraft/' + id,
        }
        request.getData(params, function (res) {
            if(res.data.state==1){
                app.showToastMsg(0, '删除成功');
                that.onPullDownRefresh();
            }else{
                app.showToastMsg(-1, res.data.message);
            }

        })
    }
})