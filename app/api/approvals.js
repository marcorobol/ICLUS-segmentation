var express = require('express');
var router = express.Router();

router.get('/', async function(req, res) {
  let client = await req.pool.connect();
  let query = `SELECT * FROM approvals WHERE CONCAT(analysis_id,'_',area_code) = $1 `
  console.log(query, req.analysis_id + "_" + req.area_code)
  let query_res = await client.query(query, [req.analysis_id + "_" + req.area_code])
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
	const depth = req.body.depth
  const frequency = req.body.frequency
  const focal_point = req.body.focal_point
  const pixel_density = req.body.pixel_density
  const cut_beginning = req.body.cut_beginning
  const cut_end = req.body.cut_end
  const comment = req.body.comment

  let client = await req.pool.connect();
  let query = `INSERT INTO approvals VALUES ( DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 ) RETURNING *`;
  let query_res = await client.query(query, [crop_created_at, user_id, analysis_id, area_code, depth, frequency, focal_point, pixel_density, cut_beginning, cut_end, comment])
    .catch(err => {
      console.log(err.stack)
    })
  client.release()
  res.json(query_res);
});

router.delete('/:approval_id', async function(req, res) {
  let client = await req.pool.connect();
  let query = `DELETE FROM approvals WHERE
    approval_id = '${req.params.approval_id}'
  ;`;
  let query_res = await client.query(query)
  .catch(err => {
    console.log(err.stack)
  })
  client.release()
  
  res.json(query_res);
});


module.exports = router;