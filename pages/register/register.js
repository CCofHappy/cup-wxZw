var app = getApp()
var areaCode = require('../../utils/areaCode')
Page({
    data: {
        telephone: "",
        countDownTime: 0,
        registerBtn: "disabled",
        telCode: "+86",
        areaChosePage: true,
        areaCode: [],
        jump: "",
        imgUrl: app.globalData.imagePath,
        indexes: [{ key: "A" }, { key: "B" }, { key: "C" }, { key: "D" }, { key: "E" }, { key: "F" }, { key: "G" }, { key: "H" }, { key: "I" }, { key: "J" }, { key: "K" }, { key: "L" }, { key: "M" }, { key: "N" }, { key: "O" }, { key: "P" }, { key: "Q" }, { key: "R" }, { key: "S" }, { key: "T" }, { key: "U" }, { key: "V" }, { key: "W" }, { key: "X" }, { key: "Y" }, { key: "Z" }],
    },
    onLoad: function (options) {
        this.setData({
            areaCode: areaCode.areaCode
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
        if (!this.data.telephone) {
            app.showToastMsg(-1, '请输入手机号');
            return
        }
        if ((/^1[34578]\d{9}$/.test(this.data.telephone)) || this.data.telCode != "+86") {
            var params = {
                "telephone": this.data.telephone,
                "template": "register",
                "smsText": "verifyCode",
                "international": that.data.telCode,
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
                        wx.showToast({
                            title: res.data.message,
                            image: '../../images/icon/err.png',
                            duration: 1000
                        })
                    }
                },
                fail: function (res) {
                    app.showToastMsg(-1, res.data.message);
                }
            })
        } else {
            app.showToastMsg(-1, '手机号码有误');
        }
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

    //注册
    regsterSubmit: function (e) {
        var value = e.detail.value;
        var regName = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        if (!value.customerName) {
            app.showToastMsg(-1, '请输入昵称');
            return;
        }
        if (regName.test(value.customerName)) {//是汉字
            if (value.customerName.length > 5) {
                app.showToastMsg(-1, '昵称字数≤5个');
                return;
            }
        }
        if (!this.data.telephone) {
            app.showToastMsg(-1, '请输入手机号');
            return
        }
        if (!(/^1[34578]\d{9}$/.test(value.telephone)) && this.data.telCode == "+86") {
            app.showToastMsg(-1, '手机号码有误');
        } else if (!value.smsCode) {
            app.showToastMsg(-1, '请输入验证码');
        } else if (value.password.length < 6) {
            app.showToastMsg(-1, '密码要≥6位数');
        } else if (value.password != value.passwordAgain) {
            app.showToastMsg(-1, '两次密码不相同');
        } else {
            value.customerType = 5;
            value.international = this.data.telCode;
            wx.request({
                url: app.globalData.apiPath + '/person/register',
                method: 'post',
                data: value,
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    if (res.data.state == 1) {
                        app.showToastMsg(0, '注册成功');
                        setTimeout(function () {
                            wx.navigateBack({
                                delta: 1
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

    //同意用户注册协议
    agreeChange: function (e) {
        if (e.detail.value.length) {
            this.setData({
                registerBtn: "",
            })
        } else {
            this.setData({
                registerBtn: "disabled",
            })
        }
    },

    areaCode: function (e) {
        this.setData({
            areaChosePage: false,
        })
    },

    choseCode: function (e) {
        var id = e.currentTarget.id;
        this.setData({
            telCode: id,
            areaChosePage: true,
        })
    },

    jumpCode: function (e) {
        var id = e.currentTarget.id;
        this.setData({
            jump: "jump" + id,
        })
    },
})
