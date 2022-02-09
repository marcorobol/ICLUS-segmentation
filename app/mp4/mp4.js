require('dotenv').config()
const express = require('express')
var router = express.Router()
const fs = require('fs')
const hbjs = require('handbrake-js')
const ffmpeg = require('fluent-ffmpeg')
const db = require('../db');
const paths = require('../paths/paths');
const overlayVideos = require('./overlayVideos')


//Pre-process path and get valid patientId if missed
router.use('/:patientId/:analysisId/:area_code', async function(req, res, next) {
  
  // patientId
  if(req.params.patientId == undefined || req.params.patientId == 'undefined') {
    const query_res = await db.query(`SELECT * FROM app_file_flat WHERE analysis_id = $1`, [req.params.analysisId]).catch(next)
    let patientId = query_res.rows[0].patient_id
    let redirect = req.baseUrl.split('/').slice(0,-3).join('/')+'/'+patientId+'/'+req.params.analysisId+'/'+req.params.area_code+req.url
    console.log('redirecting to', redirect)
    res.redirect(redirect)
    return
  }
  else {
    req.patientId = req.params.patientId
  }

  // analysisId
  req.analysisId = req.params.analysisId

  // area_code
  req.area_code = req.params.area_code

  next()

});



router.use('/:patientId/:analysisId/:area_code/mp4/metadata', async function(req, res) {
  let patientId = req.patientId;
  let analysisId = req.analysisId;
  let area_code = req.params.area_code;
  
  let folder = process.env.UNZIPPED+'/'+patientId+'/'+analysisId+'/raw/'
  let fileName = 'video_'+analysisId+'_'+area_code
  let mp4Path = folder+fileName+'.mp4'

  let metadata = await new Promise( (res) => ffmpeg.ffprobe( mp4Path, function(err, metadata) {
    if(err)
      console.log(err)
    //console.dir(metadata); // all metadata
    if(metadata && metadata.streams && metadata.streams[0])
        res(metadata.streams[0]);
    else
        res(null)
  }));
  
  res.json(metadata)
});



router.use('/:patientId/:analysisId/:area_code/raw/metadata', async function(req, res) {
  let patientId = req.patientId;
  let analysisId = req.analysisId;
  let area_code = req.params.area_code;
  
  let folder = process.env.UNZIPPED+'/'+patientId+'/'+analysisId+'/raw/'
  let rawFileName = findFile( folder, 'video_'+analysisId+'_'+area_code )

  let metadata = await new Promise( (res) => ffmpeg.ffprobe( folder+rawFileName, function(err, metadata) {
    //console.dir(metadata); // all metadata
    if(metadata && metadata.streams && metadata.streams[0])
        res(metadata.streams[0]);
    else
        res(null)
  }));
  res.json(metadata)
});




const mp4ConverterHandler = async function(req, res) {
  let patientId = req.patientId;
  let analysisId = req.analysisId;
  let area_code = req.params.area_code;
  
  let folder = process.env.UNZIPPED+'/'+patientId+'/'+analysisId+'/raw/'
  let fileName = 'video_'+analysisId+'_'+area_code
  let mp4Path = folder+fileName+'.mp4'
  
  if ( !fs.existsSync(mp4Path) ) {
    let rawFile = findFile(folder, fileName)
    await new Promise( (res, rej) => {
      hbjs.spawn({ input: folder+rawFile, output: mp4Path, crop:"<0:0:0:0>" }) //"loose-anamorphic": true
        .on('error', err => {
          console.log(err)
          // rej()
        }) // invalid user input, no video found etc
        .on('progress', progress => {
          console.log(
            'Percent complete: %s, ETA: %s',
            progress.percentComplete,
            progress.eta
          )
        })
        .on('complete', () => res() )
      })
  }

  res.sendFile(fileName+'.mp4', { root: folder })
}

function findFile(folder, fileName) {
  let files = fs.readdirSync(folder);
  for (var f of files) {
    if ( f.split('.')[0] == fileName )
      return f;
  }
  throw new Error('no file Found for', fileName, 'in folder', folder)
}

router.get('/:patientId/:analysisId/:area_code/video', mp4ConverterHandler)





router.get('/convert_all_video', async function(req, res, next) {
  
  const query_res = await db.query(`SELECT * FROM app_file_flat`).catch(next)
  for (row of query_res.rows) {
    console.log("Converting ", row.patient_id, row.analysis_id, row.file_area_code)
    if(row.patient_id && row.analysis_id && row.file_area_code)
      try{
        await mp4ConverterHandler(
          { patientId: row.patient_id, analysisId: row.analysis_id, params: {area_code: row.file_area_code} },
          { sendFile: (a,aa)=>{} }
        )
      } catch{ (err) => console.log("Skipping ", row.patient_id, row.analysis_id, row.file_area_code) }
  }
  
});



const sizeOf = require('image-size');
router.get('/resolution_all_video', async function(req, res, next) {
  
  const query_res = await db.query(`SELECT * FROM app_file_flat`).catch(next)
  for (row of query_res.rows) {
    console.log("Resolving ", row.patient_id, row.analysis_id, row.file_area_code)
    
    let folder = process.env.UNZIPPED+'/'+row.patient_id+'/'+row.analysis_id+'/raw/'
    var snapshotPath = folder + 'snapshot_' + row.analysis_id + '_' + row.file_area_code + '.png'
    
    let resolution = await new Promise( (res,rej) => {
      sizeOf(snapshotPath, function (err, resolution) {
        if (err) rej(err);
        res(resolution);
      });
    })
    .then( async (resolution) => {
      row.extra.resolution = resolution

      await db.query(`UPDATE app_file_flat SET extra = $1 WHERE CONCAT(analysis_id,'_',file_area_code)=$2`,
        [row.extra, row.analysis_id+'_'+row.file_area_code] ).catch(next)
    })
    .catch( (err) => {} )

  }

});





router.get('/:patientId/:analysisId/:area_code/clipped', async function(req, res, next) {
  req.toBeSent = paths.clippedVideo(req.patientId, req.analysisId, req.area_code)
  next()
}, async function(req, res, next) {
  // if file exists send it back
  try {
    if (fs.existsSync(req.toBeSent)) {
      res.sendFile(req.toBeSent)
      return
    }
  } catch(err) {
    console.log(err)
  }
  // otherwise
  next()
}, async function(req, res, next) {

  // paths
  let croppingMaskPath = paths.croppingMask(req.patientId, req.analysisId, req.area_code)
  let rawVideoPath = paths.rawVideo(req.patientId, req.analysisId, req.area_code)
  let clippedVideoPath = paths.clippedVideo(req.patientId, req.analysisId, req.area_code)

  await overlayVideos(rawVideoPath, croppingMaskPath, clippedVideoPath)
  
  res.sendFile(clippedVideoPath)
});





module.exports = router;
