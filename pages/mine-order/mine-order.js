// order-all.jsvar app = getApp()
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    /**
     * 页面的初始数据
     */
    data: {
        tabs: ["待付款", "待收货", "已完成"],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        sliderWidth: 90,
        imgUrl: app.globalData.imagePath,

        customerInfo: {},
        unpayList: [],
        ungetOrderList: [],
        completeOrderList: [],
        unpayHasMore: true,
        ungetHasMore: true,
        completeHasMore: true,
        showLoading: true,
        count: 10, //一页展示多少行
        nullTip: {
            tipText: '数据加载中...'
        },
        //待付款参数
        chooseAll: false,
        unpayStart: 1,//从第几页开始
        chooseOne: [],
        total: 0,
        btnDisabled: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var sliderWidth = that.data.sliderWidth;
        if (options && options.type == 1) {
            that.setData({
                activeIndex: 1,
            })
        }
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
                    windowWidth: res.windowWidth,
                });
            }
        });
    },

    onShow: function () {
        //更新数据
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            chooseAll: false,
            total: 0,
        })
        this.initData()
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.setData({
            showLoading: true,
            nullTip: {
                tipText: '数据加载中...'
            }
        })
        this.initData()
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
        var type = parseInt(that.data.activeIndex);
        if(type==0){
            if (that.data.unpayHasMore) {
                var params = {
                    apiname: 'person/findSnapshot',
                    customerSeq: that.data.customerInfo.customerSeq,
                    states: 0,
                    page: that.data.unpayStart,
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
                        if (that.data.unpayStart == 1) {//只有初始化时时 需要重置
                            var chooseOne = [];
                            if (data.dataList) {
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
                    } else {
                        that.setData({
                            nullTip: {
                                tipText: '数据加载失败'
                            }
                        })
                    }
                }, that)
            }
        }else if(type==1){
            if (that.data.ungetHasMore) {
                var params = {
                    apiname: 'person/findSnapshot',
                    customerSeq: that.data.customerInfo.customerSeq,
                    states: "1_2",
                    page: 1,
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
                        that.setData({
                            ungetOrderList: data.dataList,
                            nullTip: {
                                tipText: '没有相关订单哦'
                            },
                            showLoading: false,
                        });
                    } else {
                        that.setData({
                            nullTip: {
                                tipText: '数据加载失败',
                            },
                            showLoading: false
                        })
                    }
                }, that)
            }
        } else if (type == 2) {
            if (that.data.completeHasMore) {
                var params = {
                    apiname: 'person/findSnapshot',
                    customerSeq: that.data.customerInfo.customerSeq,
                    states: "3",
                    page: 1,
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
                        that.setData({
                            completeOrderList: data.dataList,
                            nullTip: {
                                tipText: '没有相关订单哦'
                            },
                            showLoading: false,
                        });
                    } else {
                        that.setData({
                            nullTip: {
                                tipText: '数据加载失败',
                            },
                            showLoading: false
                        })
                    }
                }, that)
            }
        }
    },

    //去付款
    gotoPay: function (e) {
        var that = this;
        var urlAdd = '';
        var id = e.target.id;
        var orderList = that.data.ungetOrderList;
        for (var i = 0; i < ungetOrderList[id].lists.length; i++) {
            if (i == 0) {
                urlAdd += ungetOrderList[id].lists[i].auctionSessionSeq;
            } else {
                urlAdd += "," + ungetOrderList[id].lists[i].auctionSessionSeq;
            }
        }
        wx.navigateTo({
            url: '/pages/order-submit/order-submit?payId=' + urlAdd,
        })
    },

    //确认收货
    getGoods: function (e) {
        var that = this;
        wx.showModal({
            title: '确认已收到货物吗？',
            content: '请在收到货物后，再确认收货，否则您可能钱货两空！',
            success: function (res) {
                if (res.confirm) {
                    var id = e.target.id
                    var params = {
                        apiname: 'person/validateOrder/' + id,
                    }
                    request.getData(params, function (res) {
                        if (res.data.state === 1) {
                            that.setData({
                                hasMore: true,
                                showLoading: true,
                                ungetStart: 1,//从第几页开始
                                nullTip: {
                                    tipText: '数据加载中...'
                                }
                            })
                            that.initData()
                            app.showToastMsg(0, '操作成功')
                        } else {
                            app.showToastMsg(-1, res.data.message)
                        }
                    }, that)
                } else if (res.cancel) { }
            }
        })
    },

    //删除订单
    deleteOrder: function (e) {
        var that = this;
        wx.showModal({
            title: '确定要删除订单吗？',
            success: function (res) {
                if (res.confirm) {
                    var id = e.target.id
                    var params = {
                        apiname: 'person/delJpOrder/' + id,
                    }
                    request.getData(params, function (res) {
                        if (res.data.state === 1) {
                            that.setData({
                                hasMore: true,
                                showLoading: true,
                                ungetStart: 1,//从第几页开始
                                nullTip: {
                                    tipText: '数据加载中...'
                                }
                            })
                            that.initData()
                            app.showToastMsg(0, '操作成功')
                        } else {
                            app.showToastMsg(-1, res.data.message)
                        }
                    }, that)
                } else if (res.cancel) {}
            }
        })
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
    chooseOneOrder: function (e) {
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
        if (that.data.showLoading) return;
        message.hide.call(that);
        var unpayList = this.data.unpayList;
        var chooseList = this.data.chooseOne;
        var total = this.data.total;
        var urlAdd = '';
        var first = true;
        if (!chooseList) return;
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
            that.setData({
                showLoading: true,
            })
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
    },

    //tab 切换
    tabClick: function (e) {
        if (e.currentTarget.id != this.data.activeIndex) {
            this.setData({
                sliderOffset: e.currentTarget.offsetLeft,
                activeIndex: e.currentTarget.id,
                showLoading: true,
            });
            this.initData();
        }
    },

    //违约订单
    goCancelOrder:function(){
        wx.navigateTo({
            url: '/pages/mine-order-cancel/mine-order-cancel',
        })
    }
})