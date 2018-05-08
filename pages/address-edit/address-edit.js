// address-edit.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
Page({
    data: {
        customerInfo: {},
        addressInfo: {},
        animationData: {},
        addressShadow: "none",
        provinceVal: "",
        province: [],
        city: [],
        county: [],
        provinceCode: '',
        cityCode: '',
        countyCode: '',
    },
    onLoad: function (options) {
        var that = this;
        //更新数据
        that.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
            deliveryAddrSeq: options.id,
        })

        //获取收货地址信息
        var data = {
            apiname: 'person/findByDeliveryAddr/' + options.id,
        }
        request.getData(data, function (res) {
            that.setData({
                addressInfo: res.data.data,
                provinceVal: res.data.data.province,
                provinceCode: res.data.data.pCode,
                cityCode: res.data.data.cCode,
                countyCode: res.data.data.dCode,
            })
        }, that)

        //请求获取地区信息
        wx.request({
            url: app.globalData.addreessPath,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                var data = res.data;
                var addressArray = [];
                for (var i in data) {
                    addressArray[data[i].areacode] = data[i].kid;
                }
                app.globalData.areaJson = addressArray;
                that.setData({
                    province: addressArray[0],
                    city: addressArray[addressArray[0].areacode[0]],
                    county: addressArray[addressArray[addressArray[0].areacode[0]].areacode[0]]
                })
            }
        })
    },
    //地区选择数据修改绑定
    bindChange: function (e) {
        var that = this;
        var addressArray = app.globalData.areaJson;
        const val = e.detail.value;
        var provinceVal = addressArray[0].areaname[val[0]],
            cityVal = addressArray[addressArray[0].areacode[val[0]]].areaname[val[1]],
            countyVal = addressArray[addressArray[addressArray[0].areacode[val[0]]].areacode[val[1]]].areaname[val[2]];
        that.setData({
            city: addressArray[addressArray[0].areacode[val[0]]],
            county: addressArray[addressArray[addressArray[0].areacode[val[0]]].areacode[val[1]]],
            provinceVal: provinceVal + ' ' + cityVal + ' ' + countyVal,
            provinceCode: addressArray[0].areacode[val[0]],
            cityCode: addressArray[addressArray[0].areacode[val[0]]].areacode[val[1]],
            countyCode: addressArray[addressArray[addressArray[0].areacode[val[0]]].areacode[val[1]]].areacode[val[2]]
        })
    },

    //打开地区选择
    openAddressBox: function () {
        var that = this;
        if (!that.data.provinceVal) {
            var addressArray = app.globalData.areaJson;
            var provinceVal = addressArray[0].areaname[0],
                cityVal = addressArray[addressArray[0].areacode[0]].areaname[0],
                countyVal = addressArray[addressArray[addressArray[0].areacode[0]].areacode[0]].areaname[0];
            that.setData({
                provinceVal: provinceVal + ' ' + cityVal + ' ' + countyVal,
                provinceCode: addressArray[0].areacode[0],
                cityCode: addressArray[addressArray[0].areacode[0]].areacode[0],
                countyCode: addressArray[addressArray[addressArray[0].areacode[0]].areacode[0]].areacode[0]
            })
        }
        var animation = wx.createAnimation({
            duration: 200,
        })
        animation.bottom("0").step();
        this.setData({
            animationData: animation.export(),
            addressShadow: "block",
        })
    },

    //关闭地区选择
    closeAddressBox: function () {
        var animation = wx.createAnimation({
            duration: 200,
        })
        animation.bottom("-600rpx").step();
        this.setData({
            animationData: animation.export(),
            addressShadow: "none",
        })
    },

    //提交保存收货地址
    formSubmit: function (e) {
        var that = this
        var val = e.detail.value;
        if (!val.consignee) {
            app.showToastMsg(-1, '请填写姓名')
            return;
        }
        if (!val.phone) {
            app.showToastMsg(-1, '请填写手机号')
            return;
        }
        if (!(/^1[34578]\d{9}$/.test(val.phone))) {
            app.showToastMsg(-1, '手机号码不正确')
            return;
        }
        if (!val.province) {
            app.showToastMsg(-1, '请选择所在地区')
            return;
        }
        if (!val.addr) {
            app.showToastMsg(-1, '请填写详细地址')
            return;
        }
        message.hide.call(that)
        var data = val;
        data.apiname = 'person/editDeliveryAddr';
        data.customerSeq = that.data.customerInfo.customerSeq;
        data.pCode = that.data.provinceCode;
        data.cCode = that.data.cityCode;
        data.dCode = that.data.countyCode;
        data.deliveryAddrSeq = that.data.deliveryAddrSeq;
        data.flag = that.data.addressInfo.flag;
        request.getData(data, function (res) {
            app.showToastMsg(0, '修改成功')
            setTimeout(function () {
                wx.navigateBack({
                    delta: 1
                })
            }, 1000)
        }, that)
    },
})