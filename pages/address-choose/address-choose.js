// address-choose.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
Page({
  data: {
    customerInfo: {},
    addressList: {},
    nullTip: {
      tipText: '数据加载中...',
    }
  },
  onLoad: function (options) {
    var that = this;
    //更新数据
    that.setData({
      customerInfo: wx.getStorageSync('customerInfo'),
    })
  },
  onShow: function () {
    this.initData();
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
        var addressId = wx.getStorageSync('addressId')
        if (addressId){
          for(var i=0;i<data.length;i++){
            if (data[i].deliveryAddrSeq == addressId){
              data[i].choose = 'choose';
            }
          }
        }else{
          data[0].choose = 'choose';
        }
        that.setData({
          addressList: data
        })
      } else {
        that.setData({
          nullTip: {
            tipText: '您还没有设置收货地址'
          }
        })
      }
    }, that)
  },

  //选择收货地址
  chooseAddress: function(e){
    var id = e.target.id;
    var addressList = this.data.addressList;
    var deliveryAddrSeq = this.data.addressList[id].deliveryAddrSeq;
    for (var i = 0; i < addressList.length;i++){
      if (i == id){
        addressList[i].choose = 'choose';
      }else{
        addressList[i].choose = '';  
      }
    }
    this.setData({
      addressList: addressList,
    })
    wx.setStorageSync("addressId", deliveryAddrSeq)
    wx.navigateBack({
      delta:1,
    })
  }
})