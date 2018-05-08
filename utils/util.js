var app = getApp()
module.exports = {
    formatTime: function (time) {
        if (typeof time !== 'number' || time < 0) {
            return time
        }

        var hour = parseInt(time / 3600)
        time = time % 3600
        var minute = parseInt(time / 60)
        time = time % 60
        var second = time

        return ([hour, minute, second]).map(function (n) {
            n = n.toString()
            return n[1] ? n : '0' + n
        }).join(':')
    },

    getDate: function () {
        var time = new Date()
        var year = time.getFullYear()
        var month = time.getMonth()
        month = month < 10 ? '0' + month : month
        var day = time.getDay()
        day = day < 10 ? '0' + day : day
        return [year, month, day].join('-')
    },

    getTime: function () {
        var time = new Date()
        var hours = time.getHours()
        hours = hours < 10 ? '0' + hours : hours
        var minute = time.getMinutes()
        minute = minute < 10 ? '0' + minute : minute
        var second = time.getSeconds()
        second = second < 10 ? '0' + second : second
        return [hours, minute, second].join(':')
    },

    //时间戳转换时间  
    toDate: function (number, type) {
        var n = number;
        var date = new Date(n);
        var Y = date.getFullYear();
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
        var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
        var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
        switch (type) {
            case 1:
                return (Y + '.' + M + '.' + D + ' ' + h + ':' + m + ':' + s)
                break;
            case 2:
                return (Y + '.' + M + '.' + D + ' ' + h + ':' + m)
                break;
            case 3:
                return (M + '/' + D)
                break;
            case 4:
                return (h + ':' + m)
                break;
            case 5:
                return (Y + '年' + M + '月' + D + '日 ' + h + ':' + m)
                break;
            case 6:
                return (Y + '年' + M + '月' + D + '日 ')
                break;
            case 7:
                return (Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s)
                break;
        }
    },

    //倒计时转换时间
    countDown: function (time) {
        var result = false;
        if (time > 0) {
            var d = Math.floor(time / (1000 * 3600 * 24)),
                h = Math.floor((time % (1000 * 3600 * 24)) / (1000 * 3600)),
                m = Math.floor((time % (1000 * 3600)) / (1000 * 60)),
                s = Math.floor((time % (1000 * 60)) / 1000);
            d = d < 10 ? '0' + d : d;
            h = h < 10 ? '0' + h : h;
            m = m < 10 ? '0' + m : m;
            s = s < 10 ? '0' + s : s;
            result = {
                day: d,
                hour: h,
                minute: m,
                second: s,
            };
        }
        return result;
    },

    //获取服务器时间
    getServerTime: function () {
        var that = this;
        var m = new Date();
        var serverTime = m.getTime();
        wx.request({
            url: app.globalData.apiPath + '/auction/getServerTime',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                serverTime = res.data.data;
            }
        })
        return serverTime;
    },

    //转换时间显示
    changeTime: function (timeStr) {
        var myDate = new Date();
        var timeShow = "";
        var time = "";
        if (timeStr && timeStr.indexOf(" ")) {
            time = timeStr.split(" ");
        } else {
            return timeStr;
        }
        var time_fullyear = time[0];
        var time_hour = time[1];
        var fullyearArray = time_fullyear.split("-");
        var hourArray = time_hour.split(":");
        if ((myDate.getMonth() + 1) == fullyearArray[1] && myDate.getFullYear() == fullyearArray[0]) {
            if (myDate.getDate() - fullyearArray[2] == 1) {
                timeShow = "昨天";
            } else if (myDate.getDate() - fullyearArray[2] > 1) {
                timeShow = timeStr;
            } else {
                if (hourArray[0] < myDate.getHours() && hourArray[1] < myDate.getMinutes() || myDate.getHours() - hourArray[0] > 1) {
                    timeShow = myDate.getHours() - hourArray[0] + "小时前";
                } else {
                    if (hourArray[1] < myDate.getMinutes()) {
                        timeShow = myDate.getMinutes() - hourArray[1] + "分钟前";
                    } else if (hourArray[0] < myDate.getHours() && hourArray[1] > myDate.getMinutes()) {
                        timeShow = 60 + myDate.getMinutes() - hourArray[1] + "分钟前";
                    } else {
                        timeShow = "刚刚";
                    }
                }
            }
        } else {
            timeShow = timeStr;
        }
        return timeShow
    },

    
}
