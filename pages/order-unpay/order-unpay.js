// order-unpay.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        customerInfo: {},
        unpayList: [],
        hasMore: true,
        showLoading: true,
        chooseAll: false,
        chooseOne: [],
        total: 0,
        start: 1,//从第几页开始
        count: 10, //一页展示多少行
        btnDisabled: true,
        nullTip: {
            tipText: '数据加载中...'
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        //更新数据
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo')
        });
        wx.removeStorageSync('needInvoiceInfo');
        wx.removeStorageSync('orderSubmitList');
        wx.removeStorageSync('orderTotal');
        wx.removeStorageSync('invoiceInfo');
        wx.removeStorageSync('invoiceSeq');
        wx.removeStorageSync('addressId');
        wx.removeStorageSync('payWeibi');
        that.initData();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        var that = this
        that.setData({
            unpayList: {},
            hasMore: true,
            showLoading: true,
            start: 1,//从第几页开始
            count: 10, //一页展示多少行
            nullTip: {
                tipText: '数据加载中...'
            }
        })
        that.initData()
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

    //初始化页面
    initData: function () {
        var that = this;
        message.hide.call(that);
        if (that.data.hasMore) {
            var params = {
                apiname: 'person/findSnapshot',
                customerSeq: that.data.customerInfo.customerSeq,
                states: 0,
                page: that.data.start,
                rows: that.data.count
            }
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    var data = res.data.data;
                    if (data.dataList) {
                        for (var i = 0; i < data.dataList.length; i++) {
                            for (var k = 0; k < data.dataList[i].lists.length; k++) {
                                data.dataList[i].lists[k].createTime = util.toDate(data.dataList[i].lists[k].createTime, 2)
                            }
                        }
                    }
                    if (that.data.start == 1) {//只有初始化时时 需要重置
                        if (data.dataList) {
                            var chooseOne = [];
                            for (var i = 0; i < data.dataList.length; i++) {
                                chooseOne[i] = false;
                            }
                        }
                        that.setData({
                            unpayList: data.dataList,
                            chooseOne: chooseOne,
                            nullTip: {
                                tipText: '没有相关订单哦'
                            },
                            showLoading: false
                        });
                    }
                    if (!data.dataList) {
                        that.setData({
                            hasMore: false,
                        })
                    } else {
                        if (data.dataList.length == 0) {
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
                                var chooseOne = [];
                                for (var i = 0; i < data.dataList.length; i++) {
                                    chooseOne[i] = false;
                                }
                                that.setData({
                                    unpayList: that.data.unpayList.concat(data.dataList),
                                    chooseOne: that.data.chooseOne.concat(chooseOne)
                                })
                            }
                            that.setData({
                                //每次查询之后 将页码+1
                                start: that.data.start + 1,
                                showLoading: false
                            })
                        }
                    }
                } else {
                    that.setData({
                        nullTip: {
                            tipText: '数据加载失败'
                        }
                    })
                }
            }, that)
        }
    },

    //选择全部
    chooseAll: function (e) {
        var chooseAll = this.data.chooseAll ? false : true;
        var chooseOne = this.data.chooseOne;
        var unpayList = this.data.unpayList;
        var total = 0;
        if (unpayList) {
            for (var i = 0; i < chooseOne.length; i++) {
                chooseOne[i] = chooseAll;
            }
            if (chooseAll) {
                for (var i = 0; i < unpayList.length; i++) {
                    for (var k = 0; k < unpayList[i].lists.length; k++) {
                        total += unpayList[i].lists[k].finalPrice
                    }
                }
            }
            this.setData({
                chooseAll: chooseAll,
                chooseOne: chooseOne,
                total: total,
            })
        }
    },

    //选择一个订单
    chooseOne: function (e) {
        var index = e.target.id;
        var chooseAll = true;
        var chooseOne = this.data.chooseOne;
        var unpayList = this.data.unpayList
        var total = 0;
        chooseOne[index] = chooseOne[index] ? false : true;
        for (var i = 0; i < chooseOne.length; i++) {
            if (!chooseOne[i]) {
                chooseAll = false;
            }
        }
        for (var i = 0; i < unpayList.length; i++) {
            if (chooseOne[i]) {
                for (var k = 0; k < unpayList[i].lists.length; k++) {
                    total += unpayList[i].lists[k].finalPrice
                }
            }
        }
        this.setData({
            chooseAll: chooseAll,
            chooseOne: chooseOne,
            total: total,
        })
    },

    //提交订单
    orderSubmit: function (e) {
        var that = this;
        message.hide.call(that);
        var unpayList = this.data.unpayList;
        console.log(unpayList)
        var chooseList = this.data.chooseOne;
        var total = this.data.total;
        var urlAdd = '';
        var first = true;
        for (var i = 0; i < chooseList.length; i++) {
            if (chooseList[i]) {
                for (var k = 0; k < unpayList[i].lists.length; k++) {
                    if (first) {
                        urlAdd += unpayList[i].auctionSessionSeq;
                        first = false;
                    } else {
                        urlAdd += "," + unpayList[i].auctionSessionSeq;
                    }
                }
            }
        }
        if (total) {
            var params = {
                apiname: 'paymentCheck',
                auctionSessionStr: urlAdd,
            };
            request.getData(params, function (res) {
                if (res.data.state === 0) {
                    app.showToastMsg(-1, res.data.message)
                } else {
                    if (that.data.btnDisabled) {
                        that.setData({
                            btnDisabled: false,
                        })
                        wx.navigateTo({
                            url: '/pages/order-submit/order-submit?payId=' + urlAdd,
                        })
                    }
                }
                setTimeout(function () {
                    that.setData({
                        btnDisabled: true,
                    })
                }, 1000)
            }, that)
        } else {
            app.showToastMsg(-1, '请选择一项结算')
        }
    }
})