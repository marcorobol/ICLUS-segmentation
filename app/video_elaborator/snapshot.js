var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');

function snapshot(folder, video, snapshot){
    
  return new Promise( (res,rej) => {

    // console.log(folder, video, snapshot)
  
    if(!fs.existsSync(folder + video)){
      // console.log('Video does not exists, snapshot aborted')
      return rej(false);
    }

    ffmpeg(folder + video)
    
    .on('error', (err) => {
      rej(err);
    })
    
    .on('end', () => {
      // console.log('Screenshot taken');
      return res(true);
    })
    
    .screenshots({
      timemarks: ["00:00:00.100"],
      folder: folder,
      filename: snapshot, //'%b-at-%s-seconds.png',
    })
    
  }).catch( (err) => {
    // console.error('ERROR: Screenshot NOT taken for video ' + video);
  });
  
}

// snapshot('./unzipped/1246/1428/raw/', 'video_1428_1.avi');

module.exports = snapshot;