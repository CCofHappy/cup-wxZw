var app = getApp()
var md5 = require('../../utils/md5.js')
Page({
    data: {
        countDownTime: 0,
        customerInfo: {},
        type: "login"
    },
    onLoad: function (options) {
        var that = this;
        if (options.type == "pay") {
            wx.setNavigationBarTitle({
                title: '支付设置'
            })
        }

        //更新数据
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            type: options.type
        })
    },

    //手机号码
    telInput: function (e) {
        this.setData({
            telephone: e.detail.value
        })
    },

    //发送验证码
    sendCode: function (e) {
        var that = this;
        var params = {
            telephone: this.data.customerInfo.customerLogin,
            template: "updatePad",
            smsText: "smsCode"
        };
        if (that.data.type == "pay") {
            params.template = "updateTradePad";
        };
        wx.request({
            url: app.globalData.apiPath + '/person/sendSMSCode',
            method: 'post',
            data: params,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                if (res.data.state == 1) {
                    app.showToastMsg(0, '验证码已发送')
                    that.setTime(60);
                } else {
                    app.showToastMsg(-1, res.data.message)
                }
            }
        })
    },

    //验证码倒计时
    setTime: function (countdown) {
        var that = this;
        that.setData({
            countDownTime: countdown
        })
        if (countdown == 0) {
            countdown = 60;
            return;
        } else {
            countdown--;
        }
        setTimeout(function () {
            that.setTime(countdown)
        }, 1000)
    },

    //重置密码
    passwordSubmit: function (e) {
        var value = e.detail.value;
        var that = this;
        if (!value.smsCode) {
            app.showToastMsg(-1, '请输入验证码')
        } else if (value.password.length != 6 && that.data.type == "pay") {
            app.showToastMsg(-1, '支付密码≥6位数')
        } else if (value.password.length < 6 && that.data.type == "login") {
            app.showToastMsg(-1, '登录密码≥6位数')
        } else if (value.password != value.passwordAgain) {
            app.showToastMsg(-1, '两次密码不相同')
        } else {
            var api = app.globalData.apiPath + '/person/forgetLoginPwd';
            if (that.data.type == "pay") {
                value.password = md5.hexMD5(value.password);
                value.passwordAgain = md5.hexMD5(value.passwordAgain);
                api = app.globalData.apiPath + '/person/paySettings';
            }
            value.telephone = that.data.customerInfo.customerLogin;
            value.customerSeq = that.data.customerInfo.customerSeq;
            wx.request({
                url: api,
                method: 'post',
                data: value,
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    if (res.data.state == 1) {
                        if (that.data.type == "pay") {
                            app.showToastMsg(0, '设置成功')
                            setTimeout(function () {
                                wx.navigateBack({
                                    delta: 1
                                })
                            }, 2000)
                        } else {
                            app.showToastMsg(0, '设置成功')
                            wx.removeStorageSync('customerInfo');
                            setTimeout(function () {
                                wx.navigateTo({
                                    url: '/pages/login/login?from=forget'
                                })
                            }, 2000)
                        }
                    } else {
                        app.showToastMsg(0, res.data.message)
                    }
                }
            })
        }
    },
})