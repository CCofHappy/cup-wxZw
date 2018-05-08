var app = getApp()
var message = require('../../component/message/message')
var request = require('../../utils/request')
var util = require('../../utils/util')

const date = new Date();
const dateYear = date.getFullYear();
const years = [dateYear, dateYear+1]
const months = []
const days = []
const hours = []

for (var i = 1; i <= 12; i++) {
    months.push(i)
}

for (var i = 1; i <= 31; i++) {
    days.push(i)
}

for (var i = 1; i <= 24; i++) {
    hours.push(i)
}

Page({
    data: {
        imgUrl: app.globalData.imagePath,
        focus: 0,
        imgList: [],
        dayTime: '',
        btnDisabled: "",
        showLoading: false,
        fontCount: 0,
        years: years,
        year: 1,
        months: months,
        month: 1,
        days: days,
        day: 1,
        hours: hours,
        hour: 1,
        value: [ 0 , 0 , 0],
        needSoldTime:false,
        needLimit:false,
        needLeastCount: false,
        soldTime: '',
        soldBoxShadow: "none",
        soldTimeOpen:false,
        leastCountOpen: false,
        limitOpen:false,
        formValue:{
            title: '',
            content: '',
            brand: '',
            netContent: '',
            alcoholContent: '',
            number: '',
            price: '',
        },
        limitValue:1,
        leastChange:1,
        shareCount:'',
    },
    onLoad: function (options) {
        this.setData({
            customerInfo: wx.getStorageSync('customerInfo')
        })

        // 读取草稿
        if (options.id) {
            var that = this;
            var params = {
                apiname: '/bbs/post/assess/queryPostDraftById/' + options.id,
            }
            that.setData({
                draftId: options.id
            })
            request.getData(params, function (res) {
                if(res.data.state==1){
                    var data = res.data.data.post_json;
                    that.setData({
                        formValue: {
                            title: data.title,
                            content: data.content,
                            brand: data.brand,
                            netContent: data.netContent,
                            alcoholContent: data.alcoholContent,
                            number: data.number,
                            price: data.price,
                        },
                        imgList: data.postImg,
                    })  
                } else {
                    app.showToastMsg(-1, res.data.message)
                }
            });
        }
    },

    choseFocus: function (e) {
        var num = e.currentTarget.dataset.num;
        this.setData({
            focus: num,
        })
    },
    //上传图片
    uploadImg: function () {
        var that = this;
        var count = 9 - that.data.imgList.length;
        wx.chooseImage({
            count: count, // 一次选择数量
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths;
                var lock = 1;
                that.setData({
                    showLoading: true,
                })
                for (var i = 0; i < tempFilePaths.length; i++) {
                    wx.uploadFile({
                        url: app.globalData.apiPath + '/common/attachment/upload',
                        filePath: tempFilePaths[i],
                        name: 'myfile',
                        success: function (res) {
                            if (res.statusCode == 200) {
                                var resData = JSON.parse(res.data);
                                var imgList = that.data.imgList;
                                imgList.push(resData.data);
                                that.setData({
                                    imgList: imgList
                                })
                            } else {
                                app.showToastMsg(-1, '图片获取失败')
                            }
                        },
                        fail: function () {
                            app.showToastMsg(-1, '上传失败')
                        },
                        complete: function () {
                            if (lock == tempFilePaths.length) {
                                that.setData({
                                    showLoading: false,
                                })
                            }
                            lock++
                        }
                    })
                }
            }
        })
    },

    choseDayTime: function () {
        var that = this, dayNum = '';
        wx.showActionSheet({
            itemList: ['3天', '7天', '15天'],
            success: function (res) {
                if (res.tapIndex == 0) {
                    that.setData({ dayTime: '3' });
                } else if (res.tapIndex == 1) {
                    that.setData({ dayTime: '7' });
                } else if (res.tapIndex == 2) {
                    that.setData({ dayTime: '15' });
                }
            },
            fail: function (res) {
            }
        })
    },

    formSubmit: function (e) {
        var formVal = e.detail.value;
        if (e.detail.target.dataset.type=='send'){
            this.sendShare(formVal);
        }else{
            this.saveDraft(formVal)
        }
    },

    //发布提交
    sendShare: function(formVal){
        var that = this;
        var formId = formVal.formId;
        var openid = wx.getStorageSync("openId");
        if (!that.data.imgList.length) {
            app.showToastMsg(-1, '请上传图片')
            return
        }
        var data = formVal;
        if (data.alcoholContent && data.brand && data.content && data.netContent && data.number && data.price && data.title && data.endTime) {
            if (that.data.needSoldTime && !data.presellTime || that.data.needLimit && !data.limitations || that.data.needLeastCount && !data.minNumber) {
                app.showToastMsg(-1, '请完善信息')
                return;
            }
            if (parseFloat(data.netContent) >= 300) {
                app.showToastMsg(-1, '净含量不能大于或等于300')
                return;
            }
            if (parseFloat(data.alcoholContent) >= 100) {
                app.showToastMsg(-1, '酒精度不能大于或等于100')
                return;
            }
            if (that.data.needLimit && data.limitations == 0) {
                app.showToastMsg(-1, '限购数不能为0')
                return;
            }
            if (that.data.needLimit && data.limitations > 5) {
                app.showToastMsg(-1, '限购数最大为5')
                return;
            }
            if (that.data.needLeastCount && data.minNumber == 0) {
                app.showToastMsg(-1, '成团数不能为0')
                return;
            }
            if (that.data.needLeastCount && parseInt(data.minNumber) > parseInt(data.number)) {
                app.showToastMsg(-1, '成团数不能大于分享数')
                return;
            }
            data.alcoholContent = data.alcoholContent + '%';
            data.netContent = data.netContent + 'ml';
            data.apiname = 'bbs/post/insertPost';
            data.postImg = that.data.imgList;
            data.uid = that.data.customerInfo.customerSeq;
            data.endTime = that.data.dayTime;
            data.sendMssageOpenId = openid;
            data.sendMessageFormId = formId;
            data.presellTime = Date.parse(new Date(that.data.year + "/" + that.data.month + "/" + that.data.day + " " + that.data.hour + ":00:00"));
            data.draftId = that.data.draftId||"";
            var timestamp = Date.parse(new Date());
            if (that.data.needSoldTime && data.presellTime - timestamp < 86400000 || that.data.needSoldTime && data.presellTime - timestamp > 86400000 * 7) {
                app.showToastMsg(-1, '抢购时间不正确')
                return;
            }
            data.presellTime = that.data.needSoldTime ? data.presellTime : "";
            data.limitations = that.data.needLimit ? data.limitations : "";
            data.minNumber = that.data.needLeastCount ? data.minNumber : "";

            that.setData({
                btnDisabled: "disabled",
            })
            request.getData(data, function (res) {
                if (res.data.state == 1) {
                    that.setData({
                        focus: 0,
                        imgList: [],
                        dayTime: '',
                        soldTime: '',
                        btnDisabled: "",
                        fontCount: 0,
                        formValue: {
                            title: '',
                            content: '',
                            brand: '',
                            netContent: '',
                            alcoholContent: '',
                            number: '',
                            price: '',
                        },
                        needSoldTime: false,
                        needLimit: false,
                        needLeastCount: false,
                        soldTimeOpen: false,
                        leastCountOpen: false,
                        limitOpen: false,
                    })
                    wx.showModal({
                        title: "发布成功，等待系统审核",
                        content: '是否继续发贴？',
                        confirmText: '继续',
                        cancelText: '否',
                        success: function (res) {
                            if (res.confirm) {
                            } else if (res.cancel) {
                                wx.navigateTo({
                                    url: '/pages/mine-post/mine-post', 
                                })
                            }
                        }
                    })
                } else {
                    app.showToastMsg(-2, res.data.message)
                    that.setData({
                        btnDisabled: "",
                    })
                }
            }, that)
        } else {
            app.showToastMsg(-1, '请先填写信息')
        }
    },


    //删除图片
    deleteBtn: function (e) {
        var that = this;
        wx.showModal({
            content: '确定要删除图片吗？',
            confirmText: '确定',
            cancelText: '取消',
            success: function (res) {
                if (res.confirm) {
                    var imgList = that.data.imgList;
                    var num = parseInt(e.currentTarget.id);
                    imgList.splice(num, 1);
                    that.setData({
                        imgList: imgList,
                    })
                } else if (res.cancel) { }
            }
        })
    },

    fontCount: function (e) {
        this.setData({
            fontCount: e.detail.value.length
        })
    },

    //是否同意
    checkboxChange: function (e) {
        var that = this;
        if (e.detail.value.length) {
            that.setData({
                btnDisabled: false,
            })
        } else {
            that.setData({
                btnDisabled: true,
            })
        }
    },

    bindChange: function (e) {
        const val = e.detail.value
        this.setData({
            year: this.data.years[val[0]],
            month: this.data.months[val[1]],
            day: this.data.days[val[2]],
            hour: this.data.hours[val[3]],
            soldTime: this.data.years[val[0]] + "年" +this.data.months[val[1]] + "月" + this.data.days[val[2]] + "日" + this.data.hours[val[3]] +"点",
        })
        var date = new Date();
        var day = new Date(this.data.year, this.data.month, 0).getDate();
        var days = [];
        for (var i = 1; i <= day; i++) {
            days.push(i)
        }
        this.setData({
            days: days,
        })
    },

    showBar:function(e){
        var type = e.target.dataset.type;
        var that = this;
        if (type==1){
            that.setData({
                needSoldTime: !that.data.needSoldTime,
            })
        } else if (type==2){
            that.setData({
                needLimit: !that.data.needLimit,
                limitValue: 1,
            })
        } else {
            that.setData({
                needLeastCount: !that.data.needLeastCount,
                leastValue: 1,
            })
            if (that.data.needLeastCount){
                wx.showModal({
                    confirmText: '确认设置',
                    cancelText: '不设置',
                    content: '1、若分享帖达到您设置的最低成团数量，则此帖生效；\n2、若分享帖未达到您设置的最低成团数量，则此帖无效，系统自动取消所有订单，并将订单金额退还至参与者中威钱包。',
                    success: function (res) {
                        if (res.confirm) {
                        } else {
                            e.detail.value = false;
                            that.setData({
                                needLeastCount: !that.data.needLeastCount,
                                leastCountOpen: false,
                                leastValue: '',
                            })
                        }
                    }
                })
            }
        }
    },

    //打开预售时间选择
    openSoldBox: function () {
        var that = this;
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var hour = date.getHours(); 
        var arr = [0,month, day, hour];
        var animation = wx.createAnimation({
            duration: 200,
        });
        animation.bottom("0").step();
        this.setData({
            animationData: animation.export(),
            soldBoxShadow: "block",
            year: year,
            month: month+1,
            day: day+1,
            hour: hour+1,
            soldTime: year + "年" + (month + 1) + "月" + (day + 1) + "日" + (hour + 1)+"点",
            value: arr
        })
    },

    //关闭预售时间选择
    closeSoldBox: function () {
        var animation = wx.createAnimation({
            duration: 200,
        })
        animation.bottom("-780rpx").step();
        this.setData({
            animationData: animation.export(),
            soldBoxShadow: "none",
        })
    },

    limitChange: function(e){
        var limitValue = e.detail.value > 5 ? 5 : e.detail.value;
        this.setData({
            limitValue: limitValue
        })
    },

    leastChange: function (e) {
        this.setData({
            leastChange: e.detail.value
        })
    },

    //保存草稿
    saveDraft: function (formVal){
        var that = this;
        var data = {
            apiname: 'bbs/post/assess/insertPostDraft',
            type: 1,
            uid: that.data.customerInfo.customerSeq,
            title: formVal.title,
            content: formVal.content,
            price: formVal.price,
            number: formVal.number,
            brand: formVal.brand,
            netContent: formVal.netContent,
            alcoholContent: formVal.alcoholContent,
            postImg: that.data.imgList,
            draftId: that.data.draftId || "",
        }
        if (parseFloat(data.netContent) >= 300) {
            app.showToastMsg(-1, '净含量不能大于或等于300')
            return;
        }
        if (data.title || data.content || data.price || data.number || data.brand || data.netContent || data.alcoholContent || data.postImg.length>0) {
            request.getData(data, function (res) {
                if (res.data.state == 1) {
                    app.showToastMsg(0, '保存成功')
                } else {
                    app.showToastMsg(-2, res.data.message)
                    that.setData({
                        btnDisabled: "",
                    })
                }
            }, that)
        } else {
            app.showToastMsg(-1, '至少填选一个信息')
        }  
    }
})