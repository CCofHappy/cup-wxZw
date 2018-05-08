// pages/interflow-detail/interflow-detail.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    data: {
        imgUrl: app.globalData.imagePath,
        focus: false,
        bbsInfo: '',
        pid: '',
        uid: '',
        sendContent: '',
        replyRid: '',
        replyUid: '',
        replyName: '',
        interflowType: '',
        showLoading: true,
        hasMore: true,
        start: 1,//从第几页开始
        count: 10, //一页展示多少行
        nullTip: {
            tipText: '数据加载中...'
        },
        giveRewardOpen: false,
        payAfter: false,
        payAfterPrice: 0,
        postImgList: [],
        openImgBox: false,
    },

    onLoad: function (options) {
        this.setData({
            pid: options.pid,
            uid: options.uid,
            interflowType: options.interflowType ? options.interflowType:'',
        });
    },
    onShow: function () {
        var _this = this;
        _this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            showLoading: true,
            hasMore: true,
            start: 1,//从第几页开始
            count: 10, //一页展示多少行
            nullTip: {
                tipText: '数据加载中...',
            }
        })
        setTimeout(function () {//做了0.5毫秒的延时
            _this.refreshPrePage();
        }, 500);
        _this.initData();
    },

    //刷新上一个页面
    refreshPrePage: function () {
        //获取页面栈
        var pages = getCurrentPages();
        if (pages.length > 1) {
            //上一个页面实例对象
            var prePage = pages[pages.length - 2];
            if (prePage.data.activeIndex == 0) {
                prePage.setData({
                    start: prePage.data.start == 2 ? prePage.data.start - 1 : prePage.data.start
                });
            } else if (prePage.data.activeIndex == 1) {
                prePage.setData({
                    startCom: prePage.data.startCom == 2 ? prePage.data.startCom - 1 : prePage.data.startCom
                });
            }
            prePage.onShow();
        }
    },

    /**
     * 转发页面
     */
    onShareAppMessage: function (res) {
        var that = this;
        var title = that.data.bbsInfo.title;
        return {
            title: title,
            path: '/pages/share-detail/share-detail?pid=' + that.data.pid + '&uid=' + that.data.uid,
            success: function (res) { },
            fail: function (res) { }
        }
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
                    count: 10, //一页展示多少行 
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
                apiname: 'bbs/post/assess/postDetail',
                pid: that.data.pid,
                uid: that.data.uid,
                customerSeq: that.data.customerInfo.customerSeq,
                page: that.data.start,
                rows: that.data.count,
                type: that.data.interflowType,
            }
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    var serverTime = util.getServerTime();//获取服务器时间
                    that.setData({
                        serverTime: serverTime,
                    })
                    if (res.data.data) {
                        res.data.data.createTime = util.changeTime(util.toDate(res.data.data.createTime, 7));
                        res.data.data.content = res.data.data.content.replace(/\n/g, '<br>');
                        res.data.data.content = res.data.data.content.replace(/\s/g, '&nbsp;');
                        if (res.data.data.replyList) {
                            for (var i = 0; i < res.data.data.replyList.length; i++) {
                                res.data.data.replyList[i].reply_time = util.toDate(res.data.data.replyList[i].reply_time, 7)
                            }
                        }
                    }
                    if (that.data.start == 1) {//只有初始化时时 需要重置
                        that.setData({
                            bbsInfo: res.data.data,
                            nullTip: {
                                tipText: '没有相关数据哦'
                            },
                        });
                    }
                    if (!res.data.data.replyList) {
                        that.setData({
                            hasMore: false
                        })
                    } else {
                        if (res.data.data.replyList.length < params.rows) {
                            that.setData({
                                hasMore: false
                            })
                        }
                        if (that.data.start != 1) {
                            var bbsInfo = that.data.bbsInfo;
                            bbsInfo.replyList = bbsInfo.replyList.concat(res.data.data.replyList);
                            that.setData({
                                bbsInfo: bbsInfo
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
        var rewardParams = {
            apiname: 'bbs/post/assess/queryPostReward',
            pid: that.data.pid,
            type: that.data.interflowType,
        }
        request.getData(rewardParams, function (res) {
            if (res.data.state == 1) {
                that.setData({
                    rewardList: res.data.data,
                })
            } else {
            }
        }, that)
    },

    sendContent: function (e) {
        this.setData({
            sendContent: e.detail.value
        })
    },

    //评论及回复
    sendMessage: function () {
        var that = this;
        if (!app.checkLogin()) return;//校验登录

        var replyRid = that.data.replyRid, replyUid = that.data.replyUid;
        var params = {};
        var sendContent = that.data.sendContent.replace(/(^\s*)|(\s*$)/g, "");
        if (!sendContent) {
            app.showToastMsg(-1, '请输入回复内容');
            return;
        }
        if (replyRid && replyUid) {
            params = {
                apiname: 'bbs/post/assess/insertComment',
                pid: that.data.pid,
                uid: that.data.customerInfo.customerSeq,
                ruid: replyUid,
                rid: replyRid,
                type: that.data.interflowType,
                content: sendContent,
            }
        } else {
            params = {
                apiname: 'bbs/post/assess/insertReply',
                pid: that.data.pid,
                uid: that.data.customerInfo.customerSeq,
                uname: that.data.bbsInfo.name,
                content: sendContent,
                followUid: that.data.uid,
                type: that.data.interflowType,
                postImg: that.data.postImgList,
            }
        }
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                app.showToastMsg(0, '回复成功');
                var nowCount = 10 * that.data.start;
                that.setData({
                    replyRid: '',
                    replyUid: '',
                    sendContent: '',
                    postImgList: [],
                    openImgBox: false,
                    start: 1,//从第几页开始
                    count: nowCount, //一页展示多少行
                    hasMore: true,
                })
                that.initData();
            } else {
                app.showToastMsg(-2, res.data.message);
            }
        }, that)
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

    aboutFollow: function (e) {
        var that = this;
        if (!app.checkLogin()) return;//校验登录

        var params = {
            apiname: "bbs/post/follow",
            uid: that.data.customerInfo.customerSeq,
            followUid: that.data.uid,
        },
            title = "关注成功";
        if (e.currentTarget.dataset.cancel) {
            params.apiname = "bbs/post/cancelFollow";
            title = "取消关注成功";
        }
        request.getData(params, function (res) {
            app.showToastMsg(0, title);
            that.setData({
                start: 1,//从第几页开始
                count: 10, //一页展示多少行,
                showLoading: true,
                hasMore: true,
            })
            that.initData();
        })
    },

    deletePost: function () {
        var that = this;
        wx.showModal({
            content: '确定要删除帖子？',
            success: function (res) {
                if (res.confirm) {
                    var params = {
                        apiname: "bbs/post/deletePost",
                        pid: that.data.pid,
                    }
                    request.getData(params, function (res) {
                        if (res.data.state == 1) {
                            app.showToastMsg(0, '删除成功');
                        }
                        setTimeout(function () {
                            wx.navigateBack({
                                delta: 1,
                            })
                        }, 1000)
                    })
                } else if (res.cancel) { }
            }
        })
    },

    expressEnter: function () {
        var that = this;
        var expressName = this.data.expressName,
            expressCode = this.data.expressCode,
            expressNum = this.data.expressNum;
        if (!expressNum) {
            app.showToastMsg(-1, '请输入物流单号');
            return;
        }
        if (!expressCode) {
            expressName = '';
        }
        message.hide.call(that);
        var params = {
            apiname: 'bbs/post/orderDeliver',
            expressNumber: expressNum,
            express: expressName,
            orderNo: that.data.orderNo
        }
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                app.showToastMsg(0, '操作成功');
                that.setData({
                    openExpress: false,
                    expressName: '',
                    expressCode: '',
                    expressNum: '',
                    hasMore: true,
                    showLoading: true,
                    start: 1,//从第几页开始
                    count: 10, //一页展示多少行
                    nullTip: {
                        tipText: '数据加载中...',
                    }
                })
                that.initData();
            } else {
                app.showToastMsg(-1, res.data.message);
            }
        }, that)
    },

    openGiveReward: function () {
        if (!app.checkLogin()) return;//校验登录
        this.setData({
            giveRewardOpen: true,
        })
    },

    //上传图片
    uploadImg: function () {
        var that = this;
        var count = 3 - that.data.postImgList.length;
        wx.chooseImage({
            count: count, // 一次选择数量
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                var lock = 1;
                that.setData({
                    showLoading: true,
                })
                for (var i = 0; i < tempFilePaths.length; i++) {
                    wx.uploadFile({
                        url: app.globalData.apiPath + '/common/attachment/upload',
                        filePath: tempFilePaths[i],
                        name: 'myfile',
                        success: function (res) {
                            if (res.statusCode == 200) {
                                var resData = JSON.parse(res.data);
                                var imgList = that.data.postImgList;
                                imgList.push(resData.data);
                                that.setData({
                                    postImgList: imgList
                                })
                            } else {
                                app.showToastMsg(-1, '图片获取失败')
                            }
                        },
                        fail: function () {
                            app.showToastMsg(-1, '上传失败')
                        },
                        complete: function () {
                            if (lock == tempFilePaths.length) {
                                that.setData({
                                    showLoading: false,
                                })
                            }
                            lock++
                        }
                    })
                }
            }
        })
    },

    //打开上传图片框
    openImgBox: function () {
        this.setData({
            openImgBox: true,
        })
    },

    //关闭上传图片框
    closeImgBox: function () {
        this.setData({
            openImgBox: false,
        })
    },

    //删除图片
    deleteBtn: function (e) {
        var that = this;
        wx.showModal({
            content: '确定要删除图片吗？',
            confirmText: '确定',
            cancelText: '取消',
            success: function (res) {
                if (res.confirm) {
                    var imgList = that.data.postImgList;
                    var num = parseInt(e.currentTarget.id);
                    imgList.splice(num, 1);
                    that.setData({
                        postImgList: imgList,
                    })
                } else if (res.cancel) { }
            }
        })
    },

    jumpWineDetail: function(e){
        var id = e.currentTarget.dataset.id;
        if (id&&id>0){
            var wineDetail = this.data.bbsInfo.product[0];
            wineDetail.totalScore = this.data.bbsInfo.totalScore;
            wx.setStorageSync('interflowWine', this.data.bbsInfo.product[0])
            wx.navigateTo({
                url: '/pages/wine-detail/wine-detail?id='+id,
            })
        }
    }
   
})