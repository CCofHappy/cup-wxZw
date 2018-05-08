// invoice-info.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
Page({
    data: {
        customerInfo: {},
        invoiceHand: '',
        invoiceContent: '',
        invoiceCode: '',
        invoiceEmail: '',
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        var invoiceInfo = wx.getStorageSync('invoiceInfo') || ''
        this.setData({
            invoiceHand: invoiceInfo.invoiceHand || '',
            invoiceContent: invoiceInfo.invoiceContent || '',
            invoiceCode: invoiceInfo.invoiceCode || '',
            invoiceEmail: invoiceInfo.invoiceEmail || '',
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this;
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
        })
        var data = {
            apiname: 'person/cusInvoice',
            customerSeq: that.data.customerInfo.customerSeq,
        }
        request.getData(data, function (res) {
            if (res.data.state == 1) {
                if (res.data.data) {
                    var data = res.data.data;
                    that.setData({
                        invoiceHand: that.data.invoiceHand ? that.data.invoiceHand : data.invoiceHeadType,
                        invoiceContent: that.data.invoiceContent ? that.data.invoiceContent : data.invoiceHeadContent,
                        invoiceCode: that.data.invoiceCode ? that.data.invoiceCode : data.identificationNumber,
                        invoiceEmail: that.data.invoiceEmail ? that.data.invoiceEmail : data.email,
                    })
                    if (!wx.getStorageSync('invoiceInfo')) {
                        var invoiceInfo = {
                            invoiceHand: data.invoiceHeadType,
                            invoiceContent: data.invoiceHeadContent,
                            invoiceCode: data.identificationNumber,
                            invoiceEmail: data.email,
                        };
                        wx.setStorageSync('invoiceInfo', invoiceInfo);
                    }
                } else {
                    that.setData({
                        invoiceHand: 2,
                    })
                }
            }
        })
    },
    invoiceChange: function (e) {
        this.setData({
            invoiceHand: e.detail.value,
        })
    },
    invoiceSubmit: function (e) {
        var value = e.detail.value;
        var pattern = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        if (value.invoiceHand == 1 && !value.invoiceContent) {
            app.showToastMsg(-1, '请输入公司名称')
            return;
        }
        if (value.invoiceHand == 1 && !value.invoiceCode) {
            app.showToastMsg(-1, '请输入纳税人识别号')
            return;
        }
        if (!pattern.test(value.invoiceEmail)) {
            app.showToastMsg(-1, '邮箱格式不正确')
            return
        }
        var invoiceInfo = {
            invoiceHand: value.invoiceHand,
            invoiceContent: value.invoiceContent,
            invoiceCode: value.invoiceCode,
            invoiceEmail: value.invoiceEmail,
        };
        wx.setStorageSync('invoiceInfo', invoiceInfo);
        var data = {
            apiname: 'person/updateInvoice',
            customerSeq: this.data.customerInfo.customerSeq,
            invoiceHeadType: value.invoiceHand,
            invoiceHeadContent: value.invoiceContent,
            identificationNumber: value.invoiceCode,
            email: value.invoiceEmail,
        }
        request.getData(data, function (res) {
            if (res.data.state == 1) {
                app.showToastMsg(0, '保存成功')
                setTimeout(function () {
                    wx.navigateBack({
                        delta: 1
                    })
                }, 500)
            } else {
                app.showToastMsg(-1, res.data.message)
            }
        })
    },
})