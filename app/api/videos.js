var express = require('express');
var router = express.Router();
var api_crops = require('./crops');
var api_approvals = require('./approvals');
const db = require('../db');
var videoElaborator = require('../video_elaborator/videoElaborator');
const multer = require("multer");
const fs = require('fs');



router.get('/', async function(req, res, next) { //?where=depth%20IS%20NOT%20NULL

  const where = []
  if (req.query.where && Array.isArray(req.query.where))
    where.push.apply( where, req.query.where )
  else if (req.query.where)
    where.push( req.query.where )
  
  let whereString = where.map( w=>'(' + w + ')' ).join(' AND ')
  
  let query = `SELECT * FROM files_segmentations ${where.length>0?'WHERE '+whereString:''}`;
  const query_res = await db.query(query)
  .catch(err => {
    next(err);
  })
  
  // for (const row of rows) {
  //     [row.structure_id, row.operator_id, row.patient_id, row.analysis_id, row.analysis_status, row.file_id, row.file_area_code, row.rating_operator]);
  // }
  
  // console.log('API respond to ' + req.path)
  res.json(query_res.rows);
});

router.use('/:video_ref', async function(req, res, next) {
  req.video_ref = req.params.video_ref
  req.analysis_id = req.params.video_ref.split('_')[0]
  req.area_code = req.params.video_ref.split('_')[1]
  next();
});

router.use('/:video_ref/crops', api_crops);
router.use('/:video_ref/approvals', api_approvals);

router.get('/:video_ref', async function(req, res, next) {
  
  let query = `SELECT * FROM files_segmentations WHERE CONCAT(analysis_id,'_',file_area_code)='${req.params.video_ref}'`
  let query_res = await db.query(query)
  .catch(err => {
    next(err);
  })
  
  res.json(query_res.rows[0]);
});

router.put('/:video_ref', async function(req, res, next) {
  
  let analysis_status = (req.body.analysis_status=='null'?null:req.body.analysis_status)
  let rating_operator = (req.body.rating_operator=='null'?null:req.body.rating_operator)
  let depth = parseFloat(req.body.depth)||null
  let frequency = parseFloat(req.body.frequency)||null
  let focal_point = parseFloat(req.body.focal_point)||null
  let pixel_density = parseFloat(req.body.pixel_density)||null
  let frames = parseInt(req.body.frames)
  let patient_key = (req.body.patient_key=='null'?null:req.body.patient_key)
  let profile_label = req.body.profile_label
  let profile_scanner_brand = req.body.profile_scanner_brand

  let query = `UPDATE app_file_flat SET analysis_status=$1, rating_operator=$2, depth=$3, frequency=$4, focal_point=$5, pixel_density=$6, frames=$7, patient_key=$8, profile_label=$9, profile_scanner_brand=$10
  WHERE CONCAT(analysis_id,'_',file_area_code)=$11`;
  let query_res = await db.query(query, [analysis_status,rating_operator,depth,frequency,focal_point,pixel_density,frames,patient_key,profile_label,profile_scanner_brand, req.params.video_ref])
  .catch(err => {
    next(err);
  })
  
  res.json(query_res.rows[0]);
});

router.delete('/:video_ref', async function(req, res, next) {
  
  let query = `DELETE FROM app_file_flat WHERE CONCAT(analysis_id,'_',file_area_code)='${req.params.video_ref}'`;
  let query_res = await db.query(query)
  .catch(err => {
    next(err);
  })
  
  res.json(query_res.rows[0]);
});



const upload = multer({ dest: './uploads/' })
router.post('/', upload.single('file'), async function(req, res, next) {
  
  let file = req.file
  // file = {
  //   fieldname: 'file',
  //   originalname: 'steps and data.png',
  //   encoding: '7bit',
  //   mimetype: 'image/png',
  //   destination: './uploads/',
  //   filename: '2d16f5b084a7244ce1ea6451e98c1a97',
  //   path: 'uploads\\2d16f5b084a7244ce1ea6451e98c1a97',
  //   size: 146279
  // }
  let body = req.body
  // body = {
  //   operator_id: '1',
  //   patient_id: '1',
  //   analysis_id: '1',
  //   file_area_code: '0',
  //   analysis_status: '0',
  //   rating_operator: '0',
  //   depth: '0',
  //   frequency: '0',
  //   focal_point: '0',
  //   pixel_density: '0',
  //   profile_scanner_brand: '0'
  // }
  console.log(file, body)
  
  let patientId = body.patient_id
  let analysisId = body.analysis_id
  let areaCode = body.file_area_code

  let assignedFolder = process.env.UNZIPPED+'/'+patientId+'/'+analysisId+'/raw/'
  let assignedFileName = 'video_'+analysisId+'_'+areaCode
  let originalFileExtension = file.originalname.split('.').slice(-1)
  let assignedCompletePath = assignedFolder+assignedFileName+'.'+originalFileExtension
  


  if ( !fs.existsSync(assignedFolder) )
    fs.mkdirSync(assignedFolder, { recursive: true });
  if ( !fs.existsSync(assignedCompletePath) )
    fs.copyFileSync( file.path, assignedCompletePath, fs.constants.COPYFILE_EXCL );
  

  
  let elabData = await videoElaborator(
    rawFolder = assignedFolder,
    videoFileName = assignedFileName+'.'+originalFileExtension,
    'snapshot_'+analysisId+'_'+areaCode+'.png'
  );
  console.log(elabData)

  
  let operator_id = body.operator_id
  let patient_id = body.patient_id
  let analysis_id = body.analysis_id
  let file_area_code = body.file_area_code
  let analysis_status = (body.analysis_status=='null'?null:body.analysis_status)
  let rating_operator = (body.rating_operator=='null'?null:body.rating_operator)
  let depth = parseFloat(elabData.depth.value)||null
  let frequency = parseFloat(elabData.frequency.value)||null
  let focal_point = parseFloat(elabData.focalPoint.value)||null
  let pixel_density = parseFloat(elabData.pixel_density)||null
  let frames = parseInt(elabData.nb_frames)
  let patient_key = (body.patient_key=='null'?null:body.patient_key)
  let profile_label = elabData.profileLabel
  let profile_scanner_brand = elabData.profileScannerBrand
  let extra = elabData
  
  let query = `INSERT INTO app_file_flat (operator_id, patient_id, analysis_id, file_area_code, analysis_status, rating_operator, depth, frequency, focal_point, pixel_density, frames, patient_key, profile_label, profile_scanner_brand, extra)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`;
  let query_res = await db.query(query, [operator_id, patient_id, analysis_id, file_area_code, analysis_status, rating_operator, depth, frequency, focal_point, pixel_density, frames, patient_key, profile_label, profile_scanner_brand, JSON.stringify(extra)] ).catch( next)
  
  res.json(query_res);
});

module.exports = router;