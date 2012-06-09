function createCamera(rtmpServer, flvDirectory, cameraFlvName, subtitleSrtName) {

flowplayer("camera", { src: "flowplayer/flowplayer-3.2.7.swf", wmode: "opaque" }, {

 onError:
    function(errorCode, errorMessage) {
 
      if(errorCode == 200) //   Stream not found
        {
          $(document.getElementById("camera-box")).css("display", "none");
          $f("screen").unmute();
        }
    },

clip: {
  autoPlay: false,
  bufferLength: 3, // ! pause

  provider: 'rtmp',
  url: 'flv:/' + flvDirectory + '/' + cameraFlvName,
  ipadUrl: 'http://erlyvideo.avalon.ru/' + flvDirectory + '/' + cameraFlvName + '.hls/' + cameraFlvName + '.m3u8',
  netConnectionUrl: rtmpServer,

  captionUrl: subtitleSrtName ? (subtitleSrtName + '?' + (new Date()).getTime()):null,

  onCuepoint: function(clip, cp) {
       document.getElementById("T" + cp.time).setAttribute("title", document.getElementById("T" + cp.time).innerHTML);      
       document.getElementById("T" + cp.time).style.fontWeight = "bold";
    },

    onBeforeSeek: function(clip, time) {
  return ($f("screen").prv.state == "onBeforeSeek") || 
    ($f("screen").prv.state == "onBeforeResume");
    },

    onBeforePause: function() {
  return $f("screen").prv.state == "onBeforePause";
    },

  onMetaData: function(clip) {
      for(set in clip.cuepoints)
      {
       for(p in clip.cuepoints[set])
       { 
         var cp =  clip.cuepoints[set][p];

         var para = document.createElement('p');
         var anchor = document.createElement('a');
         var span = document.createElement('span');

         var milliseconds = cp.time * 1000 / clip.cuepointMultiplier;

         var seconds = parseInt(milliseconds / 1000);
         var minutes = parseInt(seconds / 60); seconds %= 60;
         var hours = parseInt(minutes / 60); minutes %= 60;
         var days = parseInt(hours / 24); hours %= 24;

   anchor.innerHTML = "[" + ((hours <= 9) ? "0":"") + hours + ":" + ((minutes <= 9) ? "0":"") + minutes + ":" + ((seconds <= 9) ? "0":"") + seconds + "]";

   span.innerHTML = " " + cp.parameters.text;

   anchor.setAttribute("href", "#");
   anchor.setAttribute("id", "T" + cp.time);
   anchor.onclick = function(cp, clip) { 
     return function() {
       $f("screen").seek(cp.time/clip.cuepointMultiplier);
     }
   } (cp, clip);

   document.getElementById("toc").appendChild(para);
   para.appendChild(anchor);
   para.appendChild(span);
       }
     }
   }
},

plugins: { 
  controls: {
    autoHide: 'never',
    play: false,
    volume: true,
    mute: true,
    time: true,
    stop: false,
    playlist: false,
    fullscreen: false,
    scrubber: true
  },
  captions: {
    url: "flowplayer/flowplayer.captions-3.2.3.swf",
    captionTarget: 'content',
    button: null
  },
    content: {  
    url: 'flowplayer/flowplayer.content-3.2.0.swf',
    display: 'none'
  },
  rtmp: {
    url: 'flowplayer/flowplayer.rtmp-3.2.3.swf'
  }
}
    
});

}

function createScreen(rtmpServer, flvDirectory, screenFlvName) {

  flowplayer("screen", { src: "flowplayer/flowplayer-3.2.7.swf", wmode: "opaque" },
  {
    clip: { 
      autoPlay: false,
      bufferLength: 3,

      provider: 'rtmp',
      url: 'flv:/' + flvDirectory + '/' + screenFlvName,
      ipadUrl: 'http://erlyvideo.avalon.ru/' + flvDirectory + '/' + screenFlvName + '.hls/' + screenFlvName + '.m3u8',
        netConnectionUrl: rtmpServer,

      onBeforeBegin: function() {
        $f("camera").setVolume(80);
        $f("camera").unmute();
        $f("camera").play();
        $f("screen").mute();
        this.prv = { state: "onBeforeBegin" };
      },

      onBegin: function() {
        this.prv.state = "onBegin";
      },

      onBeforeStop: function() {
        $f("camera").stop();
      },

      onBeforePause: function() {
        this.prv.state = "onBeforePause";
        $f("camera").pause();
      },

      onBeforeResume: function(clip) {
        this.prv.state = "onBeforeResume";
        this.seek(this.getTime());
        $f("camera").seek(this.getTime()); // keyframes diff ??
        $f("camera").resume();
      },

      onBeforeSeek: function(clip, time) {
        this.prv.state = "onBeforeSeek";
        $f("camera").seek(time);
      }
    },
    plugins: {
      controls: {
        //autoHide: 'never',
        volume: false,
        mute: false 
      },
      rtmp: {
        url: 'flowplayer/flowplayer.rtmp-3.2.3.swf'
      }
    }
/*
      , debug: true,
      log: { level: 'debug', filter: 'org.flowplayer.rtmp.*' }
*/      

  });

  
}

YUI().use('dd', 'node', function (Y) {
    var box = Y.one('.box'),
        camera = box.one('#camera'),
        w = parseInt(camera.getComputedStyle('width')),
        h = parseInt(camera.getComputedStyle('height')),
        box_dd = new Y.DD.Drag({
            node: box,
            handles: ['.box .handle']
        }),
        closer = Y.one('.box .closer'),
        little = Y.one('.box .little'),
        big = Y.one('.box .big');

    closer.on('click', function() {
            shadeBox(camera);
        });

    little.on('click', function(){
        resizeBox(camera,
            {
                'h': h / 2,
                'w': w / 2
            });
    });

    big.on('click', function(){
        resizeBox(camera,
            {
                'h': h,
                'w': w
            });
    });

    function shadeBox(obj) {
        var cur_w = parseInt(obj.getComputedStyle('width'));
        if(parseInt(obj.getComputedStyle('height'))) {
            obj.setStyles({
                'visibility': 'hidden',
                'height': 0
            })
        } else {
            obj.setStyles({
                'visibility': '',
                'height': cur_w * h / w
            })
        }
    }

    function resizeBox(obj, styles) {
        obj.setStyles({
            'visibility': '',
            'height': styles.h,
            'width': styles.w
        });
    }

    createScreen(screenData.server, screenData.dir, screenData.flv);
    createCamera(cameraData.server, cameraData.dir, cameraData.flv);
});
