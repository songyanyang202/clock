
const myaudio = wx.createInnerAudioContext({});
myaudio.src = "/mp3/volume.mp3";

Page({
    data: {
        bkColorIndex: 0,
        bkColor: 'black',
        bkColorList:['black', '#e54d42', '#f37b1d','#fbbd08','#8dc63f',
                        '#39b54a','#1cbbb4','#0081ff','#6739b6',
                        '#9c26b0','#e03997','#a5673f'],
        time: 25 * 60 * 1000,
        timeData: {},
        fontSize: '150rpx',
        fontColor: '#fff',
        taskValue:'',

        shake:true, //默认震动
      },

      onShow()
      {
        wx.setKeepScreenOn({
            keepScreenOn: true
          })
      },
      //防烧屏
      chgBkColor()
      {
          var that = this;
          let i = that.data.bkColorIndex;
          that.bkTimer = setInterval(res=>{
              if(that.data.isLand)
              {
                  i++;
                  if(i >11)
                  {
                    i = 0;
                    that.data.bkColorIndex = 0;
                  }
                    that.setData({
                        bkColor: that.data.bkColorList[i], 
                        fontSize: i%2? '250rpx': '200rpx',
                        fontColor: i%2? '#fff': '#212121'
                    })
              }
          }, 20000)
      },

      gohehe()
      {
          console.log('gohehe')
            wx.navigateTo({
                url:"/pages/metrix/canvas"
            })
      },

    // 横屏监控
    onResize(res) {
        console.log('onResize-res', res)
        //横屏landscape    竖屏portrait
        this.pause();
        if(res.deviceOrientation == "landscape")
        {
            this.setData({
                isLand: true,
                fontSize: '200rpx'
            }) 
            this.start();
            this.chgBkColor();
            wx.setScreenBrightness({value:0})
        }
        else
        {
            this.setData({
                isLand: false,
                fontSize: '150rpx',
                isShowPause: false,
                fontColor:'#fff',
                bkColor: 'black'
            })
            this.data.bkColorIndex = 0;
            
            //响铃/震动,竖屏暂停
            this.closeShakeOrVol();
            clearInterval(this.bkTimer)
        }
      },


    //选择时间
    addClock()
    {
        this.setData({isShowClocks: !this.data.isShowClocks}) 
    },
    onDrag(event) {
        // console.log('onDrag滑动.value', event.detail.value)
        this.setData({
          time: event.detail.value *60*100,
        });
    },
    choseClock(e)
    {
        this.setData({
            time: e.currentTarget.dataset.time *60*1000,
            isShowClocks: false
          });
    },

    //任务编辑
    startEdit()
    {
        this.setData({isEdit: true})
    },
    bindblur(e)
    {
        if(e.detail.value == '')
        {
        this.setData({isEdit: false})
        }
    },
      
    
    // 双击时钟， 横屏敲击，显示大的暂停， 开始
    lastTapTimeoutFunc: null, // 单击事件点击后要触发的函数
    lastTapTime: 0,// 最后一次单击事件点击发生时间
    clickTime(e)
    {
        console.log('clickTime-e', e)

        let that = this;
        let currentTime = e.timeStamp;
        if (currentTime - this.lastTapTime < 300) 
        {
            console.log('clickTime-双击')
            clearTimeout(that.lastTapTimeoutFunc);
            //执行双击操作
            //横屏
                if(this.data.isLand)
                {
                    let isShowPause = !this.data.isShowPause;
                    that.setData({isShowPause: isShowPause})
                    if(isShowPause)
                    {
                        that.pause();
                    }
                    else
                    {
                        that.start();
                    }
                }
        } 
        else 
        {
            console.log('clickTime-单击')

            this.lastTapTimeoutFunc = setTimeout(() => {
                that.closeShakeOrVol()
            }, 500);
        }
        //更新点击时间
        this.lastTapTime = currentTime;
    },

    //关闭震动和响铃
    closeShakeOrVol()
    {
        var that = this;
        //单击关闭震动/响铃
        if(that.data.timeEnd)
        {
            if(that.data.isShaking)
            {
                console.log('clearInterval-1', that.timer)
                that.data.isShaking = false;
                clearInterval(that.timer);
                that.data.closeShake = false;
            }
            if(that.data.isPlayVol)
            {
                console.log('stopVol-3')
                that.stopVol();
            }
            wx.hideToast()
            that.reset()
        }
    },


    start() 
    {
        if(this.data.isShowClocks)
        {
          this.setData({
              isShowClocks: false
            })
        }
      const countDown = this.selectComponent('.control-count-down');
      countDown.start();
      this.setData({isRun: true})

    },
  
    pause() {
      const countDown = this.selectComponent('.control-count-down');
      countDown.pause();
      this.setData({
        isRun: false
      })
    },
  
    reset() {
      const countDown = this.selectComponent('.control-count-down');
      countDown.reset();
      this.setData({
        isRun: false,
        timeEnd: false
      })
    },
  
    finished() {
        console.log('finished-')
        wx.showToast({
          title: '到时间了',
          duration: 12000
        })
        this.data.timeEnd = true;//到时间了
        
        //没有震动和响铃
        if(!this.data.shake && !this.data.volume)
        {
            setTimeout(res=>{that.reset();}, 12000)
            return;
        }

        var that = this;
        //开启响铃
        if(this.data.volume)
        {
            this.playVol();
        }
        //开启震动
        if(this.data.shake)
        {
            this.data.isShaking = true;
            that.timer = setInterval(function () {
                console.log('setInterval-',that.timer)
                wx.vibrateLong()//长振动
              }, 800);
        }

        setTimeout(res=>{
            //没有手动停止震动/响铃
            if(that.data.isShaking)
            {
                console.log('clearInterval-2', that.timer)
                clearInterval(that.timer);
                that.data.closeShake = false;
            }
            if(that.data.isPlayVol)
            {
                console.log('stopVol-2')
                that.stopVol();
            }
            wx.hideToast()
            that.reset()
        }, 12000)

    },



        //闹钟/音乐/震动
        chgStatus(e)
        {
            var key = e.currentTarget.dataset.key;
            var value = this.data[`${key}`];
            this.setData({
                [`${key}`]: !value,
              });
        },


        //响铃是否停止  controlVol
        playVol: function () {
            this.data.isPlayVol =  true;
            myaudio.play();
        },
        stopVol()
        {
            this.data.isPlayVol =  false;
            myaudio.stop();
        }

  });