require('dotenv').config()
const express = require('express')
var router = express.Router()
const fs = require('fs')
const hbjs = require('handbrake-js')
const ffmpeg = require('fluent-ffmpeg')
const snapshot = require('./snapshot')



if (!('toJSON' in Error.prototype))
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {};

        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);

        return alt;
    },
    configurable: true,
    writable: true
});



function findFileByString(folder, string) {
  
  folder = folder + '/';

  if (!fs.existsSync(folder)){
    return undefined;
  }

  let files = fs.readdirSync(folder);

  for (const f of files) {
    // console.log( f.slice(0,string.length) )

    if ( fs.lstatSync(folder + f).isDirectory() ) {
      let found = findFileByString(folder + f + '/', string)
      if (found)
        return f + '/' + found;
    }

    // if it matches
    if ( f.slice(0,string.length) == string )
      return f;
  }

  return undefined;
  
}



router.use('/:patientId/:analysisId/:area_code/:timemark', async function(req, res) {
  let patientId = req.params.patientId;
  let analysisId = req.params.analysisId;
  let area_code = req.params.area_code;
  let timemark = req.params.timemark;
  
  // get folder
  let folder = process.env.UNZIPPED+'/'+patientId+'/'+analysisId+'/raw/'
  // get fileName
  // let fileName = 'video_'+analysisId+'_'+area_code
  // search for raw video file
  let searchString = 'video_' + analysisId + '_' + areaCode + '.';
  let videoName = await findFileByString( folder, searchString )
  if(!videoName)
    throw new Error('no file found for ' + searchString + ' in ' + folder);
  
  // get video extension
  let videoExtension = videoName.videoExtension = videoName.split('.')[1];
  if(videoExtension=='JPG' || videoExtension=='jpg')
    throw new Error('jpg file found instead of video file');

  // get snapshotName
  let snapshotName = 'snapshot' + analysisId + '_' + areaCode + '_' + timemark + '.png'

  //take snapshot
  await snapshot(folder, videoName, snapshotName, timemark)

  // respond with snapshot
  .then( () => {
    res.sendFile(snapshotName, { root: folder })
  })

  .catch( err => {
    console.log(err)
    res.send(err)
  })

});



module.exports = router;
