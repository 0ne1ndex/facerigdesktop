const settings = require('electron-settings')
const path = require('path')
const ipcRenderer = require('electron').ipcRenderer
const _ = require('lodash')

// 获取驱动
async function getMediaSteam(isOpenAudio) {
  let x = await navigator.mediaDevices.enumerateDevices()
  let facerigDevice = _.find(x, {
    label: 'FaceRig Virtual Camera'
  })
  if (!facerigDevice) {
    throw '未找到facerig虚拟摄像头设备,确保facerig广播已打开(启动时的boardcast选项)'
  }
  let audioId = isOpenAudio ? {
    deviceId: 'default'
  } : false
  let option = {
    audio: audioId,
    video: {
      deviceId: facerigDevice.deviceId
    }
  };

  let mediaStream = await navigator.mediaDevices.getUserMedia(option)
  return mediaStream
}



//启动video
function startVideo(mediaStream) {
  return new Promise(resolve => {
    var video = document.querySelector('video');
    video.onloadedmetadata = function (e) {
      video.play();
      resolve()
    };
    video.src = window.URL.createObjectURL(mediaStream);
  })
}

//绘制一帧
function drawOneFrame() {

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  var imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
  //去除绿幕
  for (var i = 0; i < imgdata.height; ++i) {
    for (var j = 0; j < imgdata.width; ++j) {
      var x = i * 4 * imgdata.width + 4 * j,
        r = imgdata.data[x],
        g = imgdata.data[x + 1],
        b = imgdata.data[x + 2]
      let offset = Math.pow(3*(r), 2) + Math.pow(4*(g - 216), 2) + Math.pow(2*(b), 2)
      // let offset = Math.abs(r - green[0]) + Math.abs(g - green[1]) + Math.abs(b - green[2])
      if (offset < maxOffset) {
        imgdata.data[x + 3] = 0
      }
    }
  }
  ctx.putImageData(imgdata, 0, 0);
}


function drawCanvas() {
  window.video = document.querySelector('video')
  window.canvas = document.querySelector('canvas');
  canvas.height = video.videoHeight
  canvas.width = video.videoWidth
  window.ctx = canvas.getContext('2d');
  window.maxOffset = 150000
  window.green = [0, 216, 0]
  setInterval(drawOneFrame, 16.6);
}



async function start() {
  //1. 获取驱动
  let mediaStream = await getMediaSteam(settings.get('isOpenAudio'))
  await startVideo(mediaStream)
  // 启动video
  drawCanvas()
}

//重载
function restart() {
  clearInterval(drawOneFrame)
  start()
}

ipcRenderer.on('restart', () => {
  restart()
})

start()