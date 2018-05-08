App({
    globalData: {
        userInfo: null,
        apiPath: "https://dev.wap.cwhisky.com/cwhisky-jp-app-api/app",
        wssPath: "wss://dev.wap.cwhisky.com/cwhisky-jp-app-api/webSocket",
        weixin: "https://dev.wap.cwhisky.com/weixin/",
        addreessPath: "https://wap.cwhisky.com/area2.0.json",
        imagePath: "https://microweb.oss-cn-shenzhen.aliyuncs.com/",
        serverTime: "",
        areaJson: "",
        kfPhone: '400-830-5299',
        version: 'v2.2.4',
        telMode: '',
    },
    onLaunch: function () {
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.globalData.telMode = res.model;
                that.globalData.telSystem = res.system;
            }
        })
        that.getUserInfo();
        if (wx.getStorageSync('customerInfo').etoken) {
            that.makeSocket()
        }
    },
    getUserInfo: function (e) {
        var t = this;
        wx.getStorageSync("wxUserInfo") ? "function" == typeof e && e(this.globalData.userInfo) : wx.login({
            success: function (n) {
                t.getOpenId(n.code),
                wx.getUserInfo({
                    success: function (n) {
                        wx.setStorageSync("wxUserInfo", n.userInfo),
                            t.globalData.userInfo = n.userInfo,
                            "function" == typeof e && e(t.globalData.userInfo)
                    }
                })
            }
        })
    },
    //获取openID
    getOpenId: function (e) {
        var t = this;
        wx.request({
            url: t.globalData.weixin + "getOpenId4Mini/" + e, data: "", method: "get",
            header: { "content-type": "application/json" },
            success: function (e) {
                e.data && wx.setStorageSync("openId", e.data.openid)
            }
        })
    },
    //校验是否有登录
    checkLogin: function () {
        var _this = this;
        var usrInfo = wx.getStorageSync('customerInfo')
        if (!usrInfo.customerSeq) {
            _this.showToastMsg(-1, "请先登录");
            setTimeout(function () {
                wx.navigateTo({
                    url: '/pages/login/login'
                })
            }, 500)
            return false;
        } else {
            return true;
        }
    },
    //中威钱包支付
    zwPayFunc: function (that, payMoney) {
        var _this = this;
        var usrid = wx.getStorageSync('customerInfo').customerSeq;
        var url = _this.globalData.apiPath + '/person/homepage/' + usrid;
        wx.request({
            url: url,
            data: "",
            method: "get",
            header: {
                "content-type": "application/json",
                //公共参数
                "mode": _this.globalData.telMode,
                "system": _this.globalData.telSystem,
                "apiversion": _this.globalData.version,
                "platform": 'miniwap',
                "etoken": wx.getStorageSync('customerInfo').etoken || '',
            },
            success: function (res) {
                if (res.data.state == -1) {
                    wx.removeStorageSync('customerInfo');
                    _this.showToastMsg(-1, "请先登录")
                    setTimeout(function () {
                        wx.navigateTo({
                            url: '/pages/login/login'
                        })
                    }, 500)
                } else {
                    var balance = 0;
                    if (res.data.data[0].balance != null) {
                        balance = parseFloat(res.data.data[0].balance);
                    }
                    //余额不足
                    if (payMoney > balance) {
                        _this.showToastMsg(-1, "余额不足");
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
                }  
            }
        })
    },
    //信息提示
    showToastMsg: function (code, msg) {
        //code == 0 表示成功  code== -1表示错误
        if (code == 0) {
            if (msg.length > 7) {
                wx.showModal({
                    content: msg,
                    confirmText: "我知道了",
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                        } else if (res.cancel) {
                        }
                    }
                })
            } else {
                wx.showToast({
                    title: msg,
                    icon: 'success',
                    duration: 2000
                })
            }
        } else if (code == -1) {
            if (msg.length > 7) {
                wx.showModal({
                    content: msg,
                    confirmText: "我知道了",
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                        } else if (res.cancel) {
                        }
                    }
                })
            } else {
                wx.showToast({
                    title: msg,
                    image: '../../images/icon/err.png',
                    duration: 2000
                })
            }
        } else if (code == -2) {
            wx.showModal({
                content: msg,
                confirmText: "我知道了",
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                    } else if (res.cancel) {
                    }
                }
            })
        }
    },

    //判断中文 字母 数字
    checkStrCn: function (val) {
        var reg = /^[A-Za-z0-9\u4e00-\u9fa5]+$/gi;
        if (reg.test(val)) {
            return true;
        } else {
            return false;
        }
    },

    //建立webSocket
    makeSocket: function(){
        var that = this;
        wx.connectSocket({
            url: that.globalData.wssPath + '?etoken=' + wx.getStorageSync('customerInfo').etoken,
        })
        wx.onSocketOpen(function (res) { })
        wx.onSocketMessage(function (res) {
            if (res.data) {
                wx.removeStorageSync('customerInfo');
                wx.showModal({
                    content: res.data,
                    confirmText: "我知道了",
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: '/pages/login/login'
                            })
                        } else if (res.cancel) {
                        }
                    }
                })
            }
        })
    }
});