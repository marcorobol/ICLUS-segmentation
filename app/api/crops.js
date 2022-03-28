var express = require('express');
var router = express.Router({mergeParams: true});
const paths = require('../paths/paths')
const db = require('../db');
const createCroppingMask = require('../png/createCroppingMask')
const overlayVideos = require('../mp4/overlayVideos')
const createCsv = require('../zip/createCsv')



router.get('/', async function(req, res, next) {
  let rows = await db.selectCrops(req.analysis_id, req.area_code).catch(next)
  res.json(rows);
});



router.post('/', async function(req, res, next) {
  const crop_created_at = new Date()
  const user_id = 0;
  const analysis_id = req.analysis_id
  const area_code = req.area_code
  const crop_bounds = req.body.bounds

  let query_res = await db.insertUpdateCrop(user_id, analysis_id, area_code, JSON.stringify(req.body.bounds))
  
  // select file
  let file = await db.selectFile(analysis_id, area_code)
  // get patientId
  var patient_id = file.patient_id
  // get resolution
  var {width, height} = file.extra.resolution;
  
  // paths
  let croppingMaskPath = paths.croppingMask(patient_id, analysis_id, area_code)
  let rawVideoPath = paths.rawVideo(patient_id, analysis_id, area_code)
  let clippedVideoPath = paths.clippedVideo(patient_id, analysis_id, area_code)
  let cropCsvPath = paths.cropCsv(patient_id, analysis_id, area_code)
  
  // create mask png Synch!
  createCroppingMask(croppingMaskPath, {width, height}, {x,w,th,y,h,ch,bh} = crop_bounds)

  // select approvals
  let approvals = await db.selectApprovals(analysis_id, area_code).catch(next)
  if (approvals.length>0) {
    let last_approval = approvals[approvals.length-1]
    let trim = {
      start: last_approval.cut_beginning,
      duration: last_approval.cut_end - last_approval.cut_beginning
    }

    // create overlay mp4
    await overlayVideos(rawVideoPath, croppingMaskPath, clippedVideoPath, {trim}).catch(next)
  }
  else {
    // create overlay mp4
    await overlayVideos(rawVideoPath, croppingMaskPath, clippedVideoPath).catch(next)
  }

  // json
  // fs.writeFileSync(metadataJsonPath, JSON.stringify(req.body.bounds))
  // csv
  let flatCsvRows = await createCsv([req.body.bounds], cropCsvPath)
  
  // return
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