var ffmpeg = require('fluent-ffmpeg');
var fs = require('fs');

function snapshot(folder, video, snapshot, timemark){
    
  return new Promise( (res,rej) => {

    // console.log(folder, video, snapshot)
  
    if(!fs.existsSync(folder + video)){
      // console.log('Video does not exists, snapshot aborted')
      let err = new Error("Video in " + folder + video + " does not exists, snapshot aborted")
      return rej(err);
    }

    ffmpeg(folder + video)
    
    .on('error', (err) => {
      console.log(folder + video)
      rej(err);
    })
    
    .on('end', () => {
      // console.log('Screenshot taken');
      return res(true);
    })
    
    .screenshots({
      timemarks: [timemark], //["00:00:00.100"],
      folder: folder,
      filename: snapshot, //'%b-at-%s-seconds.png',
    })
    
  }).catch( (err) => {
    // console.error('ERROR: Screenshot NOT taken for video ' + video);
    throw err
  });
  
}

module.exports = snapshot;