// order-submit.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
Page({
    data: {
        customerInfo: {},
        addressInfo: {},
        orderInfo: {},
        wbAccount: '',
        payWeibi: 0,
        payGoods: [],
        chooseInvoice: false,
        chooseWeibi: false,
        invoiceHand: '',
        payArr: [],
        addressId: "",
        btnDisabled: true,
        weibiBox: false,
        gotoPayLock:false,
    },
    onLoad: function (options) {
        var payArr = options.payId.split(",");
        this.setData({
            payArr: payArr,
        })
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        wx.removeStorageSync('needInvoiceInfo');
        wx.removeStorageSync('orderTotal');
        wx.removeStorageSync('invoiceInfo');
        wx.removeStorageSync('invoiceSeq');
        wx.removeStorageSync('addressId');
        var pages = getCurrentPages();
        var prePage = pages[pages.length - 2];
        prePage.setData({
            showLoading: false,
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var invoiceInfo = wx.getStorageSync('invoiceInfo')||'';
        var needInvoiceInfo = wx.getStorageSync('needInvoiceInfo')||'';
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            addressId: wx.getStorageSync('addressId') ? wx.getStorageSync('addressId') : '',
            chooseInvoice: needInvoiceInfo,
            invoiceHand: invoiceInfo.invoiceHand || '',
        })
        this.initData();
    },

    initData: function () {
        var that = this;
        message.hide.call(that);
        var params = {
            apiname: 'person/paySnapshot',
            customerSeq: that.data.customerInfo.customerSeq,
            snapshotSeqArray: that.data.payArr,
            deliveryAddrSeq: that.data.addressId
        };
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                var data = res.data.data;
                if (data.deliveryAddr) {
                    wx.setStorageSync("addressId", data.deliveryAddr.deliveryAddrSeq);
                }
                wx.setStorageSync("orderSubmitList", data.paySnapshot);
                data.orderDes.totalFee = parseFloat(data.orderDes.totalFee).toFixed(2);
                data.orderDes.totalBail = parseFloat(data.orderDes.totalBail).toFixed(2);
                data.orderDes.disbursements = parseFloat(data.orderDes.disbursements).toFixed(2);
                data.orderDes.brokerage = parseFloat(data.orderDes.brokerage).toFixed(2);
                that.setData({
                    addressInfo: data.deliveryAddr,
                    orderInfo: data.orderDes,
                    wbAccount: data.wbAccount,
                    payGoods: data.paySnapshot,

                })
                if (data.orderDes.disbursements > 0) {
                    var wbInit = data.orderDes.disbursements > data.wbAccount ? data.wbAccount : data.orderDes.disbursements;
                    that.setData({
                        weibiBox: true,
                    })
                }
            }
        }, that)
    },

    //选择发票
    chooseInvoice: function () {
        var chooseInvoice = this.data.chooseInvoice ? false : true;
        this.setData({
            chooseInvoice: chooseInvoice,
        })
        wx.setStorageSync('needInvoiceInfo', chooseInvoice);
        if (chooseInvoice) {
            wx.navigateTo({
                url: '/pages/invoice-info/invoice-info',
            })
        }
    },

    //选择威币抵扣
    chooseWeibi: function () {
        var chooseWeibi = this.data.chooseWeibi ? false : true;
        var wbInit = parseFloat(this.data.orderInfo.disbursements > this.data.wbAccount ? this.data.wbAccount : this.data.orderInfo.disbursements);
        if (!chooseWeibi) { wbInit = 0; }
        this.setData({
            chooseWeibi: chooseWeibi,
            payWeibi: wbInit,
        })
    },

    //输入威币抵扣数量
    weibiInput: function (e) {
        var payWeibi = e.detail.value ? parseFloat(e.detail.value) : 0;
        this.setData({
            payWeibi: payWeibi,
        })
    },

    //提交订单
    orderSubmit: function (e) {
        var that = this;
        if (that.data.gotoPayLock)return;
        that.setData({
            gotoPayLock:true,
        })
        var formId = e.detail.formId;
        var openId = wx.getStorageSync("openId");
        that.setData({
            formId: e.detail.formId,
        });
        var auctionGoodsSeqStr = [];
        var auctionSessionSeqStr = [];
        var orderDes = that.data.orderInfo
        var paySnapshot = that.data.payGoods;
        var customerInfo = that.data.customerInfo;
        var addressId = wx.getStorageSync('addressId');
        var payWeibi = parseFloat(this.data.payWeibi);
        if (addressId) {
            if (wx.getStorageSync('needInvoiceInfo') && !wx.getStorageSync('invoiceInfo').invoiceEmail) {
                app.showToastMsg(-1, '请完善发票信息');
                return;
            }
            for (var a = 0; a < paySnapshot.length; a++) {
                if (a == 0) {
                    auctionGoodsSeqStr += paySnapshot[a].auctionGoodsSeq;
                    auctionSessionSeqStr += paySnapshot[a].auctionSessionSeq;
                } else {
                    auctionGoodsSeqStr += "," + paySnapshot[a].auctionGoodsSeq;
                    auctionSessionSeqStr += "," + paySnapshot[a].auctionSessionSeq;
                }
            };
            wx.setStorageSync("auctionGoodsSeqStr", auctionGoodsSeqStr);
            wx.setStorageSync("auctionSessionSeqStr", auctionSessionSeqStr);
            if (that.data.btnDisabled) {
                if (payWeibi > parseFloat(this.data.wbAccount)) {
                    app.showToastMsg(-1, '威币数量不足')
                    return;
                } 
                if (payWeibi > orderDes.disbursements && payWeibi != 0) {
                    app.showToastMsg(-1, '抵扣威币不能超过支付金额')
                    return;
                }
                that.setData({
                    btnDisabled: false,
                })
                if (orderDes.disbursements > 0 && orderDes.disbursements > payWeibi) {
                    wx.setStorageSync("orderTotal", orderDes.disbursements);
                    wx.setStorageSync("payWeibi", payWeibi);
                    wx.navigateTo({
                        url: '/pages/pay-choose/pay-choose',
                    })
                } else {
                    payWeibi = payWeibi == 0 ? null : payWeibi;
                    //支付时的入参
                    var pay_params = {
                        apiname: 'walletPay',
                        payType: 104,
                        bondType: 2,//竞拍保证金
                        customerSeq: customerInfo.customerSeq,
                        totalFee: orderDes.disbursements,
                        auctionGoodsSeqStr: auctionGoodsSeqStr,
                        auctionSessionSeqStr: auctionSessionSeqStr,
                        deliveryAddrSeq: addressId,
                        invoiceSeq: '',
                        wbBalance: payWeibi,
                        sendMssageOpenId: openId,
                        sendMessageFormId: formId,
                    };
                    message.hide.call(that)
                    if (wx.getStorageSync('needInvoiceInfo')) {
                        var invoiceInfo = wx.getStorageSync("invoiceInfo");
                        var invoiceParams = {
                            apiname: 'person/addinvoice',
                            customerSeq: pay_params.customerSeq,
                            invoiceHeadType: wx.getStorageSync("invoiceInfo").invoiceHand ? wx.getStorageSync("invoiceInfo").invoiceHand : 2,
                        }
                        if (invoiceInfo.invoiceHand == 1) {
                            invoiceParams.invoiceHeadContent = wx.getStorageSync("invoiceInfo").invoiceContent;
                            invoiceParams.identificationNumber = wx.getStorageSync("invoiceInfo").invoiceCode;
                        }
                        request.getData(invoiceParams, function (res) {
                            if (res.data.state) {
                                var invoiceSeq = res.data.data;
                                pay_params.invoiceSeq = invoiceSeq;
                                wx.setStorageSync("invoiceSeq", invoiceSeq);
                                request.getData(pay_params, function (res) {
                                    if (res.data.state == 1) {
                                        app.showToastMsg(0, '支付成功')
                                        setTimeout(function () {
                                            wx.switchTab({
                                                url: '/pages/mine/mine'
                                            })
                                        }, 1000)
                                    }
                                }, that)
                            } else {
                                app.showToastMsg(-1, res.data.message)
                            }
                        }, that)
                    } else {
                        request.getData(pay_params, function (res) {
                            if (res.data.state == 1) {
                                app.showToastMsg(0, '支付成功')
                                setTimeout(function () {
                                    wx.switchTab({
                                        url: '/pages/mine/mine'
                                    })
                                }, 1000)
                            }
                        }, that)
                    }
                }
            }
            setTimeout(function () {
                that.setData({
                    btnDisabled: true,
                })
            }, 500)
        } else {
            app.showToastMsg(-1, '请选择收货地址')
        }
    }
})