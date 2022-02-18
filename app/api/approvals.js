var express = require('express');
var router = express.Router();
const db = require('../db');
const paths = require('../paths/paths')
const createCsv = require('../zip/createCsv')



router.get('/', async function(req, res, next) {
  let query = `SELECT * FROM approvals WHERE CONCAT(analysis_id,'_',area_code) = $1 `
  console.log(query, req.analysis_id + "_" + req.area_code)
  let query_res = await db.query(query, [req.analysis_id + "_" + req.area_code])
  .catch(err => {
    next(err);
  })
  
  res.json(query_res.rows);
});

router.post('/', async function(req, res, next) {
  const approval_created_at = new Date()
  const user_id = 0;
  const analysis_id = req.analysis_id
  const area_code = req.area_code
	const depth = req.body.depth
  const frequency = req.body.frequency
  const focal_point = req.body.focal_point
  const pixel_density = req.body.pixel_density
  const cut_beginning = req.body.cut_beginning
  const cut_end = req.body.cut_end
  const comment = req.body.comment

  let query = `INSERT INTO approvals VALUES ( DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ) RETURNING *`;
  let query_res = await db.query(query, [approval_created_at, user_id, analysis_id, area_code, depth, frequency, focal_point, pixel_density, cut_beginning, cut_end, comment])
    .catch(err => {
      next(err);
    })
  
  // select file and get patient_id
  let file = await db.selectFile(analysis_id, area_code)
  const patient_id = file.patient_id
  
  // csv
  let approvalCsvPath = paths.approvalCsv(patient_id, analysis_id, area_code)
  let flatCsvRows = await createCsv([{crop_created_at: approval_created_at, user_id, analysis_id, area_code, depth, frequency, focal_point, pixel_density, cut_beginning, cut_end, comment}], approvalCsvPath)

  res.json(query_res);
});

router.delete('/:approval_id', async function(req, res, next) {
  let query = `DELETE FROM approvals WHERE
    approval_id = '${req.params.approval_id}'
  ;`;
  let query_res = await db.query(query)
  .catch(err => {
    next(err);
  })
  
  res.json(query_res);
});


module.exports = router;