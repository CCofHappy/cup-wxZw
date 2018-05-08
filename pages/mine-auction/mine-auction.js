var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    data: {
        imgUrl: app.globalData.imagePath,
        customerInfo: {},
        auctionList: {},
        hasMore: false,
        showLoading: true,
        condition: "",
        searchTrim: "",
        descOpen: "",
        priceData: {},
        callPriceOpen: "",
        oneHandOpen: "",
        callPriceInfo: {},
        oneHandPrice: true,
        start: 1,//从第几页开始
        count: 10, //一页展示多少行
        nullTip: {
            tipText: '数据加载中...'
        },
        serverTime: 0,
        countDownStart: true,
        windowWidth: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    windowWidth: res.windowWidth
                });
            }
        });
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo')
        })
        that.initData();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        var that = this
        that.setData({
            showLoading: true,
            countDownStart:false,
            nullTip: {
                tipText: '数据加载中...'
            }
        })
        that.initData()
    },

    initData: function () {
        //初始化页面
        var that = this;
        message.hide.call(that);
        var params = {
            apiname: 'person/auctionRecord',
            condition: that.data.condition,
            searchTrim: that.data.searchTrim,
            states: "2,3",
            customerSeq: that.data.customerInfo.customerSeq,
            page: that.data.start,
            rows: that.data.count
        }
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                var data = res.data.data;
                var serverTime = util.getServerTime();//获取服务器时间
                that.setData({
                    serverTime: serverTime,
                })
                that.setData({
                    auctionList: data.dataList,
                    showLoading: false,
                    nullTip: {
                        tipText: '您还没有参与竞拍'
                    }
                });
            } else {
                that.setData({
                    nullTip: {
                        tipText: '数据加载失败'
                    }
                });
            }
        }, that)
    },

    //选择排序
    openSort: function () {
        var that = this;
        wx.showActionSheet({
            itemList: ['默认排序', '按当前价格降序排序', '按当前价格升序排序', '已出局优先排序', '未出局优先排序'],
            success: function (res) {
                if (res.tapIndex != undefined) {
                    var num = res.tapIndex;
                    if (res.tapIndex == 0) {
                        num = "";
                    }
                    that.setData({
                        condition: num
                    })
                    that.initData();
                }
            },
            fail: function (res) {
            }
        })
    },

    //搜索栏输入
    searchInput: function (e) {
        this.setData({
            searchTrim: e.detail.value,
        })
    },

    //搜索提交
    searchSubmit: function () {
        this.initData();
    },

    //判断叫价类型
    callPrice: function (data, type) {
        var that = this;
        data.apiname = 'auction/bondPayedOrNot';
        request.getData(data, function (res) {
            if (res.data.state == 1) {
                data.apiname = 'person/getHighestPrice';
                request.getData(data, function (res) {
                    if (res.data.state) {
                        var data = res.data.data;
                        if (type == 1) {//加一手出价
                            var offerPrice = parseInt(data.lastPrice) + parseInt(data.jiaJiaStep);
                            var param = {
                                customerSeq: that.data.customerInfo.customerSeq,
                                customerLogin: that.data.customerInfo.customerLogin,
                                auctionSessionSeq: data.auctionSessionSeq,
                                auctionGoodsSeq: data.auctionGoodsSeq,
                                price: offerPrice,
                                offerType: "0",
                                highestPrice: 0,
                                signNo: data.signNo
                            };
                            that.setData({
                                oneHandOpen: "open",
                                oneHandParam: param,
                            }) 
                        } else {//自由出价
                            that.openCallPrice(data);
                        }
                    }else {
                        app.showToastMsg(-1, res.data.message)
                    }
                }, that)
            } else if (res.data.state == 0) {
                wx.showModal({
                    title: '很抱歉，您还未缴纳保证金！',
                    content: '确定是否先缴纳保证金?',
                    success: function (res) {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: '/pages/pay-deposit/pay-deposit?id=' + data.auctionGoodsSeq + '&sessionId=' + data.auctionSessionSeq
                            })
                        } else if (res.cancel) { }
                    }
                })
            } else if (res.state == -2) {
                that.setData({
                    auctionDetail: {},
                    auctionTime: {},
                    auctionList: {},
                    descOpen: "",
                    hasMore: true,
                    showLoading: true,
                    start: 1,//从第几页开始
                    count: 10, //一页展示多少行
                    nullTip: {
                        tipText: '数据加载中...',
                    }
                })
                that.initData();
            }
        }, that)
    },

    //取消加一手
    oneHandCancel: function () {
        this.setData({
            oneHandOpen: "",
            oneHandParam: "",
        })
    },

    //确认加一手
    oneHandEnter: function () {
        var that = this;
        that.raisePrice(that.data.oneHandParam);
    },

    //点击自由出价按钮
    freePrice: function (e) {
        var that = this;
        var auctionList = this.data.auctionList;
        if (auctionList[e.target.id].state != 3) {
            app.showToastMsg(-1, '拍卖未开始')
            return;
        }
        var data = {
            auctionGoodsSeq: auctionList[e.target.id].auctionGoodsSeq,
            auctionSessionSeq: auctionList[e.target.id].auctionSessionSeq,
            customerSeq: that.data.customerInfo.customerSeq
        }
        if (!app.checkLogin()) return;//校验登录

        that.callPrice(data, 2);
    },

    //自由出价
    openCallPrice: function (data) {
        var that = this;
        var nowData={};
        data.jiaJiaStep = parseInt(data.jiaJiaStep);
        data.lastPrice = parseInt(data.lastPrice);
        data.highestPrice = parseInt(data.highestPrice);
        data.offerPrice = parseInt(data.lastPrice) + parseInt(data.jiaJiaStep);
        data.maxPrice = 0;
        for (var i in data) {
            nowData[i] = data[i];
        }
        that.setData({
            priceData: nowData,
            callPriceInfo: data,
            callPriceOpen: "open",
        })     
    },

    //input出价金额
    offerPriceInput: function (e) {
        var info = this.data.callPriceInfo;
        info.offerPrice = parseInt(e.detail.value);
        this.setData({
            callPriceInfo: info
        })
    },

    //+出价金额
    offerPriceAdd: function () {
        var info = this.data.callPriceInfo;
        info.offerPrice = info.offerPrice + info.jiaJiaStep;
        if (info.offerPrice > 9999999) {
            info.offerPrice = 9999999
        }
        if (info.maxPrice != 0 && info.maxPrice <= info.offerPrice) {
            info.maxPrice = info.offerPrice + info.jiaJiaStep;
        }
        if (info.maxPrice > 9999999) {
            info.maxPrice = 9999999
        }
        this.setData({
            callPriceInfo: info
        })
    },

    //-出价金额
    offerPriceReduce: function () {
        var data = this.data.priceData;
        var info = this.data.callPriceInfo;
        info.offerPrice = info.offerPrice - info.jiaJiaStep;
        if (info.offerPrice < data.offerPrice) {
            info.offerPrice = data.offerPrice
        }
        this.setData({
            callPriceInfo: info
        })
    },

    //input心理最高价
    maxPriceInput: function (e) {
        var info = this.data.callPriceInfo;
        info.maxPrice = parseInt(e.detail.value);
        if (!info.maxPrice) {
            info.maxPrice = 0;
        }
        this.setData({
            callPriceInfo: info
        })
    },

    //+心理最高价
    maxPriceAdd: function () {
        var data = this.data.priceData;
        var info = this.data.callPriceInfo;
        info.maxPrice = info.maxPrice + info.jiaJiaStep;
        if (info.maxPrice <= info.offerPrice) {
            info.maxPrice = info.offerPrice + info.jiaJiaStep;
        }
        if (info.maxPrice > 9999999) {
            info.maxPrice = 9999999
        }
        this.setData({
            callPriceInfo: info
        })
    },

    //-心理最高价
    maxPriceReduce: function () {
        var info = this.data.callPriceInfo;
        info.maxPrice = info.maxPrice - info.jiaJiaStep;
        if (info.maxPrice <= info.offerPrice) {
            info.maxPrice = 0;
        }
        this.setData({
            callPriceInfo: info
        })
    },

    //取消自由出价
    priceCancel: function () {
        this.setData({
            priceData: {},
            callPriceInfo: {},
            callPriceOpen: "",
        })
    },

    //确认自由出价
    priceEnter: function () {
        var that = this;
        var data = this.data.priceData;
        var info = this.data.callPriceInfo;
        if (info.offerPrice < data.offerPrice) {
            app.showToastMsg(-1, '出价必须比当前价高')
            return;
        }
        if ((info.offerPrice - data.qiPaiJia) % data.jiaJiaStep != 0) {
            app.showToastMsg(-1, '出价必须是加价幅度的整数倍')
            return;
        }
        if (info.maxPrice != 0 && (info.maxPrice <= info.offerPrice)) {
            app.showToastMsg(-1, '最高价必须比出价金额高一手')
            return;
        }
        if (info.maxPrice != 0 && ((info.maxPrice - data.qiPaiJia) % data.jiaJiaStep != 0)) {
            app.showToastMsg(-1, '最高价必须是加价幅度的整数倍')
            return;
        }

        var param = {
            customerSeq: that.data.customerInfo.customerSeq,
            customerLogin: that.data.customerInfo.customerLogin,
            auctionSessionSeq: that.data.callPriceInfo.auctionSessionSeq,
            auctionGoodsSeq: that.data.callPriceInfo.auctionGoodsSeq,
            price: that.data.callPriceInfo.offerPrice,
            offerType: "0",
            highestPrice: that.data.callPriceInfo.maxPrice,
            signNo: that.data.callPriceInfo.signNo
        };
        that.raisePrice(param);
    },

    //调接口出价
    raisePrice: function (param) {
        var that = this;
        param.apiname = 'auction/raisePrice';
        if (param.price > 9999999) {
            app.showToastMsg(-1, '超过出价上限')
        } else {
            request.getData(param, function (res) {
                if (res.data.state === 1) {
                    app.showToastMsg(0, res.data.data);
                    that.priceCancel();
                    that.oneHandCancel();
                    setTimeout(function () {
                        that.initData();
                    }, 500)
                } else {
                    app.showToastMsg(-1, res.data.message)
                };
            }, that)
        };
    },

    //校验操作用户是否与参与的拍品的所属客户是同一个人
    //同一个人不允许操作
    checkCustPro: function (e) {
        var that = this;
        var itemCustseq = e || ' '
        var loginCustseq = that.data.customerInfo.customerSeq
        if (loginCustseq == itemCustseq) {
            app.showToastMsg(-1, '送拍者不可叫价')
            return true
        }
        return false
    },

    //历史竞拍
    goHistory: function () {
        wx.navigateTo({
            url: '/pages/mine-auction-history/mine-auction-history',
        })
    },
})