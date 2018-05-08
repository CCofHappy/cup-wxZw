// pages/give-reward-pay/give-reward-pay.js
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
        imgUrl: app.globalData.imagePath,
        customerInfo: "",
        payType: 1,
        pid: "",
        price: "",
        payFocus: true,
        payLength: 0,
        openPayPassword: false,
        payTime: false,
        postType: 1,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            pid: options.pid,
            price: parseFloat(options.price).toFixed(2),
            customerInfo: wx.getStorageSync('customerInfo'),
            postType:options.type||1,
        })
        
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    chosePay: function (e) {
        var num = e.currentTarget.dataset.num;
        this.setData({
            payType: num,
        })
    },

    payNow: function(e){
        var that = this;
        if (that.data.payType == 1) {
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
                if (that.data.price > balance) {
                    app.showToastMsg(-1, "余额不足,请充值");
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
                        } else if (res.cancel) { }
                    }
                })
            }, that)
        } else {
            var openId = wx.getStorageSync("openId");
            var data = {
                totalFee: that.data.price,
                payType: 107,
                customerSeq: that.data.customerInfo.customerSeq,
                pid: that.data.pid,
                postType: that.data.postType,
                openId: openId,
            }
            wx.request({
                url: app.globalData.weixin + 'miniPay',
                data: data,
                method: 'post',
                header: {
                    "content-type": "application/json"
                },
                success: function (res) {
                    if (res.data.state == 0) {
                        app.showToastMsg(-1, res.data.message);
                    } else {
                        var prepay_id = res.data.packagePrepay_id.split("=")[1];
                        var pages = getCurrentPages();
                        var prevPage = pages[pages.length - 2];
                        wx.requestPayment({
                            'timeStamp': res.data.timeStamp,
                            'nonceStr': res.data.nonceStr,
                            'package': res.data.packagePrepay_id,
                            'signType': 'MD5',
                            'paySign': res.data.paySign,
                            'success': function (res) {
                                prevPage.onPullDownRefresh();
                                prevPage.setData({
                                    giveRewardOpen: false,
                                    payAfter: true,
                                    payAfterPrice: that.data.price,
                                })
                                wx.navigateBack({
                                    delta: 1,
                                })
                            },
                            'fail': function (res) {
                                app.showToastMsg(-1, '支付失败');
                            }
                        })
                    }
                },
            })
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
                totalFee: that.data.price,
                apiname: 'walletPay',
                customerSeq: that.data.customerInfo.customerSeq,
                payType: 107,
                pid: that.data.pid,
                postType: that.data.postType,
            };
            data.passWord = md5.hexMD5(that.data.payPassword);
            request.getData(data, function (res) {
                if (res.data.state == 1) {
                    app.showToastMsg(0, '支付成功');
                    var pages = getCurrentPages();
                    var prevPage = pages[pages.length - 2];
                    prevPage.onPullDownRefresh();
                    prevPage.setData({
                        giveRewardOpen: false,
                        payAfter: true,
                        payAfterPrice: that.data.price, 
                    })
                    setTimeout(function () {
                        wx.navigateBack({
                            delta: 1,
                        })
                    }, 1000)
                } else {
                    app.showToastMsg(-2, res.data.message);
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

})