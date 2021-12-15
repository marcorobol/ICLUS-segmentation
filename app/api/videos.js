var express = require('express');
var router = express.Router();
var api_crops = require('./crops');
var api_approvals = require('./approvals');
const db = require('../db');
const multer = require("multer");


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

router.post('/', async function(req, res, next) {
  
  let query = `INSERT INTO app_file_flat (operator_id, patient_id, analysis_id, file_area_code, analysis_status, rating_operator, depth, frequency, focal_point, pixel_density)
    VALUES (${req.body.operator_id}, ${req.body.patient_id}, ${req.body.analysis_id}, ${req.body.file_area_code}, ${req.body.analysis_status}, ${req.body.rating_operator}, ${req.body.depth}, ${req.body.frequency}, ${req.body.focal_point}, ${req.body.pixel_density})`;
  let query_res = await db.query(query)
  .catch(err => {
    next(err);
  })
  
  // console.log(req.files)

  res.json(query_res);
});

module.exports = router;