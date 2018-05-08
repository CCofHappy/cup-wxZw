var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
var md5 = require('../../utils/md5.js')
Page({
    data: {
        imgUrl: app.globalData.imagePath,
        openPayPassword: false,
        payType: 1,
        payFocus: true,
        payLength: 0,
        payPassword: '',
        payTime: false,
        formId: '',
        voiceType: {
            id: 0,
            text: '不开发票'
        },
        invoiceSeq: null,
        invoiceHeadContent: null,
        identificationNumber: null,
        address: null,
        remarks: null,
        buyNow: false,
        orderInfo: {
            price: 0,
            num: 0,
            totalPrice: 0
        }
    },
    //  生命周期函数--监听页面加载
    onLoad: function (options) {
        var _this = this;
        var txt = '不开发票';
        _this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            orderInfo: {
                price: parseFloat(options.price).toFixed(1),
                num: options.num,
                totalPrice: parseFloat(parseFloat(options.price) * parseInt(options.num)).toFixed(2)
            },
            openId: wx.getStorageSync("openId")
        })
        _this.getUsersAddr();
        if (options.type == "buyNow") {
            var buyNowData = wx.getStorageSync('buyNowData')
            var invoiceHeadType = parseInt(buyNowData.invoiceHeadType)
            switch (invoiceHeadType) {
                case 0: txt = '不开发票'; break;
                case 1: txt = '个人发票'; break;
                case 2: txt = '单位发票'; break;
            }
            _this.setData({
                voiceType: {
                    id: invoiceHeadType,
                    text: txt
                },
                invoiceHeadContent: buyNowData.invoiceHeadContent,
                identificationNumber: buyNowData.identificationNumber,
                remarks: buyNowData.remarks,
                buyNow: true,
            })
        }
    },
    onShow: function () {
        var _this = this;
        var addrSeq = wx.getStorageSync('addressId');
        _this.getUsersAddr(addrSeq);
    },
    //获取用户的默认地址
    getUsersAddr: function (seq) {
        var _this = this;
        var usrSeq = this.data.customerInfo.customerSeq;
        var data = {
            apiname: 'person/customerSeqADD/' + usrSeq,
        }
        request.getData(data, function (res) {
            var data = res.data.data;
            for (var i = 0; i < data.length; i++) {
                if (seq == ' ' || seq == null) {//未选择地址时 取用户的默认地址
                    if (data[i].flag == 1) {
                        _this.setData({ address: data[i] });
                    }
                } else { //选择地址后 以用户的默认地址为准 seq 在选择地址时就保存到storeage中
                    if (seq == data[i].deliveryAddrSeq) {
                        _this.setData({ address: data[i] });
                    }
                }
            }
        });
    },
    //选择支付方式
    chosePay: function (e) {
        var num = e.currentTarget.dataset.num;
        this.setData({
            payType: num,
        })
    },
    //选择发票类型
    chooseVoiceType: function () {
        var _this = this;
        var txt = '';
        wx.showActionSheet({
            itemList: ['不开发票', '个人发票', '单位发票'],
            success: function (res) {
                if (res.tapIndex == undefined) return;
                switch (res.tapIndex) {
                    case 0: txt = '不开发票'; break;
                    case 1: txt = '个人发票'; break;
                    case 2: txt = '单位发票'; break;
                }
                _this.setData({
                    voiceType: {
                        id: res.tapIndex,
                        text: txt
                    }
                });
            },
            fail: function (res) { }
        })
    },
    //调用支付接口
    shareBottleSubmit: function (e) {
        var _this = this;
        var formId = e.detail.formId;
        _this.setData({
            formId: e.detail.formId,
        });
        if (!_this.data.address) {
            app.showToastMsg(-1, '请选择收货地址');
            return;
        }
        if (_this.data.voiceType.id == 2) {
            if (!_this.data.identificationNumber || !_this.data.invoiceHeadContent) {
                app.showToastMsg(-1, '请完善发票信息');
                return;
            }
        }
        if (_this.data.voiceType.id != 0) {
            _this.addInvoice();
        }
        if (_this.data.payType == 1) {
            //中威钱包支付
            app.zwPayFunc(_this, _this.data.orderInfo.totalPrice);
        } else {
            setTimeout(function () {
                _this.wxPay();
            }, 500)
        }
    },

    //生成发票
    addInvoice: function () {
        var _this = this;
        var invoiceParams = {
            apiname: 'person/addinvoice',
            customerSeq: _this.data.customerInfo.customerSeq,
            invoiceHeadType: _this.data.voiceType.id,
        }
        if (_this.data.voiceType.id == 2) {
            invoiceParams.invoiceHeadContent = _this.data.invoiceHeadContent;
            invoiceParams.identificationNumber = _this.data.identificationNumber;
        }
        request.getData(invoiceParams, function (res) {
            if (res.data.state == 1) {
                _this.setData({
                    invoiceSeq: res.data.data
                })
            } else {
                app.showToastMsg(-1, res.data.messag);
            }
        }, _this)
    },

    //微信支付
    wxPay: function () {
        var _this = this;
        var openId = _this.data.openId;
        var orderNo = '' ;
        if(_this.data.buyNow){
            var order = wx.getStorageSync('buyNowData') || ''; //待付款订单 立即支付时会存在本地
            orderNo = order.orderNo || '';
        }
        var data = {
            totalFee: _this.data.orderInfo.totalPrice,
            openId: openId,
            sendMssageOpenId: openId,
            sendMessageFormId: _this.data.formId,
            payType: 106,
            customerSeq: _this.data.customerInfo.customerSeq,
            bid: 1,
            orderNo: orderNo,
            number: _this.data.orderInfo.num,
            deliveryAddr: _this.data.address.province + _this.data.address.addr,
            consigneeMobile: _this.data.address.phone,
            consigneePerson: _this.data.address.consignee,
            remarks: _this.data.remarks,
        }
        if (_this.data.voiceType.id != 0) {
            data.invoiceSeq = _this.data.invoiceSeq;
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
                    var timestamp = Date.parse(new Date());
                    wx.requestPayment({
                        'timeStamp': res.data.timeStamp,
                        'nonceStr': res.data.nonceStr,
                        'package': res.data.packagePrepay_id,
                        'signType': 'MD5',
                        'paySign': res.data.paySign,
                        'success': function (res) {
                            _this.clearData();
                        },
                        'fail': function (res) {
                            if (_this.data.buyNow) {
                                wx.navigateBack({
                                    delta: 1,
                                })
                            } else {
                                wx.redirectTo({
                                    url: '/pages/share-bottle-order/share-bottle-order?_' + timestamp
                                })
                            }
                        }
                    })
                }
            },
        })
    },
    //取消输入支付密码
    closePayPassword: function () {
        this.setData({
            openPayPassword: false,
            payLength: 0,
            payPassword: ""
        })
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
        this.setData({
            payLength: e.detail.value.length,
            payPassword: e.detail.value
        })
        if (that.data.payTime) return;
        if (e.detail.value.length == 6) {
            that.setData({
                payTime: true,
            })
            var openId = that.data.openId;
            var formId = that.data.formId;
            var data = {
                apiname: 'walletPay',
                customerSeq: wx.getStorageSync('customerInfo').customerSeq,
                payType: 106,
                bid: 1, //目前传固定参数1
                number: that.data.orderInfo.num,
                deliveryAddr: that.data.address.province + that.data.address.addr,
                consigneeMobile: that.data.address.phone,
                consigneePerson: that.data.address.consignee,
                sendMssageOpenId: openId,
                sendMessageFormId: formId,
                remarks: that.data.remarks,
            };
            if (that.data.buyNow) {
                var order = wx.getStorageSync('buyNowData') || ''; //待付款订单 立即支付时会存在本地
                data.orderNo = order.orderNo;
            }
            if (that.data.voiceType.id != 0) {
                data.invoiceSeq = that.data.invoiceSeq;
            }
            if (that.data.orderNo) {
                data.orderNo = that.data.orderNo;
            }
            data.passWord = md5.hexMD5(that.data.payPassword);
            request.getData(data, function (res) {
                if (res.data.state == 1) {
                    app.showToastMsg(0, '支付成功');
                    that.clearData();
                } else {
                    app.showToastMsg(-1, res.data.message);
                    that.setData({
                        payLength: 0,
                        payPassword: "",
                        payTime: false,
                    })
                }
            }, that)
        }
    },

    //支付成功后 清空上个页面的数据
    clearData: function () {
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];
        prevPage.setData({
            bottleNum: 1,//默认是1份
            price: 6,//1份单价默认6元
            totalPrice: '6.00',//默认1份 即 6元
        })
        if (this.data.buyNow) {
            var pages = getCurrentPages();
            if (pages.length > 1) {
                //上一个页面实例对象
                var prePage = pages[pages.length - 2];
                prePage.setData({
                    activeIndex:  1,
                });
                prePage.onLoad();
            }
            setTimeout(function(){
                wx.navigateBack({
                    delta: 1,
                })
            },500)
        } else {
            wx.redirectTo({
                url: '/pages/share-bottle-order/share-bottle-order?type=1'
            })
        }
    },

    inputHeadContent: function (e) {
        this.setData({
            invoiceHeadContent: e.detail.value,
        })
    },

    inputInvoiceNumber: function (e) {
        this.setData({
            identificationNumber: e.detail.value,
        })
    },

    inputRemarks: function (e) {
        this.setData({
            remarks: e.detail.value,
        })
    },
})