var express = require('express');
var router = express.Router();
const pool = require('../pool');
var api_crops = require('./crops');
var api_approvals = require('./approvals');


router.get('/', async function(req, res) { //?where=depth%20IS%20NOT%20NULL
  console.log("videos_federico.get")

  let where = req.query.where
  where = (Array.isArray(where)?where:[where])
    
  const client = await pool.connect();
  let query = `SELECT * FROM federico_dataset ${where?'WHERE '+where.join(' AND '):''} `;
  const query_res = await client.query(query)
  .catch(err => {
    console.log(err.stack)
  })
  client.release();
  
  // for (const row of rows) {
  //     [row.structure_id, row.operator_id, row.patient_id, row.analysis_id, row.analysis_status, row.file_id, row.file_area_code, row.rating_operator]);
  // }
  
  // console.log('API respond to ' + req.path)
  res.json(query_res.rows);
});

module.exports = router;