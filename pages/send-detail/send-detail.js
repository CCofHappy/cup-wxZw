var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    data: {
        imgUrl: app.globalData.imagePath,
        customerInfo: {},
        snedDetail: '',
        snedRecord: '',
        sendSeq: 0,
        showLoading: true,
        id: 0,
        nullTip: {
            tipText: '数据加载中...'
        },
        openExpress: false,
        expressName: '',
        expresscode: '',
        expressNum: '',
        expressInpt: true,//默认是邮寄方式，单号输入框展示  added by chenggf 2017-11-15
    },
    onLoad: function (options) {
        //更新数据
        this.setData({
            sendSeq: options.sendSeq,
            id: options.id
        })
    },

    onShow: function () {
        //更新数据
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
        })
        this.initData()
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.setData({
            showLoading: true,
            nullTip: {
                tipText: '数据加载中...'
            }
        })
        this.initData();
    },

    initData: function () {
        //初始化页面
        var that = this;
        message.hide.call(that);
        if (!app.checkLogin()) return;
        var loginCust = that.data.customerInfo.customerSeq;
        var params = {
            apiname: 'person/getSendVerify',
            customerSeq: loginCust,
        }
        if (that.data.id != 0 && that.data.id != "null") {
            params.auctionGoodsSeq = that.data.id;
        } else {
            params.auctionGoodsSendSeq = that.data.sendSeq;
        }
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                var sendDetail = res.data.data.send;
                //拍品所属客户与登录进的用户是同一个人时，不允许查看叫价记录
                if (loginCust == sendDetail.customerSeq){ 
                    sendDetail.showBtn = false;
                }else{
                    sendDetail.showBtn = true;
                }
                var snedRecord = res.data.data.list;
                sendDetail.sendTime = util.toDate(sendDetail.sendTime, 2)
                sendDetail.showTime = util.toDate(sendDetail.showTime, 2)
                sendDetail.startTime = util.toDate(sendDetail.startTime, 2)
                sendDetail.endTime = util.toDate(sendDetail.endTime, 2)
                for (var i = 0; i < snedRecord.length; i++) {
                    snedRecord[i].updatDate = util.toDate(snedRecord[i].updatDate, 1)
                }
                that.setData({
                    showLoading: false,
                    snedDetail: sendDetail,
                    snedRecord: snedRecord
                })
            } else {
                that.setData({
                    showLoading: false,
                    nullTip: {
                        tipText: '数据加载失败'
                    },
                })
            }
        }, that)
    },

    fillExpress: function () {
        this.setData({
            openExpress: true,
            expressInpt: true,
        })
    },

    expressInput: function (e) {
        var that = this;
        message.hide.call(that);
        var value = e.detail.value
        that.setData({
            expressNum: value,
            expressName: '',
            expressCode: '',
        })
        that.getExpressCompany(value);
    },
    //确定发货 提交
    expressEnter: function () {
        var that = this;
        var expressName = that.data.expressName,
            expressCode = that.data.expressCode,
            expressNum = that.data.expressNum,
            expressInpt = that.data.expressInpt;
        if (expressInpt) {//只有邮寄时 需校验；线下送货无需校验
            if (!expressNum) {
                app.showToastMsg(-1, '请输入物流单号');
                return;
            }
            if (!expressCode) {
                expressName = '';
            }
        }
        message.hide.call(that);
        var params = {
            apiname: 'person/addExpress',
            "num": expressNum,
            "comCode": expressCode,
            "comName": expressName,
            "auctionGoodsSendSeq": that.data.sendSeq,
            "customerSeq": that.data.customerInfo.customerSeq,
        }
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                app.showToastMsg(0,'操作成功')
                that.setData({
                    openExpress: false,
                })
                that.initData();
            } else {
                app.showToastMsg(-1, res.data.message)
            }
        }, that)
    },
    expressCancel: function () {
        this.setData({
            openExpress: false,
            expressName: '',
            expresscode: '',
            expressNum: '',
        })
    },
    //切换寄货方式
    radioChange: function (e) {
        var flg = true;
        if (e.detail.value == 1) {
            flg = true;
        } else {
            flg = false;
        }
        this.setData({
            expressInpt: flg,
            expressName: '',
            expresscode: '',
            expressNum: ''
        });
    },
    //获取物流公司
    getExpressCompany: function (val) {
        var that = this;
        var params = {
            apiname: 'person/getAutoKD',
            express: val,
        }
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                var expressName = '';
                var expressCode = '';
                if (res.data.data.list.length > 0) {
                    expressName = res.data.data.list[0].comName ? res.data.data.list[0].comName : "";
                    expressCode = res.data.data.list[0].comCode ? res.data.data.list[0].comCode : "";
                }
                that.setData({
                    expressName: expressName,
                    expressCode: expressCode,
                })
            } else {
                app.showToastMsg(-1, res.data.message);
                that.setData({
                    expressNum: ''
                })
            }
        }, that)
    },
    //扫码
    scanExpress:function(e){
        var _this = this;
        wx.scanCode({
            onlyFromCamera: true,
            success: function(res){
                var val = res.result
                if(!val) return;
                _this.getExpressCompany(val);
                _this.setData({
                    expressNum: val
                })
            }
        })
    }
})
