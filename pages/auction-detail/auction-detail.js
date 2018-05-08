1// auction-detail.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.globalData.imagePath,
        customerInfo: {},
        auctionDetail: {},
        auctionTime: '',
        auctionList: {},
        auctionSessionSeq: '',
        descOpen: "",
        priceData: {},
        callPriceOpen: "",
        oneHandOpen:"",
        callPriceInfo: {},
        hasMore: true,
        showLoading: true,
        oneHandPrice: true,
        booked: false,//是否已预约
        start: 1,//从第几页开始
        count: 10, //一页展示多少行
        nullTip: {
            tipText: '数据加载中...'
        },
        serverTime:0,
        setIntervalTime: "",
        countDownStart:true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //更新数据
        this.setData({
            auctionSessionSeq: options.id,
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        //更新数据
        var rows = this.data.start * this.data.count;
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
        })
        this.initData(1, rows);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        var that = this;
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
    },

    onUnload: function () {
        // 生命周期函数--监听页面卸载
        clearInterval(this.data.setIntervalTime);
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

    /**
    * 转发页面
    */
    onShareAppMessage: function (res) {
        var that = this;
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: that.data.auctionDetail.auctionSessionName,
            path: '/pages/auction-detail/auction-detail?id=' + that.data.auctionDetail.auctionSessionSeq,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },

    //初始化页面
    initData: function (page, rows) {
        var that = this
        message.hide.call(that);
        var param = {
            apiname: 'auction/auctionShow',
            customerSeq: that.data.customerInfo.customerSeq,
            auctionSessionSeq: that.data.auctionSessionSeq,
            page: page ? page : that.data.start,
            rows: rows ? rows : that.data.count,
            term: 0
        }
        request.getData(param, function (res) {
            if (res.data.state == 1) {
                var data = res.data.data;
                that.setData({
                    auctionDetail: data.session,
                });
                var serverTime = util.getServerTime();//获取服务器时间
                that.setData({
                    serverTime: serverTime,
                })
                var countTime=0;
                if (data.session.state == 2) {
                    countTime = data.session.auctionSessionStart - serverTime;
                } else if (data.session.state == 3) {
                    countTime = data.session.auctionSessionEnd - serverTime;
                }
                
                //清除之前的倒计时
                if (that.data.setIntervalTime) {
                    clearInterval(that.data.setIntervalTime);
                }
                if (countTime > 0){
                    var countTimeObj = util.countDown(countTime);
                    that.setData({
                        auctionTime: countTimeObj,
                    })
                    var setIntervalTime = setInterval(function () {
                        if (countTime < 0) {
                            that.setData({
                                auctionTime: '',
                            })
                            clearInterval(that.data.setIntervalTime);
                            setTimeout(function () {
                                that.onPullDownRefresh();
                            }, 2000)
                        } else {
                            countTime = countTime - 1000;
                            countTimeObj = util.countDown(countTime)
                            that.setData({
                                auctionTime: countTimeObj,
                            })
                        }
                    }, 1000)
                    that.setData({
                        setIntervalTime: setIntervalTime,
                    })
                }else{
                    that.setData({
                        auctionTime: '',
                    })
                }
                if (param.page == 1) {//只有初始化时时 需要重置
                    that.setData({
                        auctionList: data.showAuction.dataList,
                        nullTip: {
                            tipText: '没有相关数据'
                        }
                    });
                }
                if (data.showAuction.dataList.length === 0) {
                    that.setData({
                        hasMore: false,
                    })
                } else {
                    if (data.showAuction.dataList.length < param.rows) {
                        that.setData({
                            hasMore: false,
                        })
                    }
                    if (param.page != 1) {
                        that.setData({
                            auctionList: that.data.auctionList.concat(data.showAuction.dataList),
                        })
                    }
                    that.setData({
                        //每次查询之后 将页码+1
                        start: that.data.start + 1,
                    })
                }
                that.setData({
                    showLoading: false
                })
            } else {
                that.setData({
                    nullTip: {
                        tipText: '没有相关数据'
                    }
                });
                app.showToastMsg(-1,'数据加载失败')
            }
        }, that)
    },

    // 展开/收起拍场描述
    descOpen: function () {
        if (this.data.descOpen == "open") {
            this.setData({
                descOpen: ""
            })
        } else {
            this.setData({
                descOpen: "open"
            })
        }
    },

    //判断叫价类型
    callPrice: function (data,type) {
        var that = this;
        data.apiname = 'auction/bondPayedOrNot';
        request.getData(data, function (res) {
            if (res.data.state == 1) {
                data.apiname = 'person/getHighestPrice';
                request.getData(data, function (res) {
                    if (res.data.state) {
                        var resData = res.data.data;
                        if (type == 1) {//加一手出价
                            var offerPrice = parseInt(resData.lastPrice) + parseInt(resData.jiaJiaStep);
                            var param = {
                                customerSeq: that.data.customerInfo.customerSeq,
                                customerLogin: that.data.customerInfo.customerLogin,
                                auctionSessionSeq: resData.auctionSessionSeq,
                                auctionGoodsSeq: resData.auctionGoodsSeq,
                                price: offerPrice,
                                offerType: "0",
                                highestPrice: 0,
                                signNo: resData.signNo
                            };
                            that.setData({
                                oneHandOpen: "open",
                                oneHandParam: param,
                            }) 
                        } else {//自由出价
                            that.openCallPrice(resData);
                        }
                    }
                    else {
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
                    auctionTime: "",
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

    //自由出价
    openCallPrice: function (data) {
        var that = this;
        var nowData = {};
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

    //校验操作用户是否与参与的拍品的所属客户是同一个人
    //同一个人不允许操作
    checkCustPro: function(e){
        var that = this;
        var itemCustseq = e || ' '
        var loginCustseq = that.data.customerInfo.customerSeq
        if (loginCustseq == itemCustseq) {
            app.showToastMsg(-1, '送拍者不可叫价')
            return true
        }
        return false
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

    //取消加一手
    oneHandCancel: function () {
        this.setData({
            oneHandOpen: "",
            oneHandParam: "",
        })
    },

    //确认自由出价
    priceEnter: function () {
        var that = this;
        var data = that.data.priceData;
        var info = that.data.callPriceInfo;
        console.log(info.offerPrice, data.offerPrice)
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

    //确认加一手
    oneHandEnter: function(){
        var that =this;
        that.raisePrice(that.data.oneHandParam);
    },

    //调接口出价
    raisePrice: function (param) {
        var that = this;
        param.apiname = 'auction/raisePrice';
        if (param.price > 9999999) {
            app.showToastMsg(-1, '超过出价上限');
        } else {
            request.getData(param, function (res) {
                if (res.data.state === 1) {
                    app.showToastMsg(0, res.data.data);
                    that.priceCancel();
                    that.oneHandCancel();
                    var rows = that.data.start * that.data.count;
                    setTimeout(function () {
                        that.initData(1, rows); 
                    }, 500)
                } else {
                    app.showToastMsg(-1, res.data.message)
                };
            }, that)
        };
    }
})