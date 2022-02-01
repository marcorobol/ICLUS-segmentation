var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');
const path = require('path');

function snapshot(videoSrcPath, snapshotDestPath, timemark){
    
  return new Promise( (res,rej) => {

    // console.log(folder, video, snapshot)
  
    if(!fs.existsSync(videoSrcPath)){
      // console.log('Video does not exists, snapshot aborted')
      let err = new Error("Video in " + videoSrcPath + " does not exists, snapshot aborted")
      return rej(err);
    }

    ffmpeg(videoSrcPath)
  
    .on('error', (err) => {
      console.log(videoSrcPath)
      return rej(err);
    })
    
    .on('end', () => {
      // console.log('Screenshot taken');
      return res(true);
    })

    .on('stderr', function(stderrLine) {
      console.log('Stderr output: ' + stderrLine);
    })
    
    .on('codecData', function(data) {
      if (timemark >= data.duration)
        timemark = data.duration-0.04
    })

    .screenshots({
      timemarks: [timemark], //["00:00:00.100"],
      folder: path.dirname(snapshotDestPath),
      filename: path.basename(snapshotDestPath), //'%b-at-%s-seconds.png',
    })
    
    // .output(snapshot)
    // .noAudio()
    // .seek(timemark)
    // .run()
    
  }).catch( (err) => {
    // console.error('ERROR: Screenshot NOT taken for video ' + video);
    throw err
  });
  
}

module.exports = snapshot;