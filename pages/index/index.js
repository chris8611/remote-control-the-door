// index.js
Page({
  data: {
    isConnected: false,
    statusBarHeight: 0,
    capsuleHeight: 0,
    capsuleTop: 0,
    navBarHeight: 0,
    lastActivity: '',
    operationHistory: [] // 新增：操作记录
  },

  onLoad: function() {
    this.checkDeviceStatus();
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

  checkDeviceStatus: function() {
    const url = 'https://o7b080b9.ala.cn-hangzhou.emqxsl.cn:8443/api/v5/clients/esp82666';

    wx.request({
      url: url,
      method: 'GET',
      header: {
        'Authorization': 'Basic bjAxMTBiZDk6d2FmZmQ4YTEwZGQ1ZTExOQ=='
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const responseData = res.data;
          if (responseData.connected === true) {
            this.setData({
              isConnected: true
            });
            wx.showToast({
              title: '设备在线',
              icon: 'success'
            });
          } else {
            this.setData({
              isConnected: false
            });
            wx.showToast({
              title: '设备离线',
              icon: 'none'
            });
          }
        } else {
          console.error('请求失败', res);
          wx.showToast({
            title: '请求失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求失败', err);
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
      }
    });
  },

  onTapOpenDoor: function() {
    this.sendRequest('switch3', 'open');
  },

  onTapCloseDoor: function() {
    this.sendRequest('switch4', 'close');
  },
  onTapPauseDoor: function() {
    this.sendRequest('switch1', 'close');
  },

  sendRequest: function(topic, type) {
    var that = this;
    wx.request({
      url: 'https://o7b080b9.ala.cn-hangzhou.emqxsl.cn:8443/api/v5/publish',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic bjAxMTBiZDk6d2FmZmQ4YTEwZGQ1ZTExOQ=='
      },
      data: {
        topic: topic,
        qos: 1,
        payload: 'on'
      },
      success: function(res) {
        console.log(res.data);
        wx.showToast({
          title: topic === 'switch3' ? '已开' : '已关',
          icon: 'success'
        });
        that.updateHistory(type, true);
      },
      fail: function(error) {
        console.log(error);
        wx.showToast({
          title: '未开/关',
          icon: 'none'
        });
        that.updateHistory(type, false);
      }
    });
  },

  updateHistory: function(type, success) {
    const newRecord = {
      type: type,
      time: this.formatTime(new Date()),
      success: success
    };
    const updatedHistory = [newRecord, ...this.data.operationHistory];
    this.setData({
      operationHistory: updatedHistory
    });
  },

  formatTime: function(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
});
