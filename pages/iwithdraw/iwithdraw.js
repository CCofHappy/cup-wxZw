// iwithdraw.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
var md5 = require('../../utils/md5.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    balance: 0,
    toMore: true,
    getMoney: "",
    bankFirst: false,
    bankInfo: {},
    bankInfoOpen: true,
    listOpen: "",
    getAllMoney: "",
    payFocus: true,
    payLength: 0,
    openPayPassword: false,
    payPassword: "",
    formdata: {},
    payTime: false,
  },
  onLoad: function (options) {
    var that = this;
    message.hide.call(that);
    var params ={
      apiname: "person/withdraw/" + wx.getStorageSync('customerInfo').customerSeq,
    }
    request.getData(params, function (res) {
      if(res.data.state==1){
        var balance = res.data.data.balance;
        var charge = (balance * 0.008) > 1 ? (balance * 0.008) : 1;
        var getAllMoney = 0
        if ((balance - charge) > 0) {
          getAllMoney = Number((balance - charge).toFixed(2));
        } 
        that.setData({
          balance: res.data.data.balance,
          getAllMoney: getAllMoney,
        })
      } else {
        app.showToastMsg(-1, '数据加载失败');
      }
    }, that, 'get');

    var bankParams = {
      apiname: "person/queryBankByCustomerSeq/" + wx.getStorageSync('customerInfo').customerSeq, 
    }
    request.getData(bankParams, function (res) {
      if(res.data.state==1){
        if (res.data.data) {
          var data = res.data.data
          data.bankCardSmall = data.bankCard.substr(data.bankCard.length - 4);
          that.setData({
            bankInfo: data,
            bankInfoOpen: true,
            bankFirst: true,
          })
        } else {
          that.setData({
            bankInfoOpen: false,
          })
        }
      }else{
        app.showToastMsg(-1, '数据加载失败');
      }
    }, that, 'get')
  },

  //提现提交
  iwithdrawSubmit: function(e){
    var that = this;
    that.setData({
      formId: e.detail.formId,
    })
    var formdata = e.detail.value;
    var drawMoney = formdata.drawMoney;
    var bankCardNo = formdata.bankCardNo;
    var bankName = formdata.bankName;
    var accountName = formdata.accountName;
    formdata.customerSeq = wx.getStorageSync('customerInfo').customerSeq;
    if (!bankName) {
      app.showToastMsg(-1, '请输入银行名称');
      return;
    }
    if (!bankCardNo) {
      app.showToastMsg(-1, '请输入银行卡号');
      return;
    }
    if (!accountName) {
      app.showToastMsg(-1, '请输入账户名');
      return;
    }
    if (drawMoney <= 0 || !drawMoney) {
      app.showToastMsg(-1, '提现金额有误');
      return;
    }
    if (drawMoney > this.data.getAllMoney) {
      app.showToastMsg(-1, '输入的金额超过可用金额');
      return;
    }
    var rep = /[\.]/;
    if (rep.test(drawMoney)) {
      var reg = /^(([1-9]+)|([0-9]+\.[0-9]{1,2}))$/;
      if (!reg.exec(drawMoney)) {
        app.showToastMsg(-1, '提现金额只能精确到小数点后两位');
        return;
      };
    }
    if (that.data.getAllMoney == drawMoney){
      formdata.drawMoney = this.data.balance;
    }
    formdata.apiname= "person/withdraw";
    that.setData({
      formdata: formdata,
      openPayPassword: true,
    })
  },

  //全部提现
  allBtn: function(){
    this.setData({
      getMoney: this.data.getAllMoney,
    })
  },

  //输入提现金额
  getMoneyInput:function(e){
    var that = this;
    var value = e.detail.value;
    var toMore= true;
    var balance = this.data.balance;
    var charge = (this.data.balance * 0.008) > 1 ? (this.data.balance * 0.008) : 1;
    var getAllMoney = Number((balance - charge).toFixed(2));
    if (value.toString().split(".")){
      if (value.toString().split(".").length>2){
        value = that.data.getMoney;  
      }
    }
    if (value.toString().split(".")[1]){
      if (value.toString().split(".")[1].length>2) {
        value = that.data.getMoney;   
      }
    }
    if (Number(value) > getAllMoney && Number(value)) {
      toMore = false;
    }
    this.setData({
      toMore: toMore,
      getMoney: value,
    })
  },

  //修改银行卡信息
  bankInfoOpen: function(){
    var that = this;
    var open = that.data.bankInfoOpen?false:true;
    var listOpen = open ? "" :"open";
    that.setData({
      bankInfoOpen: open,
      listOpen: listOpen,
    })
  },

  //修改银行名称
  bankNameInput: function(e){
    var bankInfo = this.data.bankInfo;
    bankInfo.bankName = e.detail.value;
    this.setData({
      bankInfo: bankInfo,
    })
  },

  //修改银行卡号
  bankCardNoInput: function (e) {
    var value = e.detail.value;
    var bankInfo = this.data.bankInfo;
    bankInfo.bankCard = e.detail.value;
    if (value.length>4){
      bankInfo.bankCardSmall = value.substr(value.length - 4);
    }else{
      bankInfo.bankCardSmall = value;
    }
    this.setData({
      bankInfo: bankInfo,
    })
  },

  //修改支行名称
  bankBranchNameInput: function(e){
    var bankInfo = this.data.bankInfo;
    bankInfo.subbranch = e.detail.value;
    this.setData({
      bankInfo: bankInfo,
    })
  },

  //修改开户人姓名
  accountNameInput: function(e){
    var bankInfo = this.data.bankInfo;
    bankInfo.accountName = e.detail.value;
    this.setData({
      bankInfo: bankInfo,
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
    if(that.data.payTime)return;
    if (e.detail.value.length == 6) {
      that.setData({
        payTime: true,
      }) 
      var formdata = that.data.formdata;
      formdata.tradePwd = md5.hexMD5(that.data.payPassword);
      formdata.bankSeq = that.data.bankInfo.bankSeq;
      request.getData(formdata, function (res) {
        var res = res.data;
        if (res.state == 1) {
          app.showToastMsg(0, '提现申请成功');
          that.setData({
            openPayPassword: false,
            payLength: 0,
            payPassword: ""
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
          //提现通知
          var openid = wx.getStorageSync("openId");
          var timestamp = new Date().getTime() ;
          var nowTime = util.toDate(timestamp,5);
          message.hide.call(that)
          var data = {
            apiname: 'weixin/sendMsg',
            "touser": openid,
            "template_id": "javYaltKFtV0r2q9i40Zrr9VkZ4ckf66E3oyQilgXAA",
            "form_id": that.data.formId,
            "page": "pages/mine-finance/mine-finance",
            "data": [
              {
                "value": that.data.getMoney + "元",
                "color": "#173177"
              },
              {
                "value": nowTime,
                "color": "#173177"
              },
              {
                "value": formdata.accountName,
                "color": "#173177"
              },
              {
                "value": formdata.bankName,
                "color": "#173177"
              },
              {
                "value": formdata.bankCardNo,
                "color": "#173177"
              },
              {
                "value": "两个工作日",
                "color": "#173177"
              },
              {
                "value": "0.8%",
                "color": "#173177"
              },
              {
                "value": that.data.getMoney + "元",
                "color": "#173177"
              }
            ],
          }
          request.getData(data, function (res) {
          }, that)
        } else if (res.state == -1) {
          app.showToastMsg(-1, '请先登录');
          wx.navigateTo({
            url: '/pages/login/login',
          })
        } else if (res.state == 0) {
          app.showToastMsg(-1, res.message);
          that.setData({
            payLength: 0,
            payPassword: "",
            payTime: false,
          })
        } else {
          app.showToastMsg(-1,'提现申请失败');
          that.setData({
            openPayPassword: false,
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
  }
})