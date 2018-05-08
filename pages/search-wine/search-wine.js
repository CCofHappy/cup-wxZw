// pages/search-wine/search-wine.js
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
        searchValue: "",
        searchList:[],
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onShow: function (options) {
       this.setData({
           searchList:wx.getStorageSync('searchList'),
       }) 
    },

   
    searchInput: function(e){
        var value = e.detail.value
        this.setData({
            searchValue: value,
        })
    },

    searchBtn:function(){
        if (this.data.searchValue){
            var searchValue = this.data.searchValue;
            wx.navigateTo({
                url: '/pages/search-wine-result/search-wine-result?value=' + searchValue,
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { },
            })
            var searchList = wx.getStorageSync('searchList') ? wx.getStorageSync('searchList') : [];
            for (var i = 0; i < searchList.length; i++) {
                if (searchList[i] == searchValue) {
                    searchList.splice(i, 1);
                }
            }
            if (searchList.length < 6) {
                searchList.push(searchValue)
            } else {
                searchList.splice(0, 1);
                searchList.push(searchValue)
            }
            wx.setStorageSync('searchList', searchList);
            this.setData({
                searchList: wx.getStorageSync('searchList'),
            })
        } 
    },

    searchDelete: function(){
        wx.removeStorageSync('searchList');
        this.setData({
            searchList: wx.getStorageSync('searchList'),
        })
    },

})