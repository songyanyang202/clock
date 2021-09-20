
const myaudio = wx.createInnerAudioContext({});
myaudio.src = "/mp3/volume.mp3";

Page({
    data: {
        time: 25 * 60 * 1000,
        timeData: {},
        fontSize: '150rpx',
        taskValue:'',

        shake:true, //默认震动
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
            wx.setScreenBrightness({value:0})
        }
        else
        {
            this.setData({
                isLand: false,
                fontSize: '150rpx',
                isShowPause: false
            }) 
            
            //没有暂停  响铃/震动,竖屏暂停
            if(this.data.isShaking || this.data.isPlayVol)
            {
                if(this.data.isShaking)
                {
                    console.log('clearInterval-3', this.timer)
                    this.data.isShaking = false;
                    clearInterval(this.timer);
                    this.data.closeShake = false;
                }
                if(this.data.isPlayVol)
                {
                    console.log('stopVol-3')
                    this.stopVol();
                }
                this.reset()
            }
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
                //单击关闭震动/响铃
                if(that.data.isShaking || that.data.isPlayVol)
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
                    that.reset()
                }
            }, 500);
        }
        //更新点击时间
        this.lastTapTime = currentTime;
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
        isRun: false
      })
    },
  
    finished() {
        console.log('finished-')
        // wx.showToast({
        //     title: '倒计时结束',
        //     icon:'none'
        // })
                
        if(!this.data.shake && !this.data.volume)
        {
            setTimeout(res=>{
                that.reset()
            }, 500)
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
            that.reset()
        }, 6000)

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