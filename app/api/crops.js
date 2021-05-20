var express = require('express');
var router = express.Router({mergeParams: true});
const pool = require('../pool')

router.get('/', async function(req, res) {
  console.log("crops.get")
  let client = await pool.connect();
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
  const crop_bounds = JSON.stringify(req.body.bounds)

  let client = await pool.connect();
  let query = `INSERT INTO crops VALUES ( DEFAULT, $1, $2, $3, $4, $5 )`;
  let query_res = await client.query(query, [crop_created_at, user_id, analysis_id, area_code, crop_bounds])
    .catch(err => {
      console.log(err.stack)
    })
  client.release()
  res.json(query_res);
});

router.delete('/:crop_id', async function(req, res) {
  let client = await pool.connect();
  let query = `DELETE FROM segmentation WHERE crop_id = '${req.params.crop_id}'`;
  let query_res = await client.query(query)
  .catch(err => {
    console.log(err.stack)
  })
  client.release()
  
  res.json(query_res);
});


module.exports = router;