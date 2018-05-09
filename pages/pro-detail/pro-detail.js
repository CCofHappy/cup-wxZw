var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')
Page({
    data: {
        imgUrl: app.globalData.imagePath,
        customerInfo: {},
        proImg: [],
        imgCount: 0,
        proDetail: {},
        auctionGoodsSeq: '',
        auctionSessionSeq: '',
        proTime: {},
        priceData: {},
        callPriceOpen: "",
        oneHandOpen: "",
        callPriceInfo: {},
        oneHandPrice: true,
        oneHandParam: "",
        favorite: false,
        bond: false,
        setIntervalTime: "",
        showLoading: true,
        navbarDetail: "action",
        navbarBond: "",
        navbarSale: "",
        swiperHeight: 0,
        booked: false,
        bookedType: '',
        bookedCount: 1,
        privatelyPrice: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        var scene = decodeURIComponent(options.scene)
        var id = "", sessionId="";
        if(scene){//表明是扫码进入详情页
            var params = scene.split(',');
            id = params[0];
            sessionId = params[1];
        }
        if (scene == 'undefined'){//正常进入详情页
            id = options.id;
            sessionId = options.sessionId;
        }
        //更新数据
        that.setData({
            auctionGoodsSeq: id,
            auctionSessionSeq: sessionId
        })
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    swiperHeight: res.windowWidth
                });
            }
        });
    },

    //展开保证金或出价规则
    openRule: function (e) {//展开保证金规则
        var id = e.target.id;
        var open = '';
        if(id == 1){
            open = this.data.checkOne == 'open' ? '' : 'open';
            this.setData({
                checkOne: open
            });
        }else{
            open = this.data.checkTwo == 'open' ? '' : 'open';
            this.setData({
                checkTwo: open
            });
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo'),
        })
        this.initData();
    },

    /**
     * 转发页面
     */
    onShareAppMessage: function (res) {
        var that = this;
        var title = that.data.proDetail.auctionGoodsName,
            state = that.data.proDetail.state;
        if (state == 2) {
            title += ' 拍卖即将开始 起拍价:' + that.data.proDetail.qiPaiJia;
        }
        if (state == 3) {
            title += ' 拍卖火热进行中 当前价:' + that.data.proDetail.currPrice + ' 起拍价:' + that.data.proDetail.qiPaiJia;
        }
        if (state == 4) {
            title += ' 成交价:￥' + that.data.proDetail.currPrice;
        }
        if (state == 5) {
            title += ' 已流拍 ' + that.data.proDetail.auctionGoodsEName || '';
        }
        if (res.from === 'button') { }
        return {
            title: title,
            path: '/pages/pro-detail/pro-detail?id=' + that.data.proDetail.auctionGoodsSeq + '&sessionId=' + that.data.proDetail.auctionSessionSeq,
            success: function (res) { },
            fail: function (res) { }
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        var that = this;
        that.setData({
            showLoading: true,
        })
        that.initData();
    },

    //去交保证金
    paybond: function () {
        var that = this;
        if (that.data.showLoading) return;
        if (!app.checkLogin()) return;//校验登录
        if (that.checkCustPro()) return;
        that.setData({
            showLoading: true,
        })
        wx.navigateTo({
            url: '/pages/pay-deposit/pay-deposit?id=' + that.data.proDetail.auctionGoodsSeq + '&sessionId=' + that.data.proDetail.auctionSessionSeq
        })
    },

    //校验操作用户是否与参与的拍品的所属客户是同一个人
    //同一个人不允许操作
    checkCustPro: function () {
        var that = this
        var itemCustseq = that.data.proDetail.customerSeq || ' '
        var loginCustseq = that.data.customerInfo.customerSeq
        if (loginCustseq == itemCustseq) {
            app.showToastMsg(-1, '送拍者不可叫价');
            return true;
        }
        return false;
    },

    initData: function () {
        //初始化页面
        var that = this;
        message.hide.call(that);
        var data = {
            apiname: 'auction/watchAuctionInfo',
            customerSeq: that.data.customerInfo.customerSeq,
            auctionGoodsSeq: that.data.auctionGoodsSeq,
            auctionSessionSeq: that.data.auctionSessionSeq
        }
        request.getData(data, function (res) {
            if (res.data.state == 1) {
                var data = res.data.data;
                var metaData = data.AuctionInfo;
                if (metaData.goodsDesc) {
                    metaData.goodsDesc = metaData.goodsDesc.split(",");
                }
                metaData.referencePriceMinNum = metaData.referencePriceMin;
                metaData.referencePriceMaxNum = metaData.referencePriceMax;
                //防止数字过大 在前端页面展示换行
                if (metaData.referencePriceMin > 9999){
                    metaData.referencePriceMin = metaData.referencePriceMin /10000+'万';
                }
                if (metaData.referencePriceMax > 9999){
                    metaData.referencePriceMax = metaData.referencePriceMax/10000+'万';
                }
                that.setData({
                    proImg: metaData.auctionGoodsIcons,
                    proDetail: metaData,
                    showLoading: false,
                });
                var serverTime = util.getServerTime();//获取服务器时间
                var countTime = 0;//根据拍品状态获取开始时间或结束时间
                var countPro = 0;//倒计时剩余时间
                if (data.AuctionInfo.state == 2) {
                    countTime = data.AuctionInfo.startTime
                } else if (data.AuctionInfo.state == 3) {
                    countTime = data.AuctionInfo.endTime
                }
                countPro = countTime - serverTime;

                //清除之前的倒计时
                if (that.data.setIntervalTime) {
                    clearInterval(that.data.setIntervalTime);
                }
                //执行倒计时
                if (countPro>0){
                    var setIntervalTime = setInterval(function () {
                        if (countPro < 0) {
                            that.setData({
                                auctionTime: '',
                            })
                            clearInterval(that.data.setIntervalTime);
                            that.initData();
                        } else {
                            countPro = countPro - 1000;
                            that.setData({
                                proTime: util.countDown(countPro),
                            })
                        }
                    }, 1000);
                    //记录倒计时编号
                    that.setData({
                        setIntervalTime: setIntervalTime
                    })
                }  
            } else {
                that.setData({
                    showLoading: false,
                });
                app.showToastMsg(-1,'数据加载失败')
            }
        }, that)

        if (!wx.getStorageSync('customerInfo').etoken)return;
        //判断是否收藏拍品
        var favorite = data;
        favorite.apiname = 'person/isNotFavorite';
        request.getData(favorite, function (res) {
            if (res.data.state == 1) {
                that.setData({
                    favorite: true
                })
            } else {
                that.setData({
                    favorite: false
                })
            }
        }, that)

        //判断是否交保证金
        var bond = data;
        bond.isBond = 1;//判断详情页查保证金，还是叫价时候查保证金
        bond.apiname = 'auction/bondPayedOrNot';
        request.getData(bond, function (res) {
            if (res.data.state>0) {
                that.setData({
                    bond: true
                })
            } else {
                that.setData({
                    bond: false
                })
            }
        }, that)
    },

    //收藏拍品
    favorite: function () {
        var that = this;
        message.hide.call(that);
        if (!app.checkLogin()) return;//校验登录

        var status = that.data.favorite ? 0 : 1;
        var data = {
            apiname: 'person/favorite',
            customerSeq: that.data.customerInfo.customerSeq,
            auctionGoodsSeq: that.data.auctionGoodsSeq,
            status: status
        }
        request.getData(data, function (res) {
            if (res.data.state == 1) {
                var favorite = that.data.favorite ? false : true;
                that.setData({
                    favorite: favorite
                })
                if (that.data.favorite) {
                    app.showToastMsg(0, '收藏成功')
                } else {
                    app.showToastMsg(0, '取消收藏成功')
                }
            }
        }, that)

    },

    //判断叫价类型
    callPrice: function (data, type) {
        var that = this;
        data.apiname = 'auction/bondPayedOrNot';
        request.getData(data, function (res) {
            if (res.data.state == 1) {
                data.apiname = 'person/getHighestPrice';
                request.getData(data, function (res) {
                    if (res.data.state) {
                        var resData = res.data.data;
                        if (type == 1) {//加一手出价
                            var offerPrice = parseInt(resData.lastPrice) + parseInt(resData.jiaJiaStep);
                            var param = {
                                customerSeq: that.data.customerInfo.customerSeq,
                                customerLogin: that.data.customerInfo.customerLogin,
                                auctionSessionSeq: resData.auctionSessionSeq,
                                auctionGoodsSeq: resData.auctionGoodsSeq,
                                price: offerPrice,
                                offerType: "0",
                                highestPrice: 0,
                                signNo: resData.signNo
                            };
                            that.setData({
                                oneHandOpen: "open",
                                oneHandParam: param
                            }) 
                        } else {//自由出价
                            that.openCallPrice(resData);
                        }
                    }
                    else {
                        app.showToastMsg(-1, res.data.message)
                    }
                }, that)
            } else if (res.data.state == 0) {
                wx.showModal({
                    title: '很抱歉，您还未缴纳保证金！',
                    content: '确定是否先缴纳保证金?',
                    success: function (res) {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: '/pages/pay-deposit/pay-deposit?id=' + data.auctionGoodsSeq + '&sessionId=' + data.auctionSessionSeq
                            })
                        } else if (res.cancel) { }
                    }
                })
            } else if (res.state == -2) {
                that.initData();
            }
        }, that)
    },

    //点击加一手按钮
    oneHandPrice: function (e) {
        var that = this;
        if (that.checkCustPro()) return;
        if (!that.data.oneHandPrice) return;
        if (!app.checkLogin()) return;//校验登录
        if (!that.data.bond) {
            wx.navigateTo({
                url: '/pages/pay-deposit/pay-deposit?id=' + that.data.auctionGoodsSeq + '&sessionId=' + that.data.auctionSessionSeq
            })
        } else {
            if (that.data.proDetail.state == 3) {
                var proDetail = that.data.proDetail;
                var data = {
                    auctionGoodsSeq: proDetail.auctionGoodsSeq,
                    auctionSessionSeq: proDetail.auctionSessionSeq,
                    customerSeq: that.data.customerInfo.customerSeq
                }
                that.callPrice(data, 1);
            } else if (that.data.proDetail.state == 2) {
                app.showToastMsg(-1, '拍卖未开始')
            }
        }

        //限制一秒点一次
        that.setData({
            oneHandPrice: false,
        })
        setTimeout(function () {
            that.setData({
                oneHandPrice: true,
            })
        }, 1000)
    },

    //确认加一手
    oneHandEnter: function () {
        this.raisePrice(this.data.oneHandParam); 
    },

    //取消加一手
    oneHandCancel: function () {
        this.setData({
            oneHandOpen: "",
            oneHandParam: "",
        })
    },

    //点击自由出价按钮
    freePrice: function (e) {
        var that = this;
        var proDetail = this.data.proDetail;
        var data = {
            auctionGoodsSeq: proDetail.auctionGoodsSeq,
            auctionSessionSeq: proDetail.auctionSessionSeq,
            customerSeq: that.data.customerInfo.customerSeq
        }
        if (!app.checkLogin()) return;//校验登录

        if (that.data.proDetail.state == 3) {
            if (that.checkCustPro()) return;
            that.callPrice(data, 2);
        } else if (that.data.proDetail.state == 2) {
            app.showToastMsg(-1, '拍卖未开始')
        }
    },

    //自由出价
    openCallPrice: function (data) {
        var that = this;
        data.jiaJiaStep = parseInt(data.jiaJiaStep);
        data.lastPrice = parseInt(data.lastPrice);
        data.highestPrice = parseInt(data.highestPrice);
        data.offerPrice = parseInt(data.lastPrice) + parseInt(data.jiaJiaStep);
        data.maxPrice = 0;
        that.setData({
            priceData: data,
            callPriceInfo: data,
            callPriceOpen: "open",
        })
    },

    //input出价金额
    offerPriceInput: function (e) {
        var info = this.data.callPriceInfo;
        info.offerPrice = parseInt(e.detail.value);
        this.setData({
            callPriceInfo: info
        })
    },

    //+出价金额
    offerPriceAdd: function () {
        var info = this.data.callPriceInfo;
        info.offerPrice = info.offerPrice + info.jiaJiaStep;
        if (info.offerPrice > 9999999) {
            info.offerPrice = 9999999
        }
        if (info.maxPrice != 0 && info.maxPrice <= info.offerPrice) {
            info.maxPrice = info.offerPrice + info.jiaJiaStep;
        }
        if (info.maxPrice > 9999999) {
            info.maxPrice = 9999999
        }
        this.setData({
            callPriceInfo: info
        })
    },

    //-出价金额
    offerPriceReduce: function () {
        var data = this.data.priceData;
        var info = this.data.callPriceInfo;
        info.offerPrice = info.offerPrice - info.jiaJiaStep;
        if (info.offerPrice < data.offerPrice) {
            info.offerPrice = data.offerPrice
        }
        this.setData({
            callPriceInfo: info
        })
    },

    //input心理最高价
    maxPriceInput: function (e) {
        var info = this.data.callPriceInfo;
        info.maxPrice = parseInt(e.detail.value);
        if (!info.maxPrice) {
            info.maxPrice = 0;
        }
        this.setData({
            callPriceInfo: info
        })
    },

    //+心理最高价
    maxPriceAdd: function () {
        var data = this.data.priceData;
        var info = this.data.callPriceInfo;
        info.maxPrice = info.maxPrice + info.jiaJiaStep;
        if (info.maxPrice <= info.offerPrice) {
            info.maxPrice = info.offerPrice + info.jiaJiaStep;
        }
        if (info.maxPrice > 9999999) {
            info.maxPrice = 9999999
        }
        this.setData({
            callPriceInfo: info
        })
    },

    //-心理最高价
    maxPriceReduce: function () {
        var info = this.data.callPriceInfo;
        info.maxPrice = info.maxPrice - info.jiaJiaStep;
        if (info.maxPrice <= info.offerPrice) {
            info.maxPrice = 0;
        }
        this.setData({
            callPriceInfo: info
        })
    },

    //取消自由出价
    priceCancel: function () {
        this.setData({
            priceData: {},
            callPriceInfo: {},
            callPriceOpen: "",
        })
    },

    //确认自由出价
    priceEnter: function () {
        var that = this;
        var data = this.data.priceData;
        var info = this.data.callPriceInfo;
        if (info.offerPrice < data.offerPrice) {
            app.showToastMsg(-1, '出价须大于当前价')
            return;
        }
        if ((info.offerPrice - data.qiPaiJia) % data.jiaJiaStep != 0) {
            app.showToastMsg(-1, '出价须是加价幅度的整数倍')
            return;
        }
        if (info.maxPrice != 0 && (info.maxPrice <= info.offerPrice)) {
            app.showToastMsg(-1, '最高价必须比出价金额高一手')
            return;
        }
        if (info.maxPrice != 0 && ((info.maxPrice - data.qiPaiJia) % data.jiaJiaStep != 0)) {
            app.showToastMsg(-1, '最高价必须是加价幅度的整数倍')
            return;
        }

        var param = {
            customerSeq: that.data.customerInfo.customerSeq,
            customerLogin: that.data.customerInfo.customerLogin,
            auctionSessionSeq: that.data.callPriceInfo.auctionSessionSeq,
            auctionGoodsSeq: that.data.callPriceInfo.auctionGoodsSeq,
            price: that.data.callPriceInfo.offerPrice,
            offerType: "0",
            highestPrice: that.data.callPriceInfo.maxPrice,
            signNo: that.data.callPriceInfo.signNo
        };
        that.raisePrice(param);
    },

    //调接口出价
    raisePrice: function (param) {
        var that = this;
        param.apiname = 'auction/raisePrice';
        if (param.price > 9999999) {
            app.showToastMsg(-1, '超过出价上限')
        } else {
            request.getData(param, function (res) {
                if (res.data.state === 1) {
                    app.showToastMsg(0, res.data.data);
                    that.priceCancel();
                    that.oneHandCancel();
                    setTimeout(function () {
                        that.initData();
                    }, 500)
                } else {
                    app.showToastMsg(-1, res.data.message)
                };
            }, that)
        };
    },

    //拍品详情预览图片
    lookProPic: function () {
        var count = this.data.imgCount;
        var proImg = this.data.proImg;
        var proArray = []
        for (var i = 0; i < proImg.length; i++) {
            proArray.push(proImg[i].auctionGoodsPath);
        }
        console.log(proArray[count])
        wx.previewImage({
            current: proArray[count],
            urls: proArray // 需要预览的图片http链接列表
        })
    },

    //记录当前详情图片序号
    proPicChange: function (e) {
        this.setData({
            imgCount: e.detail.current
        })
    },

    countReduce:function(){
        var count = this.data.bookedCount;
        count = count>1?count-1:count;
        this.setData({
            bookedCount: count,
        })
    },

    countAdd: function () {
        var count = this.data.bookedCount+1;
        this.setData({
            bookedCount: count,
        })
    },

    //我要私冾
    getOneClick: function (e) {
        var that = this;
        if (!app.checkLogin()) return;//校验登录
        wx.showActionSheet({
            itemList: ['求购', '出售'],
            success: function (res) {
                var auctionGoods = that.data.proDetail;
                var privatelyPrice = auctionGoods.state == 4 ? auctionGoods.currPrice : auctionGoods.referencePriceMinNum;
                that.setData({
                    bookedType: res.tapIndex + 1,
                    privatelyPrice: privatelyPrice,
                })
            },
            fail: function (res) {
            }
        })
    },

    //关闭求购、求售
    bookedCancel: function () {
        this.setData({
            bookedType: "",
            bookedCount: 1,
        })
    },

    //私冾提交
    bookedEnter: function () {
        var that = this;
        var pages = getCurrentPages();
        var prePage = pages[pages.length - 1];
        var auctionList = this.data.proDetail;
        var loginCustseq = wx.getStorageSync('customerInfo').customerSeq;
        if (!that.data.bookedCount) {
            app.showToastMsg(-1, '数量不能为空');
            return;
        } else if (that.data.bookedCount == 0) {
            app.showToastMsg(-1, '数量不能为0');
            return;
        }
        if (!that.data.privatelyPrice) {
            app.showToastMsg(-1, '出价不能为空');
            return;
        } else if (that.data.privatelyPrice == 0) {
            app.showToastMsg(-1, '出价不能为0');
            return;
        }
        var data = {
            apiname: 'auction/insertAuctionGoodsNegotiate',
            auctionGoodsSeq: auctionList.auctionGoodsSeq,
            customerSeq: loginCustseq,
            number: that.data.bookedCount,
            price: that.data.privatelyPrice,
            type: that.data.bookedType - 1
        }
        request.getData(data, function (res) {
            if (res.data.state == 1) {
                app.showToastMsg(0, '成功私冾')
                setTimeout(function () {
                    that.initData();
                }, 500)
            } else {
                app.showToastMsg(-1, res.data.message)
            }
        }, that)
        this.setData({
            bookedType: "",
            bookedCount: 1,
        })
    },

    //修改求购、求售价格
    changePrice: function (e) {
        this.setData({
            privatelyPrice: e.detail.value
        })
    },
})