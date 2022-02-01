require('dotenv').config()
const express = require('express')
var router = express.Router()
const fs = require('fs')
const path = require('path');
const snapshot = require('./snapshot')
const createCroppingMask = require('./createCroppingMask')
const createSegmentedSnapshot = require('./createSegmentedSnapshot')
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









// const sendFileMiddleware = async function(getPath, createNewFile) {

//   return async function(req, res, next) {

//     // get file local path
//     var path = {folder, file} = await getPath(req, res, next)

//     // if file exists send it back
//     try {
//       if (fs.existsSync(folder+file)) {
//         res.sendFile(file, { root: folder })
//         return
//       }
//     } catch(err) {
//       console.log(err)
//     }

//     // otherwise
//     await createNewFile(req, res, next, path)

//     res.sendFile(file, { root: folder })

//   }

// }



const sendIfExists = async function(req, res, next) {
  req.toBeSent = path.resolve(req.toBeSent)
  // if file exists send it back
  try {
    if (fs.existsSync(req.toBeSent)) {
      res.sendFile(req.toBeSent)
      return
    }
  } catch(err) {
    next(err)
  }
  // otherwise
  next()
}



// '/\/cropping-mask_(\d*)_(\d*)\.png/'
router.use('/cropping-mask_:analysisId(\\d+)_:areaCode(\\d+).png', async function(req, res, next) {
  
  // analysisId areaCode patientId
  let analysisId = req.params.analysisId
  let areaCode = req.params.areaCode
  const app_file_flat_query_res = await db.query(`SELECT * FROM app_file_flat WHERE CONCAT(analysis_id,'_',file_area_code)=$1`, [analysisId+'_'+areaCode]).catch(next)
  let patientId = app_file_flat_query_res.rows[0].patient_id
  // toBeSent path
  req.toBeSent = path.join( process.env.UNZIPPED, String(patientId), String(analysisId), '/clipped/',
    `cropping-mask_${analysisId}_${areaCode}.png`
  )

  // send if exists
  await new Promise( resolve => sendIfExists(req, res, resolve))
  // otherwise create new one

  // get resolution
  const query_res = await db.query(`SELECT * FROM app_file_flat WHERE CONCAT(analysis_id,'_',file_area_code)=$1`, [req.params.analysisId+'_'+req.params.areaCode]).catch(next)
  let row = query_res.rows[0]
  const resolution = {width, height} = row.extra.resolution;//query_res.rows[0].extra.resolution
  console.log(resolution)
  // get mask bounds
  const query_res2 = await db.query(`SELECT * FROM crops WHERE CONCAT(analysis_id,'_',area_code)=$1`, [req.params.analysisId+'_'+req.params.areaCode]).catch(next)
  const bounds = query_res2.rows[0].crop_bounds
  // create mask png
  createCroppingMask(req.toBeSent, {width, height} = resolution, {x,w,th,y,h,ch,bh} = bounds)
  // send
  res.sendFile(req.toBeSent)

});



router.use('/snapshot_:analysisId(\\d+)_:areaCode(\\d+)_:timemark.png', async function(req, res, next) {
  // analysisId areaCode timemark patientId
  const analysisId = req.params.analysisId;
  const areaCode = req.params.areaCode;
  const timemark = req.params.timemark;
  const app_file_flat_query_res = await db.query(`SELECT * FROM app_file_flat WHERE CONCAT(analysis_id,'_',file_area_code)=$1`, [analysisId+'_'+areaCode]).catch(next)
  const patientId = app_file_flat_query_res.rows[0].patient_id
  // toBeSent path
  req.toBeSent = path.join (process.env.UNZIPPED, String(patientId), String(analysisId), '/clipped/',
    `snapshot_${analysisId}_${areaCode}_${timemark}.png`
  )
  
  // send if exists
  await new Promise( resolve => sendIfExists(req, res, resolve))
  // Otherwise take new one

  // get fileName
  // let fileName = 'video_'+analysisId+'_'+area_code
  // search for raw video file
  let searchInFolder = path.join (process.env.UNZIPPED, String(patientId), String(analysisId), '/raw/')
  let searchString = 'video_' + analysisId + '_' + areaCode + '.';
  let videoName = await findFileByString( searchInFolder, searchString )
  if(!videoName)
    throw new Error('no file found for ' + searchString + ' in ' + path.dirname(req.toBeSent));
  
  // get video extension
  let videoExtension = videoName.videoExtension = videoName.split('.')[1];
  if(videoExtension=='JPG' || videoExtension=='jpg')
    throw new Error('jpg file found instead of video file');

  //take snapshot
  await snapshot(path.join(searchInFolder, videoName), req.toBeSent, timemark)
  .catch( err => {
    console.log(err)
    res.send(err)
  })

  // respond with snapshot
  // .then( () => {
    res.sendFile(req.toBeSent)
  // })

});



router.use('/segmentation_:segmentationId(\\d+)_snapshot_:analysisId(\\d+)_:areaCode(\\d+)_:timemark.png', async function(req, res, next) {
  // analysisId areaCode timemark patientId
  const analysisId = req.params.analysisId;
  const areaCode = req.params.areaCode;
  const segmentationId = req.params.segmentationId;
  const timemark = req.params.timemark;
  const app_file_flat_query_res = await db.query(`SELECT * FROM app_file_flat WHERE CONCAT(analysis_id,'_',file_area_code)=$1`, [analysisId+'_'+areaCode]).catch(next)
  const patientId = app_file_flat_query_res.rows[0].patient_id
  // toBeSent path
  req.toBeSent = path.join (process.env.UNZIPPED, String(patientId), String(analysisId), '/clipped/',
    `segmentation_${segmentationId}_snapshot_${analysisId}_${areaCode}_${timemark}.png`
  )
  req.toBeSent = path.resolve(req.toBeSent)
  
  // send if exists
  // await new Promise( resolve => sendIfExists(req, res, resolve))
  // Otherwise take new one

  // get points
  const segmentations_query_res = await db.query(`SELECT * FROM segmentations WHERE segmentation_id=$1 AND analysis_id=$2 AND area_code=$3 AND timestamp=$4`, [segmentationId, analysisId, areaCode, timemark]).catch(next)
  const points = segmentations_query_res.rows[0].points;
  
  // srcSnapshotPath
  var srcSnapshotPath = path.join (process.env.UNZIPPED, String(patientId), String(analysisId), '/clipped/',
    `snapshot_${analysisId}_${areaCode}_${timemark}.png`
  )

  // create mask png
  await createSegmentedSnapshot(srcSnapshotPath, req.toBeSent, points)

  // respond with snapshot
  // .then( () => {
    res.sendFile(req.toBeSent)
  // })

});



module.exports = router;
