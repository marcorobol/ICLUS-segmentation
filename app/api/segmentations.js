var express = require('express');
var router = express.Router();
const pool = require('../pool')

router.get('/segmentations', async function(req, res) {
  let client = await pool.connect();
  let query = `SELECT * FROM segmentation WHERE CONCAT(analysis_id,'_',area_code)='${req.query.analysis_id}_${req.query.area_code}'`
  let query_res = await client.query(query)
  .catch(err => {
    console.log(err.stack)
  })
  client.release()
  
  res.json(query_res.rows);
});

router.post('/segmentations', async function(req, res) {
  let client = await pool.connect();
  let query = `INSERT INTO segmentation VALUES (
    DEFAULT,
    '${req.body.analysis_id}',
    '${req.body.area_code}',
    '${req.body.timestamp}',
    '${JSON.stringify(req.body.points)}',
    '${req.body.rate}'
  )`;
  let query_res = await client.query(query)
  .catch(err => {
    console.log(err.stack)
  })
  client.release()
  
  res.json(query_res);
});

router.delete('/segmentations/:segmentation_id', async function(req, res) {
  let client = await pool.connect();
  let query = `DELETE FROM segmentation WHERE
    segmentation_id = '${req.params.segmentation_id}'
  ;`;
  let query_res = await client.query(query)
  .catch(err => {
    console.log(err.stack)
  })
  client.release()
  
  res.json(query_res);
});


module.exports = router;