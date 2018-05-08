var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    //页面的初始数据
    data: {
        imgUrl: app.globalData.imagePath,
        headerImgs: [app.globalData.imagePath +'default/default@5x3.png'],
        bottleInfo: '',
        animationData: '',
        showModalStatus: false,
        bottleNum:1,//默认是1份
        price: 6.00,//1份单价默认6元
        totalPrice:'6.00',//默认1份 即 6元
        customerInfo: wx.getStorageSync('customerInfo'),
        nullTip: {
            tipText: '数据加载中...'
        }
    },

     //生命周期函数--监听页面加载
    onLoad: function (options) {
        app.getUserInfo();
        this.initData();
    },
    //initData 初始化详情信息
    initData: function(){
        var _this = this;
        var params = {
            apiname:'bbs/bottle/queryBbsBottleById',
            bid: 1
        }
        message.hide.call(_this);
        request.getData(params, function (res) {
            var data = res.data.data
            for(var i in data.bottleType){ //价格取小数点后一位
                data.bottleType[i].price = parseFloat(data.bottleType[i].price).toFixed(1);
            }
            var  btInfo = {
                name: data.name,
                desc: data.countent,
                secs: data.bottleType,
                deatails: data.imgs,
                capacity: data.capacity,
                color: data.colour,
                diameter: data.diameter,
                height: data.height,
                inside: data.inside,
                outside: data.outside,
                remarks: data.remarks,
                thickness: data.thickness,
                weight: data.weight,
                material: data.material
            }
            _this.setData({
                bottleInfo: btInfo,
                headerImgs: data.headImg,
            })
        },_this)
    },
    //用户点击右上角分享
    onShareAppMessage: function () {

    },
    //gotoOrder 跳往我的订单
    gotoOrder: function(){
        if (!app.checkLogin()) return;
        wx.navigateTo({
            url: '/pages/share-bottle-order/share-bottle-order'
        })
    },

    /**
     * 我要购买
     */
    gotoBuy: function () {
        if (!app.checkLogin()) return;
        this.showModal();
    },
    //右边 + 点击事件
    addBottle:function(){
        var num = parseInt(parseInt(this.data.bottleNum) + 1);
        this.getTotalPrice(num);
    },
    //左边 - 点击事件
    plusBottle: function () {
        var num = parseInt(this.data.bottleNum);
        if(num == 1) return; //购买数量不能小于1
        this.getTotalPrice(num-1);
    },
    //计算总价
    getTotalPrice: function(num){
        var amount = 6;
        if (num >= 1 && num < 50) {
            amount = 6;
        }
        if (num >= 50 && num < 200) {
            amount = 5.8;
        }
        if (num >= 200) {
            amount = 5.5;
        }
        this.setData({
            bottleNum: num,
            price: parseFloat(amount).toFixed(2),
            totalPrice: parseFloat(num * amount).toFixed(2)
        });
    },
    //手动输入 需要购买的数量
    changeNum: function (event){
        var val = event.detail.value;
        if (val <= 0 ){ //输入的
            this.getTotalPrice(1);
        }else{
            this.getTotalPrice(val);
        }
    },
    //确认购买
    confirmBuy:function(){
        var _this = this;
        if (!app.checkLogin()) return;
        _this.hideModal();
        wx.navigateTo({
            url: '/pages/share-bottle-orderConfirm/share-bottle-orderConfirm?num=' + _this.data.bottleNum+'&price='+ _this.data.price
        })
    },
    //弹出对话框
    showModal: function () {
        //弹出对话框后 将page overflow设置为hidde
        // 显示遮罩层
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        })
        this.animation = animation
        animation.translateY(300).step()
        this.setData({
            animationData: animation.export(),
            showModalStatus: true
        })
        setTimeout(function () {
            animation.translateY(0).step()
            this.setData({
                animationData: animation.export(),
            })
        }.bind(this), 200)
    },
    //隐藏对话框
    hideModal: function () {
        // 隐藏遮罩层
        var animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        })
        this.animation = animation
        animation.translateY(300).step()
        this.setData({
            animationData: animation.export(),
        })
        setTimeout(function () {
            animation.translateY(0).step()
            this.setData({
                animationData: animation.export(),
                showModalStatus: false
            })
        }.bind(this), 200)
    }
})