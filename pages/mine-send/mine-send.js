// mine-send.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    data: {
        customerInfo: {},
        sendList: {},
        outlineList: [],
        hasMore: true,
        showLoading: true,
        start: 1,//从第几页开始
        count: 10, //一页展示多少行
        bottomLine: "",
        ifChecked: true,
        openAgreeBox: false,
        agreeList: [],
        nullTip: {
            tipText: '数据加载中...'
        }
    },

    onLoad: function (options) {
        //更新数据
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo')
        })
        if (!this.data.customerInfo.customerSeq) {
            wx.navigateTo({
                url: '/pages/login/login',
            })
        }
    },
    onShow: function () {
        //更新数据
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            nullTip: {
                tipText: '数据加载中...'
            }
        })
        this.initData();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        var that = this;
        var bottomLine = that.data.bottomLine;
        if (bottomLine == 'right') {
            that.setData({
                showLoading: true,
            })
            that.initOutline();
        } else {
            that.setData({
                sendList: {},
                hasMore: true,
                showLoading: true,
                start: 1,//从第几页开始
                count: 10, //一页展示多少行
                nullTip: {
                    tipText: '数据加载中...'
                }
            })
            that.initData();
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this;
        if (!that.data.showLoading) {
            that.initData();
        }
    },

    initData: function () {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (!that.data.customerInfo.customerSeq) {
            that.setData({
                nullTip: {
                    tipText: '数据加载失败',
                },
                showLoading: false
            });
            return;
        }
        if (that.data.hasMore) {
            var params = {
                apiname: 'person/querySendAuction',
                customerSeq: that.data.customerInfo.customerSeq,
                page: that.data.start,
                rows: that.data.count
            }
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    var data = res.data.data;
                    for (var i = 0; i < data.dataList.length; i++) {
                        data.dataList[i].sendTime = util.toDate(data.dataList[i].sendTime, 1)
                        data.dataList[i].showTime = util.toDate(data.dataList[i].showTime, 1)
                        data.dataList[i].startTime = util.toDate(data.dataList[i].startTime, 1)
                        data.dataList[i].endTime = util.toDate(data.dataList[i].endTime, 1)
                    }
                    if (that.data.start == 1) {//只有初始化时时 需要重置
                        that.setData({
                            sendList: data.dataList,
                            nullTip: {
                                tipText: '没有送拍记录哦'
                            }
                        });
                    }
                    if (data.dataList.length === 0) {
                        that.setData({
                            hasMore: false,
                            showLoading: false,
                        })
                    } else {
                        if (data.dataList.length < params.rows) {
                            that.setData({
                                hasMore: false
                            })
                        }
                        if (that.data.start != 1) {
                            that.setData({
                                sendList: that.data.sendList.concat(data.dataList),
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
                            tipText: '数据加载失败'
                        },
                        showLoading: false
                    })
                }
            }, that)
        }
    },

    initOutline: function () {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (!that.data.customerInfo.customerSeq) {
            that.setData({
                nullTip: {
                    tipText: '数据加载失败',
                },
                showLoading: false
            });
            return;
        }
        var params = {
            apiname: 'person/queryAuctionGoodsSend',
            customerSeq: that.data.customerInfo.customerSeq,
        }
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                var data = res.data.data;
                for (var i = 0; i < data.length; i++) {
                    data[i].batch.sendTime = util.toDate(data[i].batch.sendTime, 2)
                }
                that.setData({
                    outlineList: data,
                    showLoading: false,
                    nullTip: {
                        tipText: '没有送拍记录哦'
                    }
                });
            } else {
                that.setData({
                    nullTip: {
                        tipText: '数据加载失败'
                    },
                    showLoading: false
                })
            }
        }, that)
    },

    chooseBar: function () {
        var bottomLine = this.data.bottomLine ? '' : 'right';
        if (bottomLine == 'right' && this.data.outlineList.length == 0) {
            this.setData({
                showLoading: true,
            })
            this.initOutline();
        }
        this.setData({
            bottomLine: bottomLine
        })
    },

    agreenBtn: function (e) {
        var id = e.target.id;
        var outlineList = this.data.outlineList;
        var agreeList = [];
        for (var i = 0; i < outlineList[id].list.length; i++) {
            agreeList.push(outlineList[id].list[i].auctionGoodsSendSeq)
        }
        this.setData({
            openAgreeBox: true,
            agreeList: agreeList,
            ifChecked:true,
        })
    },

    closeAgreeBox: function () {
        this.setData({
            openAgreeBox: false,
            agreeList: [],
        })
    },

    //最后确认上拍
    setAgree: function () {
        var that = this;
        var params = {
            apiname: "person/confirmAuctionGoodsSend",
            auctionGoodsSendEOs: that.data.agreeList,
        }
        if (that.data.agreeList.length > 0) {
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    app.showToastMsg(0,'确认成功')
                    that.initOutline();
                } else {
                    app.showToastMsg(-1, res.data.message)
                }
                that.setData({
                    openAgreeBox: false,
                    agreeList: [],
                })
            })
        } 
    },
    //是否同意复选框 勾选事件
    checkboxChange: function(e){
        var val = e.detail.value;
        var flg = false;
        if(!val.length){
            flg = false
        }else{
            flg = true
        }
        this.setData({
            ifChecked: flg
        })
    }
})