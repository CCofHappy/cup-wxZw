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
        wallet: 'choose',
        weixin: '',
        orderTotal: 0,
        payFocus: true,
        payLength: 0,
        openPayPassword: false,
        payPassword: "",
        wbBalance: 0,
        payFee: 0,
        payTime: false,
        payLock: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var payFee = parseFloat(wx.getStorageSync('orderTotal') - wx.getStorageSync('payWeibi')).toFixed(2);
        var wbBalance = wx.getStorageSync('payWeibi') == 0 ? null : parseFloat(wx.getStorageSync('payWeibi')).toFixed(2);
        //更新数据
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            orderTotal: parseFloat(wx.getStorageSync('orderTotal')).toFixed(2),
            wbBalance: wbBalance,
            payFee: payFee,
        })
    },

    onUnload: function () {
        var pages = getCurrentPages();
        var prePage = pages[pages.length - 2];
        prePage.setData({
            gotoPayLock: false,
        })
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

    //支付订单金额
    paySubmit: function (e) {
        var that = this;
        var type = parseInt(e.detail.value.payType);
        var openId = wx.getStorageSync("openId");
        var formId = e.detail.formId;
        that.setData({
            formId: e.detail.formId,
        });
        var param = {
            openId: openId,
            sendMssageOpenId: openId,
            sendMessageFormId: formId,
            customerSeq: that.data.customerInfo.customerSeq,
            auctionGoodsSeqStr: wx.getStorageSync('auctionGoodsSeqStr'),
            auctionSessionSeqStr: wx.getStorageSync('auctionSessionSeqStr'),
            deliveryAddrSeq: wx.getStorageSync('addressId'),
            payType: 104,
            wbBalance: that.data.wbBalance,
        }
        if (wx.getStorageSync('needInvoiceInfo')) {
            var invoiceInfo = wx.getStorageSync("invoiceInfo");
            var invoiceParams = {
                apiname: 'person/addinvoice',
                customerSeq: param.customerSeq,
                invoiceHeadType: wx.getStorageSync("invoiceInfo").invoiceHand ? wx.getStorageSync("invoiceInfo").invoiceHand : 2,
                email: wx.getStorageSync("invoiceInfo").invoiceEmail,
            }
            if (invoiceInfo.invoiceHand == 1) {
                invoiceParams.invoiceHeadContent = wx.getStorageSync("invoiceInfo").invoiceContent;
                invoiceParams.identificationNumber = wx.getStorageSync("invoiceInfo").invoiceCode;
            }
            request.getData(invoiceParams, function (res) {
                if (res.data.state) {
                    var invoiceSeq = res.data.data;
                    param.invoiceSeq = invoiceSeq;
                    wx.setStorageSync("invoiceSeq", invoiceSeq);
                    that.payment(type, param);
                } else {
                    wx.showToast({
                        title: res.data.message,
                        image: '../../images/icon/err.png',
                        duration: 2000
                    })
                }
            }, that)
        } else {
            that.payment(type, param);
        }
    },

    //支付方式
    payment: function (type, param) {
        var that = this;
        switch (type) {
            case 1:
                var id = wx.getStorageSync('customerInfo').customerSeq;
                var data = {
                    apiname: 'person/homepage/' + id,
                }
                request.getData(data, function (res) {
                    var balance = 0;
                    if (res.data.data[0].balance != null) {
                        balance = parseFloat(res.data.data[0].balance);
                    }
                    //余额不足
                    if (that.data.orderTotal - that.data.wbBalance > balance) {
                        app.showToastMsg(-1,'余额不足')
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
                            } else if (res.cancel) {
                            }
                        }
                    })
                }, that)
                break;
            case 2:
                that.setData({
                    payLock: "disabled",
                })
                wx.request({
                    url: app.globalData.weixin + 'miniPay',
                    data: param,
                    method: 'post',
                    header: {
                        "content-type": "application/json"
                    },
                    success: function (res) {
                        that.setData({
                            payLock: ""
                        })
                        var prepay_id = res.data.packagePrepay_id.split("=")[1];
                        var balance = res.data.balance;
                        var goodsName = res.data.auctionGoodsNames;
                        var orderNo = res.data.orderNo;
                        if (goodsName.length > 20) {
                            goodsName = goodsName.substring(0, 20) + "...";
                        } else {
                            goodsName = goodsName.substring(0, goodsName.length - 1);
                        }
                        wx.requestPayment({
                            'timeStamp': res.data.timeStamp,
                            'nonceStr': res.data.nonceStr,
                            'package': res.data.packagePrepay_id,
                            'signType': 'MD5',
                            'paySign': res.data.paySign,
                            'success': function (res) {
                                //订单支付成功通知
                                var timestamp = new Date().getTime();
                                var nowTime = util.toDate(timestamp, 5);
                                var orderTime = util.toDate(timestamp, 6);
                                message.hide.call(that)
                                var data = {
                                    apiname: 'weixin/sendMsg',
                                    "touser": param.sendMssageOpenId,
                                    "template_id": "LGEdbOgkPg38hWmb5fC7UxSAjtn4yQ2tEu6Vdoh7L5Y",
                                    "form_id": prepay_id,
                                    "page": "pages/mine-finance/mine-finance",
                                    "data": [
                                        {
                                            "value": orderNo,
                                            "color": "#173177"
                                        },
                                        {
                                            "value": goodsName,
                                            "color": "#173177"
                                        },
                                        {
                                            "value": nowTime,
                                            "color": "#173177"
                                        },
                                        {
                                            "value": orderTime,
                                            "color": "#173177"
                                        },
                                        {
                                            "value": "微信支付",
                                            "color": "#173177"
                                        },
                                        {
                                            "value": that.data.payFee + "元",
                                            "color": "#173177"
                                        },
                                    ],
                                }
                                request.getData(data, function (res) {}, that)
                                var pages = getCurrentPages();//支付成功返回订单待收货页面
                                var page = pages[pages.length - 3];
                                page.setData({
                                    sliderOffset: page.data.windowWidth / 3 * 1,
                                    activeIndex: 1,
                                    showLoading: true,
                                });
                                page.initData();
                                this.setData({
                                    payLength: e.detail.value.length,
                                    payPassword: e.detail.value
                                })
                            }
                        })
                    },
                    fail: function (res) {
                        that.setData({
                            payLock: ""
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
        var wbBalance = that.data.wbBalance;
        if (that.data.payTime) return;
        this.setData({
            payLength: e.detail.value.length,
            payPassword: e.detail.value
        })
        if (e.detail.value.length == 6) {
            that.setData({
                payTime: true,
            })
            var openId = wx.getStorageSync("openId");
            var formId = that.data.formId;
            var data = {
                apiname: 'walletPay',
                customerSeq: that.data.customerInfo.customerSeq,
                auctionGoodsSeqStr: wx.getStorageSync('auctionGoodsSeqStr'),
                auctionSessionSeqStr: wx.getStorageSync('auctionSessionSeqStr'),
                totalFee: parseFloat(that.data.orderTotal - wbBalance).toFixed(2),
                deliveryAddrSeq: wx.getStorageSync('addressId'),
                invoiceSeq: wx.getStorageSync('invoiceSeq'),
                payType: 104,
                wbBalance: wbBalance,
                sendMssageOpenId: openId,
                sendMessageFormId: formId,
            };
            data.passWord = md5.hexMD5(that.data.payPassword);
            request.getData(data, function (res) {
                if (res.data.state == 1) {
                    app.showToastMsg(0,'支付成功')
                    setTimeout(function () {
                        var pages = getCurrentPages();//支付成功返回订单待收货页面
                        var page = pages[pages.length - 3];
                        page.setData({
                            sliderOffset: page.data.windowWidth / 3 * 1,
                            activeIndex: 1,
                            showLoading: true,
                        });
                        page.initData();
                        wx.navigateBack({
                            delta: 2,
                        })
                    }, 1000)
                } else {
                    app.showToastMsg(-1, res.data.message)
                    that.setData({
                        payLength: 0,
                        payPassword: "",
                        payTime: false,
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

    //线下支付
    offlinePay: function(){
        wx.navigateTo({
            url: '/pages/offline-pay/offline-pay'
        })
    }
})