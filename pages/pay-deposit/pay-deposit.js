var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
var md5 = require('../../utils/md5.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        customerInfo: {},
        bondInfo: {},
        wallet: 'choose',
        weixin: '',
        auction: '',
        session: 'choose',
        agree: true,
        totalFee: 0,
        payType: 101,
        payFocus: true,
        payLength: 0,
        openPayPassword: false,
        payPassword: "",
        payTime: false,
    },

    onLoad: function (options) {
        //更新数据
        this.setData({
            auctionGoodsSeq: options.id,
            auctionSessionSeq: options.sessionId,
            customerInfo: wx.getStorageSync('customerInfo')
        })
        this.initData();
    },

    onUnload: function () {
        var pages = getCurrentPages();
        var prePage = pages[pages.length - 2];
        prePage.setData({
            showLoading: false,
        })
    },

    //初始化
    initData: function () {
        var that = this; 
        var data = {
            apiname: 'auction/getBond',
            customerSeq: that.data.customerInfo.customerSeq,
            auctionGoodsSeq: that.data.auctionGoodsSeq,
            auctionSessionSeq: that.data.auctionSessionSeq
        }
        request.getData(data, function (res) {
            var data = res.data.data
            that.setData({
                bondInfo: data
            })
        }, that);
    },

    //选择支付方式
    payType: function (e) {
        if (e.detail.value == 1) {
            this.setData({
                wallet: 'choose',
                weixin: '',
            })
        } else {
            this.setData({
                wallet: '',
                weixin: 'choose',
            })
        }
    },

    //选择保证金类型
    bondType: function (e) {
        this.setData({
            payType: e.detail.value
        })
        if (e.detail.value == 102) {
            this.setData({
                auction: 'choose',
                session: '',
            })
        } else {
            this.setData({
                auction: '',
                session: 'choose',
            })
        }
    },

    //同意拍卖规则
    ruleChange: function (e) {
        if (e.detail.value.length) {
            this.setData({
                agree: true
            })
        } else {
            this.setData({
                agree: false
            })
        }
    },

    //提交保证金
    bondSubmit: function (e) {
        var totalFee = this.data.bondInfo.auctionSessionBond;
        if (!this.data.agree) {
            app.showToastMsg(-1, '是否同意中威网《拍卖规则》')
            return;
        }
        if (e.detail.value.bondType == 102) {
            totalFee = this.data.bondInfo.auctionGoodsBond;
        } else if (!this.data.bondInfo.diState || this.data.bondInfo.disparityBond != this.data.bondInfo.auctionSessionBond) {
            totalFee = this.data.bondInfo.disparityBond
        }

        this.setData({
            totalFee: totalFee
        })
        this.payMoney(e.detail.value.payType);
    },

    //支付保证金
    payMoney: function (type) {
        var that = this;
        var type = parseInt(type);
        switch (type) {
            case 1:
                var id = wx.getStorageSync('customerInfo').customerSeq;
                var data = {
                    apiname: 'person/homepage/' + id,
                }
                request.getData(data, function (res) {
                    var balance = '0.00';
                    if (res.data.data[0] != null) {
                        balance = parseFloat(res.data.data[0].balance);
                    }
                    if (that.data.totalFee > balance) {//余额不足
                        app.showToastMsg(-1, '余额不足')
                        return;
                    }
                    wx.showModal({
                        title: '中威钱包 极速安全支付',
                        content: '可用余额:￥' + balance,
                        success: function (res) {
                            if (res.confirm) {
                                that.setData({
                                    openPayPassword: true,
                                })
                            } else if (res.cancel) {}
                        }
                    })
                }, that)
                break;
            case 2:
                var openid = wx.getStorageSync("openId");
                var param = {
                    auctionGoodsSeq: that.data.auctionGoodsSeq,
                    auctionSessionSeq: that.data.auctionSessionSeq,
                    totalFee: that.data.totalFee,
                    openId: openid,
                    payType: that.data.payType,
                    customerSeq: that.data.customerInfo.customerSeq,
                }
                wx.request({
                    url: app.globalData.weixin + 'miniPay',
                    data: param,
                    method: 'post',
                    header: {
                        "content-type": "application/json"
                    },
                    success: function (res) {
                        if(res.data.state==0){
                            app.showToastMsg(-1, res.data.message);
                            return;
                        }
                        wx.requestPayment({
                            'timeStamp': res.data.timeStamp,
                            'nonceStr': res.data.nonceStr,
                            'package': res.data.packagePrepay_id,
                            'signType': 'MD5',
                            'paySign': res.data.paySign,
                            'success': function (res) {
                                wx.navigateBack({
                                    delta: 1,
                                })
                            },
                            'fail': function (res) {}
                        })
                    }
                })
                break;
        }
    },

    //点击支付密码框获取焦点  
    bindPayClick: function () {
        this.setData({
            payFocus: true
        })
    },

    //监听支付密码输入
    bindPayInput: function (e) {
        var that = this;
        this.setData({
            payLength: e.detail.value.length,
            payPassword: e.detail.value
        })
        if (that.data.payTime) return;
        if (e.detail.value.length == 6) {
            that.setData({
                payTime: true,
            })
            var data = {
                apiname: 'walletPay',
                payType: that.data.payType,
                bondType: 2,//竞拍保证金
                customerSeq: that.data.customerInfo.customerSeq,
                auctionGoodsSeq: that.data.auctionGoodsSeq,
                auctionSessionSeq: that.data.auctionSessionSeq,
                totalFee: that.data.totalFee,
            };
            data.passWord = md5.hexMD5(that.data.payPassword);
            request.getData(data, function (res) {
                if (res.data.state == 1) {
                    app.showToastMsg(0,'支付成功')
                    setTimeout(function () {
                        wx.navigateBack({
                            delta: 1
                        })
                    }, 1000)
                } else {
                    app.showToastMsg(-1, res.data.message)
                    that.setData({
                        payLength: 0,
                        payPassword: "",
                        payTime: false,
                        openPayPassword:false
                    })
                }
            }, that)
        }
    },
    //取消输入支付密码
    closePayPassword: function () {
        this.setData({
            openPayPassword: false,
            payLength: 0,
            payPassword: ""
        })
    },
    gotoNotice: function () {
        wx.navigateTo({
            url: '/pages/auction-notice/auction-notice',
        })
    }
})