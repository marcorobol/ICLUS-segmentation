require('dotenv').config()
const express = require('express')
var router = express.Router()
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const db = require('../db');
const paths = require('../paths/paths');
const overlayVideos = require('./overlayVideos')


//Pre-process path and get valid patientId if missed
router.use('/:patientId/:analysisId/:areaCode', async function(req, res, next) {
  
  // patientId
  if(req.params.patientId == undefined || req.params.patientId == 'undefined') {
    const query_res = await db.query(`SELECT * FROM app_file_flat WHERE analysis_id = $1`, [req.params.analysisId]).catch(next)
    let patientId = query_res.rows[0].patient_id
    let redirect = req.baseUrl.split('/').slice(0,-3).join('/')+'/'+patientId+'/'+req.params.analysisId+'/'+req.params.areaCode+req.url
    console.log('redirecting to', redirect)
    res.redirect(redirect)
    return
  }
  else {
    req.patientId = req.params.patientId
  }

  // analysisId
  req.analysisId = req.params.analysisId

  // areaCode
  req.areaCode = req.params.areaCode

  next()

});



router.use('/:patientId/:analysisId/:areaCode/mp4/metadata', async function(req, res) {
  let patientId = req.patientId;
  let analysisId = req.analysisId;
  let areaCode = req.params.areaCode;
  
  let folder = process.env.UNZIPPED+'/'+patientId+'/'+analysisId+'/raw/'
  let fileName = 'video_'+analysisId+'_'+areaCode
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



router.use('/:patientId/:analysisId/:areaCode/raw/metadata', async function(req, res) {
  let patientId = req.patientId;
  let analysisId = req.analysisId;
  let areaCode = req.params.areaCode;
  
  let rawVideo = paths.rawVideo(patientId, analysisId, areaCode)

  let metadata = await new Promise( (res) => ffmpeg.ffprobe( rawVideo, function(err, metadata) {
    //console.dir(metadata); // all metadata
    if(metadata && metadata.streams && metadata.streams[0])
        res(metadata.streams[0]);
    else
        res(null)
  }));

  res.json(metadata)
});



const convertVideo = require('./convertVideo')
router.get('/:patientId/:analysisId/:areaCode/video', async function(req, res, next) {
  let patientId = req.patientId;
  let analysisId = req.analysisId;
  let areaCode = req.params.areaCode;
  
  let mp4Path = paths.mp4Video(patientId, analysisId, areaCode)
  let rawVideo = paths.rawVideo(patientId, analysisId, areaCode)
  
  if ( !fs.existsSync(mp4Path) && rawVideo ) {
    await convertVideo(rawVideo, mp4Path)
  }

  res.sendFile(mp4Path)
})



router.get('/:patientId/:analysisId/:areaCode/clipped', async function(req, res, next) {
  req.toBeSent = paths.clippedVideo(req.patientId, req.analysisId, req.areaCode)
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
  let croppingMaskPath = paths.croppingMask(req.patientId, req.analysisId, req.areaCode)
  let rawVideoPath = paths.rawVideo(req.patientId, req.analysisId, req.areaCode)
  let clippedVideoPath = paths.clippedVideo(req.patientId, req.analysisId, req.areaCode)

  await overlayVideos(rawVideoPath, croppingMaskPath, clippedVideoPath)
  
  res.sendFile(clippedVideoPath)
});





module.exports = router;
