var express = require('express');
var router = express.Router();
var api_crops = require('./crops');
var api_approvals = require('./approvals');
const db = require('../db');
const multer = require("multer");
const fs = require('fs');



router.get('/', async function(req, res, next) { //?where=depth%20IS%20NOT%20NULL

  const where = []
  if (req.query.where && Array.isArray(req.query.where))
    where.push.apply( where, req.query.where )
  else if (req.query.where)
    where.push( req.query.where )
  
  let whereString = where.map( w=>'(' + w + ')' ).join(' AND ')
  
  let query = `SELECT * FROM app_file_flat ${where.length>0?'WHERE '+whereString:''}`;
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
  
  let query = `SELECT * FROM app_file_flat WHERE CONCAT(analysis_id,'_',file_area_code)='${req.params.video_ref}'`
  let query_res = await db.query(query)
  .catch(err => {
    next(err);
  })
  
  res.json(query_res.rows[0]);
});

router.put('/:video_ref', async function(req, res, next) {
  
  let query = `UPDATE app_file_flat SET
    analysis_status='${req.body.analysis_status}',
    rating_operator='${req.body.rating_operator}',
    depth='${req.body.depth}',
    frequency='${req.body.frequency}',
    focal_point='${req.body.focal_point}',
    pixel_density='${req.body.pixel_density}'
  WHERE CONCAT(analysis_id,'_',file_area_code)='${req.params.video_ref}'`;
  let query_res = await db.query(query)
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
  if ( !fs.existsSync(assignedCompletePath) ) {
    fs.copyFile( file.path, assignedCompletePath, ()=>{} );
  }

  let query = `INSERT INTO app_file_flat (operator_id, patient_id, analysis_id, file_area_code, analysis_status, rating_operator, depth, frequency, focal_point, pixel_density)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
  let query_res = await db.query(query, [body.operator_id, body.patient_id, body.analysis_id, body.file_area_code, body.analysis_status, body.rating_operator, body.depth, body.frequency, body.focal_point, body.pixel_density] ).catch( next)
  
});

module.exports = router;