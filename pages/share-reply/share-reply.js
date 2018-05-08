var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    data: {
        customerInfo: {},
        replyInfo: '',
        imgUrl: app.globalData.imagePath,
        replyRid: '',
        replyUid: '',
        sendContent: '',
        showLoading: true,
        hasMore: true,
        start: 1,//从第几页开始
        count: 20, //一页展示多少行
        nullTip: {
            tipText: '数据加载中...'
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            pid: options.pid,
            rid: options.rid,
            up: options.up,
            type: options.type||1,
        })
    },
    onShow: function () {
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo')
        })
        this.initData();
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
            count: 20, //一页展示多少行
            nullTip: {
                tipText: '数据加载中...',
            }
        })
        that.initData();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (!this.data.showLoading) {
            if (this.data.count != 10) {
                var nowPage = this.data.count / 10;
                this.setData({
                    start: nowPage,//从第几页开始
                    count: 20, //一页展示多少行 
                })
            }
            this.initData()
        }
    },

    initData: function () {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (that.data.hasMore) {
            var params = {
                apiname: 'bbs/post/assess/queryPostComment',
                rid: that.data.rid,
                page: that.data.start,
                rows: that.data.count,
                type: that.data.type,
            }
            that.setData({
                showLoading: true,
            });
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    res.data.data.tm.reply_time = util.toDate(res.data.data.tm.reply_time, 7);
                    if (that.data.start == 1) {//只有初始化时时 需要重置
                        that.setData({
                            replyInfo: res.data.data,
                            nullTip: {
                                tipText: '没有相关数据哦'
                            },
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
                        if (that.data.start != 1) {
                            var replyInfo = that.data.replyInfo;
                            replyInfo.dataList = replyInfo.dataList.concat(res.data.data.dataList);
                            that.setData({
                                replyInfo: replyInfo
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
                        },
                        showLoading: false,
                    });
                }
            }, that)
        }
    },

    setReplyID: function (e) {
        var rid = e.currentTarget.dataset.rid, uid = e.currentTarget.dataset.uid, name = e.currentTarget.dataset.name;
        if (uid == this.data.customerInfo.customerSeq) return;
        this.setData({
            replyRid: rid,
            replyUid: uid,
            replyName: name,
            focus: true,
        })
    },

    clearID: function () {
        this.setData({
            replyRid: '',
            replyUid: '',
            replyName: '',
        })
    },

    sendContent: function (e) {
        this.setData({
            sendContent: e.detail.value
        })
    },

    sendMessage: function () {
        var that = this;
        if (!app.checkLogin()) return;//校验登录

        if (!that.data.sendContent.replace(/(^\s*)|(\s*$)/g, "")) {
            app.showToastMsg(-1,'请输入回复内容');
            return;
        }
        var replyRid = that.data.replyRid ? that.data.replyRid : that.data.replyInfo.tm.rid,
            replyUid = that.data.replyUid ? that.data.replyUid : that.data.replyInfo.tm.uid;
        var params = {
            apiname: 'bbs/post/insertComment',
            pid: that.data.pid,
            uid: that.data.customerInfo.customerSeq,
            ruid: replyUid,
            rid: replyRid,
            content: that.data.sendContent,
        }

        request.getData(params, function (res) {
            if (res.data.state == 1) {
                app.showToastMsg(0, '回复成功');
                var nowCount = 20 * that.data.start;
                that.setData({
                    replyRid: '',
                    replyUid: '',
                    sendContent: '',
                    start: 1,//从第几页开始
                    count: nowCount, //一页展示多少行
                    hasMore: true,
                })
                that.initData();
            } else {
                app.showToastMsg(-2, res.data.message);
                that.setData({
                    btnDisabled: "",
                })
            }
        }, that)
    }
})