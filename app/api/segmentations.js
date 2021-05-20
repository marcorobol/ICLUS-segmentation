var express = require('express');
var router = express.Router();
const pool = require('../pool')

router.get('/segmentations', async function(req, res) {
  let client = await pool.connect();
  let query = `SELECT * FROM segmentations WHERE CONCAT(analysis_id,'_',area_code) = $1 `
  console.log(query)
  let query_res = await client.query(query, [req.query.analysis_id + "_" + req.query.area_code])
  .catch(err => {
    console.log(err.stack)
  })
  client.release()
  
  res.json(query_res.rows);
});

router.get('/segmentations/stats', async function(req, res) {
  let client = await pool.connect();
  let query = `SELECT rate,	COUNT(*) as count FROM segmentations GROUP BY rate`
  console.log(query)
  let query_res = await client.query(query)
  .catch(err => {
    console.log(err.stack)
  })
  client.release()
  res.json(query_res.rows);
});

router.post('/segmentations', async function(req, res) {
  let client = await pool.connect();
  let query = `INSERT INTO segmentations VALUES (
    DEFAULT,
    '${req.body.analysis_id}',
    '${req.body.area_code}',
    '${req.body.timestamp}',
    '${JSON.stringify(req.body.points)}',
    '${req.body.rate}'
  ) RETURNING *`;
  let query_res = await client.query(query)
  .catch(err => {
    console.log(err.stack)
  })
  client.release()
  
  res.json(query_res);
});

router.delete('/segmentations/:segmentation_id', async function(req, res) {
  let client = await pool.connect();
  let query = `DELETE FROM segmentations WHERE
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