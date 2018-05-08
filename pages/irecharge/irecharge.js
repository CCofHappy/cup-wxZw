var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customerInfo: {},
  },
  onLoad: function (options) {
    this.setData({
      customerInfo: wx.getStorageSync('customerInfo')
    })
  },
  paySubmit:function(e){
    var that = this;
    var openid = wx.getStorageSync("openId");
    if (parseInt(e.detail.value.money)){
      var param = {
        totalFee: parseInt(e.detail.value.money),
        openId: openid,
        payType: 103,
        customerSeq: that.data.customerInfo.customerSeq,
      }
      wx.request({
        url: app.globalData.weixin + 'miniPay',
        data: param,
        method: 'post',
        header: {
          "content-type": "application/json"
        },
        success: function (res) {
          var prepay_id = res.data.packagePrepay_id.split("=")[1];
          var balance = res.data.balance;
          wx.requestPayment({
            'timeStamp': res.data.timeStamp,
            'nonceStr': res.data.nonceStr,
            'package': res.data.packagePrepay_id,
            'signType': 'MD5',
            'paySign': res.data.paySign,
            'success': function (res) {
              //充值通知
              var timestamp = new Date().getTime();
              var nowTime = util.toDate(timestamp, 5);
              message.hide.call(that)
              var data = {
                apiname: 'weixin/sendMsg',
                "touser": openid,
                "template_id": "0T9HrcCMtztN2_CSzEzidIJqjKXYvPocxK5xX0g8hd8",
                "form_id": prepay_id,
                "page": "pages/mine-finance/mine-finance",
                "data": [
                  {
                    "value": "微信支付",
                    "color": "#173177"
                  },
                  {
                    "value": nowTime,
                    "color": "#173177"
                  },
                  {
                    "value": param.totalFee + "元",
                    "color": "#173177"
                  },
                  {
                    "value": balance + "元",
                    "color": "#173177"
                  },
                  {
                    "value": "中威网",
                    "color": "#173177"
                  },
                ],
              }
              request.getData(data, function (res) {}, that)
              wx.navigateBack({
                delta: 1,
              })
            },
            'fail': function (res) { }
          })
        }
      })
    }else{
      app.showToastMsg(-1,'请输入充值金额')
    }
  }
})