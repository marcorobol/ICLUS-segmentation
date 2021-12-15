var express = require('express');
var router = express.Router();
const db = require('../db');

router.get('/', async function(req, res) {
  // let client = await req.pool.connect();
  // let query = `SELECT * FROM segmentations WHERE CONCAT(analysis_id,'_',area_code) = $1 `
  // console.log(query)
  // let query_res = await client.query(query, [req.query.analysis_id + "_" + req.query.area_code])
  // .catch(err => {
  //   console.log(err.stack)
  // })
  // client.release()

  const where = []
  if (req.query.where && Array.isArray(req.query.where))
    where.push.apply( where, req.query.where )
  else if (req.query.where)
    where.push( req.query.where )
  
  if (req.query.analysis_id && req.query.area_code)
    where.push.apply( where, "CONCAT(analysis_id,'_',area_code) = " + req.query.analysis_id + "_" + req.query.area_code )
  
  let whereString = where.map( w=>'(' + w + ')' ).join(' AND ')
  
  let query = `SELECT * FROM segmentations ${where.length>0?'WHERE '+whereString:''}`;
  const query_res = await db.query(query)
  .catch(err => {
    next(err);
  })
  
  res.json(query_res.rows);
});

router.get('/stats', async function(req, res) {
  let client = await req.pool.connect();
  let query = `SELECT rate,	COUNT(*) as count FROM segmentations GROUP BY rate`
  console.log(query)
  let query_res = await client.query(query)
  .catch(err => {
    console.log(err.stack)
  })
  client.release()
  res.json(query_res.rows);
});

router.post('/', async function(req, res) {
  let client = await req.pool.connect();
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

router.delete('/:segmentation_id', async function(req, res) {
  let client = await req.pool.connect();
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