var md5 = require('../../utils/md5.js')
var request = require('../../utils/request')
var app = getApp()
Page({
    data: {
        username: null,
        password: null,
        from: "",
        imgUrl: app.globalData.imagePath,
    },
    onLoad: function (options) {
        this.setData({
            from: options.from,
        })
    },

    inputClick: function (e) {
        this.setData({ username: e.detail.value });
    },
    pwdClick: function (e) {
        this.setData({ password: e.detail.value });
    },
    loginBtnClick: function (e) {
        var that = this;
        if (!that.data.username) {
            app.showToastMsg(-1, '请输入手机号')
        } else if (!that.data.password) {
            app.showToastMsg(-1, '请输入密码')
        } else {
            var params = {
                apiname: '/person/login',
                customerLogin: this.data.username,
                customerPwd: md5.hexMD5(this.data.password)
            };
            request.getData(params, function (res) {
                if (res.data.state == 1) {
                    wx.setStorageSync('customerInfo', res.data.data);
                    app.showToastMsg(0, '登录成功');
                    app.makeSocket();
                    if (that.data.from == "forget") {
                        setTimeout(function () {
                            wx.switchTab({
                                url: '/pages/mine/mine'
                            })
                        }, 1000)
                    } else {
                        setTimeout(function () {
                            wx.navigateBack({
                                delta: 1
                            })
                        }, 1000)
                    }
                } else {
                    app.showToastMsg(-1, res.data.message)
                }

            })
        }
    }
})