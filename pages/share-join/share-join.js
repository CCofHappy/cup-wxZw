var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
var md5 = require('../../utils/md5.js')
Page({
    data: {
        imgUrl: app.globalData.imagePath,
        payType: 1,
        count: 1,
        shareDetail: '',
        addressList: '',
        payFocus: true,
        payLength: 0,
        openPayPassword: false,
        payPassword: "",
        payTime: false,
        payLock: "",
        //控制提交按钮是否高亮（提交之后需将按钮设置禁用 防止重复提交造成重复订单问题）
        switchBtn: true,
    },
    onLoad: function (options) {
        this.setData({
            orderNo: options.orderNo ? options.number : '',
            number: options.number ? options.number : 0,
            count: options.number ? options.number : 1,
            index: options.index ? options.index : '',
        })
    },

    onShow: function () {
        this.setData({
            shareDetail: wx.getStorageSync('shareDetail'),
            customerInfo: wx.getStorageSync('customerInfo'),
        })
        this.initData();
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        wx.removeStorageSync('addressId')
    },

    changeCount: function (e) {
        var num = e.currentTarget.dataset.num;
        var count = this.data.count;
        var numberAll = this.data.shareDetail.numberAll ? this.data.shareDetail.numberAll : this.data.shareDetail.number;
        var max = numberAll - this.data.shareDetail.sold + parseInt(this.data.number);
        if (this.data.shareDetail.limitations&&this.data.shareDetail.limitations!=0){
            max = this.data.shareDetail.limitations > max ? max : this.data.shareDetail.limitations;
        }
        if (parseInt(count) + 1 > (numberAll - this.data.shareDetail.sold + parseInt(this.data.number)) && num != 0) {
            wx.showModal({
                showCancel: false,
                confirmText: '知道了',
                content: '您的参与数量超过剩余数量',
                success: function (res) {
                }
            })
        } else if (this.data.shareDetail.limitations && parseInt(count) + 1 > (this.data.shareDetail.limitations) && num != 0){
            wx.showModal({
                showCancel: false,
                confirmText: '知道了',
                content: '每个用户限购' + this.data.shareDetail.limitations+'份',
                success: function (res) {
                }
            })
        }
        if (num == 0) {
            count = count < 2 ? 1 : count - 1;
        } else {
            count++;
        }
        count = count > max ? max : count;
        this.setData({
            count: count,
        })
    },

    chosePay: function (e) {
        var num = e.currentTarget.dataset.num;
        this.setData({
            payType: num,
        })
    },

    initData: function () {
        //初始化页面
        var that = this
        message.hide.call(that)
        var data = {
            apiname: 'person/customerSeqADD/' + that.data.customerInfo.customerSeq,
        }
        request.getData(data, function (res) {
            var data = res.data.data;
            if (data.length) {
                var addressInfo = data[0];
                var index = that.data.index;
                if (wx.getStorageSync('addressId')) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].deliveryAddrSeq == wx.getStorageSync('addressId')) {
                            addressInfo = data[i];
                        }
                    }
                } else {
                    if (index=='sp') {
                        var shareDetail = that.data.shareDetail;
                        addressInfo.consignee = shareDetail.consignee_person;
                        addressInfo.province = shareDetail.delivery_addr;
                        addressInfo.addr = '';
                        addressInfo.phone = shareDetail.consignee_mobile;
                    } else if (index){  
                        var postOrder = that.data.shareDetail.postOrder[index];
                        addressInfo.consignee = postOrder.consignee_person;
                        addressInfo.province = postOrder.delivery_addr;
                        addressInfo.addr = '';
                        addressInfo.phone = postOrder.consignee_mobile;
                    }
                }
                that.setData({
                    addressInfo: addressInfo
                })
            }
        }, that)
    },

    shareSubmit: function (e) {
        var that = this;
        var formId = e.detail.formId;
        that.setData({
            formId: e.detail.formId,
        });
        if (!that.data.addressInfo) {
            app.showToastMsg(-1, "请选择收货地址");
            return;
        }
        if (this.data.payType == 1) {
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
                if ((that.data.count * that.data.shareDetail.price) > balance) {
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
                        } else if (res.cancel) {}
                    }
                })
            }, that)
        } else {
            var openId = wx.getStorageSync("openId");
            var data = {
                totalFee: parseInt(that.data.count * that.data.shareDetail.price),
                openId: openId,
                sendMssageOpenId: openId,
                sendMessageFormId: formId,
                payType: 105,
                customerSeq: that.data.customerInfo.customerSeq,
                pid: that.data.shareDetail.pid,
                number: that.data.count,
                deliveryAddr: that.data.addressInfo.province + ' '+ that.data.addressInfo.addr,
                consigneeMobile: that.data.addressInfo.phone,
                consigneePerson: that.data.addressInfo.consignee,
            }
            if (that.data.orderNo) {
                data.orderNo = that.data.orderNo;
            }
            //请求成功之后，将提交按钮禁用
            that.setData({
                switchBtn: false
            })
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
                                setTimeout(function () {
                                    wx.navigateBack({
                                        delta: 1,
                                    })
                                }, 1000)
                                setTimeout(function () {
                                    prevPage.onPullDownRefresh();
                                }, 5000)
                            },
                            'fail': function (res) {
                                wx.navigateBack({
                                    delta: 1,
                                })
                                setTimeout(function () {
                                    prevPage.onPullDownRefresh();
                                }, 5000)
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
            var openId = wx.getStorageSync("openId");
            var formId = that.data.formId;
            var data = {
                apiname: 'walletPay',
                customerSeq: that.data.customerInfo.customerSeq,
                payType: 105,
                pid: that.data.shareDetail.pid,
                number: that.data.count,
                deliveryAddr: that.data.addressInfo.province + ' ' +  that.data.addressInfo.addr,
                consigneeMobile: that.data.addressInfo.phone,
                consigneePerson: that.data.addressInfo.consignee,
                sendMssageOpenId: openId,
                sendMessageFormId: formId,
            };
            if (that.data.orderNo) {
                data.orderNo = that.data.orderNo;
            }
            data.passWord = md5.hexMD5(that.data.payPassword);
            request.getData(data, function (res) {
                if (res.data.state == 1) {
                    app.showToastMsg(0, '支付成功');
                    var pages = getCurrentPages();
                    var prevPage = pages[pages.length - 2];
                    setTimeout(function () {
                        wx.navigateBack({
                            delta: 1,
                        })
                    }, 1000)
                    setTimeout(function () {
                        prevPage.onPullDownRefresh();
                    }, 5000)
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