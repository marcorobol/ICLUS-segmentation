require('dotenv').config()
const express = require('express')
var router = express.Router()
const fs = require('fs')
const hbjs = require('handbrake-js')
const ffmpeg = require('fluent-ffmpeg')
const snapshot = require('./snapshot')
const createCroppingMask = require('./createCroppingMask')
const db = require('../db');



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



router.use('/:imageParams.png', async function(req, res, next) {
  var imageParams = req.params.imageParams.split("_")
  if(imageParams[0]=='cropping-mask'){
    if(imageParams.length==4) {
      req.patientId = imageParams[1];
      req.analysisId = imageParams[2];
      req.area_code = imageParams[3];
    }
    else if(imageParams.length==3) {
      req.analysisId = imageParams[1];
      req.area_code = imageParams[2];
      const query_res = await db.query(`SELECT * FROM app_file_flat WHERE analysis_id = $1`, [req.analysisId]).catch(next)
      req.patientId = query_res.rows[0].patient_id
    }
  }
  else{
    if(imageParams.length==4) {
      req.patientId = imageParams[0];
      req.analysisId = imageParams[1];
      req.area_code = imageParams[2];
      req.timemark = imageParams[3];
    }
    else if(imageParams.length==3) {
      req.analysisId = imageParams[0];
      req.area_code = imageParams[1];
      req.timemark = imageParams[2];
      const query_res = await db.query(`SELECT * FROM app_file_flat WHERE analysis_id = $1`, [req.analysisId]).catch(next)
      req.patientId = query_res.rows[0].patient_id
    }
  }
  next()
})



router.use('/cropping-mask_*.png', async function(req, res, next) {
  req.toBeReturned = {}
  req.toBeReturned.folder = process.env.UNZIPPED+'/'+req.patientId+'/'+req.analysisId+'/raw/'
  req.toBeReturned.file = 'cropping-mask_' + req.analysisId + '_' + req.area_code + '.png'
  next()
// }, async function(req, res, next) {
//   // if file exists send it back
//   try {
//     if (fs.existsSync(req.toBeReturned.folder+req.toBeReturned.file)) {
//       res.sendFile(req.toBeReturned.file, { root: req.toBeReturned.folder })
//       return
//     }
//   } catch(err) {
//     console.log(err)
//   }
//   // otherwise
//   next()
}, async function(req, res, next) {
  const query_res = await db.query(`SELECT * FROM app_file_flat WHERE CONCAT(analysis_id,'_',file_area_code)=$1`, [req.analysisId+'_'+req.area_code]).catch(next)
  let row = query_res.rows[0]
  const dimensions = {width: row.extra.resolution.width, height: row.extra.resolution.height}//query_res.rows[0].extra.dimensions

  const query_res2 = await db.query(`SELECT * FROM crops WHERE CONCAT(analysis_id,'_',area_code)=$1`, [req.analysisId+'_'+req.area_code]).catch(next)
  const bounds = query_res2.rows[0].crop_bounds

  createCroppingMask(req.toBeReturned.folder, req.toBeReturned.file, {width, height} = dimensions, {x,w,th,y,h,ch,bh} = bounds)

  res.sendFile(req.toBeReturned.file, { root: req.toBeReturned.folder })
})



router.use('/*.png', async function(req, res, next) {
  let patientId = req.patientId;
  let analysisId = req.analysisId;
  let area_code = req.area_code;
  let timemark = req.timemark;
  
  // set-up
  let folder = process.env.UNZIPPED+'/'+patientId+'/'+analysisId+'/raw/'
  let snapshotName = 'snapshot' + analysisId + '_' + area_code + '_' + timemark + '.png'

  // if snapshot exists send it back
  try {
    if (fs.existsSync(folder+snapshotName)) {
      res.sendFile(snapshotName, { root: folder })
      return
    }
  } catch(err) {
    console.log(err)
  }

  // Otherwise take new one

  // get fileName
  // let fileName = 'video_'+analysisId+'_'+area_code
  // search for raw video file
  let searchString = 'video_' + analysisId + '_' + area_code + '.';
  let videoName = await findFileByString( folder, searchString )
  if(!videoName)
    throw new Error('no file found for ' + searchString + ' in ' + folder);
  
  // get video extension
  let videoExtension = videoName.videoExtension = videoName.split('.')[1];
  if(videoExtension=='JPG' || videoExtension=='jpg')
    throw new Error('jpg file found instead of video file');

  //take snapshot
  await snapshot(folder, videoName, snapshotName, timemark)
  .catch( err => {
    console.log(err)
    res.send(err)
  })

  // respond with snapshot
  // .then( () => {
    res.sendFile(snapshotName, { root: folder })
  // })


});



module.exports = router;
