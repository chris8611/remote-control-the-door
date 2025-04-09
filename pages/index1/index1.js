//获取应用实例
const app = getApp()

Page({
  data: {
    uid: '33f8f472f80fda40a9dcc257ee7cf9c9',
    topicOpen: "a006",
    topicClose: "b006",
    device_status: "离线", //默认离线
    powerstatus: "已关闭",  //默认关闭
    statusBarHeight: 0,
    capsuleHeight: 0,
    capsuleTop: 0,
    navBarHeight: 0,
    lastActivity: '',  // 新增：最近活动时间
    operationHistory: [] // 新增：操作记录
  },

  onLoad(){
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    
    const statusBarHeight = systemInfo.statusBarHeight;
    const capsuleHeight = menuButtonInfo.height;
    const capsuleTop = menuButtonInfo.top;

    // 计算导航栏高度
    const navBarHeight = (capsuleTop - statusBarHeight) * 2 + capsuleHeight + statusBarHeight;

    this.setData({
      statusBarHeight: statusBarHeight,
      capsuleHeight: capsuleHeight,
      capsuleTop: capsuleTop,
      navBarHeight: navBarHeight,
      lastActivity: this.formatTime(new Date()) // 初始化最近活动时间
    });
  },

  //"开门"按钮处理函数
  openclick: function() {
    //当点击开门按钮，更新开关状态为打开
    var that = this
    that.setData({
      powerstatus: "已打开"
    })

    //控制接口
    wx.request({
      url: 'https://api.bemfa.com/api/device/v1/data/1/', //api接口，详见接入文档
      method: "POST",
      data: {  //请求字段，详见巴法云接入文档，http接口
        uid: that.data.uid,
        topic: that.data.topicOpen,
        msg: "on"   //发送消息为on的消息
      },
      header: {
        'content-type': "application/x-www-form-urlencoded"
      },
      success(res) {
        console.log(res.data)
        wx.showToast({
          title: '开门成功',
          icon: 'success',
          duration: 1000
        })
        // 记录操作历史
        that.updateHistory('open', true);
      },
      fail(error) {
        console.log(error)
        wx.showToast({
          title: '开门失败',
          icon: 'none',
          duration: 1000
        })
        // 记录操作历史
        that.updateHistory('open', false);
      }
    })
  },

  //"关门"按钮处理函数
  closeclick: function() {
    //当点击关门按钮，更新开关状态为关闭
    var that = this
    that.setData({
      powerstatus: "已关闭"
    })

    //控制接口
    wx.request({
      url: 'https://api.bemfa.com/api/device/v1/data/1/', //api接口，详见接入文档
      method: "POST",
      data: {
        uid: that.data.uid,
        topic: that.data.topicClose,
        msg: "on"   //发送消息为off的消息
      },
      header: {
        'content-type': "application/x-www-form-urlencoded"
      },
      success(res) {
        console.log(res.data)
        wx.showToast({
          title: '关门成功',
          icon: 'success',
          duration: 1000
        })
        // 记录操作历史
        that.updateHistory('close', true);
      },
      fail(error) {
        console.log(error)
        wx.showToast({
          title: '关门失败',
          icon: 'none',
          duration: 1000
        })
        // 记录操作历史
        that.updateHistory('close', false);
      }
    })
  },

  // 更新操作历史记录
  updateHistory: function(type, success) {
    const newRecord = {
      type: type,
      time: this.formatTime(new Date()),
      success: success
    };
    const updatedHistory = [newRecord, ...this.data.operationHistory];
    // 只保留最近10条记录
    if (updatedHistory.length > 10) {
      updatedHistory.length = 10;
    }
    this.setData({
      operationHistory: updatedHistory,
      lastActivity: this.formatTime(new Date()) // 更新最近活动时间
    });
  },

  // 新增：格式化时间
  formatTime: function(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  onReady: function() {
    var that = this

    //请求设备状态
    //设备断开不会立即显示离线，由于网络情况的复杂性，离线1分钟左右才判断真离线
    wx.request({
      url: 'https://api.bemfa.com/api/device/v1/status/', //状态api接口，详见巴法云接入文档
      data: {
        uid: that.data.uid,
        topic: that.data.topicOpen,
      },
      header: {
        'content-type': "application/x-www-form-urlencoded"
      },
      success(res) {
        console.log(res.data)
        if (res.data.status === "online") {
          that.setData({
            device_status: "在线"
          })
        } else {
          that.setData({
            device_status: "离线"
          })
        }
        console.log(that.data.device_status)
      }
    })

    //请求询问设备开关/状态
    wx.request({
      url: 'https://api.bemfa.com/api/device/v1/data/1/', //get接口，详见巴法云接入文档
      data: {
        uid: that.data.uid,
        topic: that.data.topicOpen,
      },
      header: {
        'content-type': "application/x-www-form-urlencoded"
      },
      success(res) {
        console.log(res.data)
        if (res.data.msg === "on") {
          that.setData({
            powerstatus: "已打开"
          })
        }
        console.log(that.data.powerstatus)
      }
    })

    //设置定时器，每五秒请求一下设备状态
    setInterval(function() {
      console.log("定时请求设备状态,默认五秒");
      wx.request({
        url: 'https://api.bemfa.com/api/device/v1/status/',  //get 设备状态接口，详见巴法云接入文档
        data: {
          uid: that.data.uid,
          topic: that.data.topicOpen,
        },
        header: {
          'content-type': "application/x-www-form-urlencoded"
        },
        success(res) {
          console.log(res.data)
          if (res.data.status === "online") {
            that.setData({
              device_status: "在线"
            })
          } else {
            that.setData({
              device_status: "离线"
            })
          }
          console.log(that.data.device_status)
        }
      })

      //请求询问设备开关/状态
      wx.request({
        url: 'https://api.bemfa.com/api/device/v1/data/1/', //get接口，详见巴法云接入文档
        data: {
          uid: that.data.uid,
          topic: that.data.topicOpen,
        },
        header: {
          'content-type': "application/x-www-form-urlencoded"
        },
        success(res) {
          console.log(res.data)
          if (res.data.msg === "on") {
            that.setData({
              powerstatus: "已打开"
            })
          }
          console.log(that.data.powerstatus)
        }
      })
    }, 5000)
  }
})
