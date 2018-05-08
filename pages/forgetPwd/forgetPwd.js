var app = getApp()
Page({
    data: {
        telephone: "",
        countDownTime: 0,
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
        if (!this.data.telephone) {
            app.showToastMsg(-1, '请输入手机号');
            return
        }
        var params = {
            "telephone": this.data.telephone,
            "template": "updatePad",
            "smsText": "smsCode"
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
                    app.showToastMsg(0, '验证码已发送');
                    that.setTime(60);
                } else {
                    app.showToastMsg(-1, res.data.message);
                }
            },
            fail: function (res) {
                app.showToastMsg(-1, res.data.message);
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
        if (!value.telephone) {
            app.showToastMsg(-1, '请输入手机号');
        } else if (!value.smsCode) {
            app.showToastMsg(-1, '请输入验证码');
        } else if (value.password.length < 6) {
            app.showToastMsg(-1, '密码要≥6位数');
        } else if (value.password != value.passwordAgain) {
            app.showToastMsg(-1, '两次密码不相同');
        } else {
            wx.request({
                url: app.globalData.apiPath + '/person/forgetLoginPwd',
                method: 'post',
                data: value,
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    if (res.data.state == 1) {
                        app.showToastMsg(0, '重置密码成功');
                        setTimeout(function () {
                            wx.navigateTo({
                                url: '/pages/login/login?from=forget'
                            })
                        }, 1000)
                    } else {
                        app.showToastMsg(-1, res.data.message);
                    }
                },
                fail: function (res) {
                    app.showToastMsg(-1, res.data.message);
                }
            })
        }
    },
})