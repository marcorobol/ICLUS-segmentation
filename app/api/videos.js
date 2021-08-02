var express = require('express');
var router = express.Router();
var api_crops = require('./crops');
var api_approvals = require('./approvals');
const db = require('../db');


router.get('/', async function(req, res, next) { //?where=depth%20IS%20NOT%20NULL

  const where = []
  if (req.query.where && Array.isArray(req.query.where))
    where.push.apply( where, req.query.where )
  else if (req.query.where)
    where.push( req.query.where )
  
  let query = `SELECT * FROM app_file_flat ${where.length>0?'WHERE '+where.map( w=>'('+w+')').join(' AND '):''}`;
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

module.exports = router;