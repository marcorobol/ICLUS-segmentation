var express = require('express');
var router = express.Router({mergeParams: true});
const paths = require('../paths/paths')
const db = require('../db');
const createCroppingMask = require('../png/createCroppingMask')
const overlayVideos = require('../mp4/overlayVideos')



router.get('/', async function(req, res) {
  console.log("crops.get")
  let client = await req.pool.connect();
  let query = `SELECT * FROM crops WHERE CONCAT(analysis_id,'_',area_code)='${req.params.video_ref}'`
  let query_res = await client.query(query)
  .catch(err => {
    console.log(err.stack)
  })
  client.release()
  
  res.json(query_res.rows);
});



router.post('/', async function(req, res) {
  const crop_created_at = new Date()
  const user_id = 0;
  const analysis_id = req.analysis_id
  const area_code = req.area_code
  const crop_bounds = req.body.bounds

  let client = await req.pool.connect();
  let query = `INSERT INTO crops VALUES ( DEFAULT, $1, $2, $3, $4, $5 )`;
  let query_res = await client.query(query, [crop_created_at, user_id, analysis_id, area_code, JSON.stringify(req.body.bounds)])
    .catch(err => {
      console.log(err.stack)
    })
  client.release()
  
  
  // select file
  let entry = await db.select_file(analysis_id, area_code)
  // get patientId
  var patient_id = entry.patient_id
  // get resolution
  var {width, height} = entry.extra.resolution;
  
  // paths
  let croppingMaskPath = paths.croppingMask(patient_id, analysis_id, area_code)
  let rawVideoPath = paths.rawVideo(patient_id, analysis_id, area_code)
  let clippedVideoPath = paths.clippedVideo(patient_id, analysis_id, area_code)
  
  // create mask png Synch!
  createCroppingMask(croppingMaskPath, {width, height}, {x,w,th,y,h,ch,bh} = crop_bounds)

  // create overlay mp4
  await overlayVideos(rawVideoPath, croppingMaskPath, clippedVideoPath)

  res.json(query_res);
});



router.delete('/:crop_id', async function(req, res) {
  let client = await req.pool.connect();
  let query = `DELETE FROM segmentation WHERE crop_id = '${req.params.crop_id}'`;
  let query_res = await client.query(query)
  .catch(err => {
    console.log(err.stack)
  })
  client.release()
  
  res.json(query_res);
});



module.exports = router;