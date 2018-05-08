// pages/search-wine-result/search-wine-result.js
var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrl: app.globalData.imagePath,
        hasMore: true,
        searchList:"",
        addWineOpen: false,
        brand:"",
        name:"",
        strength:"",
        start:1,
        count: 10,
        showLoading: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            searchValue: options.value
        });
        this.initData();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.showLoading) return;
        this.initData();
    },

    initData:function(){
        var that = this;
        that.setData({
            showLoading: true,
        });
        var params = {
            apiname: 'bbs/post/assess/queryProductByName',
            name: that.data.searchValue ,
            page: that.data.start,
            rows: that.data.count,
        }
        request.getData(params, function (res) {
            if (res.data.state == 1) {
                var searchList = res.data.data.data.records;
                if (params.page == 1) {//只有初始化时时 需要重置
                    that.setData({
                        searchList: searchList,
                        nullTip: {
                            tipText: '暂无相关酒款'
                        },
                    });
                }
                if (searchList.length ==0) {
                    that.setData({
                        hasMore: false
                    })
                } else {
                    if (searchList.length < params.rows) {
                        that.setData({
                            hasMore: false
                        })
                    }
                    if (params.page != 1) {
                        that.setData({
                            searchList: that.data.searchList.concat(searchList),
                        })
                    }
                    that.setData({
                        //每次查询之后 将页码+1
                        start: that.data.start + 1,
                    })
                }
                that.setData({
                    showLoading: false
                });
            } else {
                that.setData({
                    nullTip: {
                        tipText: '数据加载失败...'
                    },
                    showLoading: false
                });
            }
        }, that ,"GET")
    },

    openAddWine:function(){
        this.setData({
            addWineOpen: true,
        })
    },

    closeAddWine: function () {
        this.setData({
            addWineOpen: false,
        })
    },

    brandInput: function(e){
        this.setData({
            brand: e.detail.value,
        })
    },

    nameInput: function (e) {
        this.setData({
            name: e.detail.value,
        })
    },

    strengthInput: function (e) {
        this.setData({
            strength: e.detail.value,
        })
    },

    addWine: function(){
        if (!this.data.brand || !this.data.name || !this.data.strength) {
            app.showToastMsg(-1, '请填写酒款信息')
            return;
        }
        if (parseFloat(this.data.strength) >= 100) {
            app.showToastMsg(-1, '酒精度大于100')
            return;
        }
        var wineDetail={
            brand: this.data.brand,
            name: this.data.name,
            strength: this.data.strength+"%",
        }
        wx.setStorageSync('wineDetail', wineDetail)
        wx.navigateBack({
            delta: 2
        })
    },

    chooseWine: function(e){
        var item = e.currentTarget.dataset.item;
        var wineDetail = {
            image: item.image,
            brand: item.brandName,
            name: item.fullName,
            strength: item.strength,
            productId: item.id,
        }
        wx.setStorageSync('wineDetail', wineDetail)
        wx.navigateBack({
            delta: 2
        })
    }

})