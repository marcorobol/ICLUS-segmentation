var express = require('express');
var router = express.Router();
const db = require('../db');
const paths = require('../paths/paths')
const snapshot = require('../png/snapshot')
const createSegmentedSnapshot = require('../png/createSegmentedSnapshot')

router.get('/', async function(req, res, next) {
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
    where.push( "CONCAT(analysis_id,'_',area_code) = '" + req.query.analysis_id + "_" + req.query.area_code + "'")
  
  let whereString = where.map( w=>'(' + w + ')' ).join(' AND ')
  
  let query = `SELECT * FROM segmentations ${where.length>0?'WHERE '+whereString:''}`;
  console.log(query)
  const query_res = await db.query(query).catch( next )
  
  res.json(query_res.rows);
});

var segmentations_stats = require('./segmentations_stats');
router.use('/stats', segmentations_stats)

// router.get('/stats', async function(req, res) {
//   let client = await req.pool.connect();
//   let query = `SELECT rate,	COUNT(*) as count FROM segmentations GROUP BY rate`
//   console.log(query)
//   let query_res = await client.query(query)
//   .catch(err => {
//     console.log(err.stack)
//   })
//   client.release()
//   res.json(query_res.rows);
// });



router.post('/', async function(req, res, next) {

  let query = `INSERT INTO segmentations VALUES (
    DEFAULT,
    '${req.body.analysis_id}',
    '${req.body.area_code}',
    '${req.body.timestamp}',
    '${JSON.stringify(req.body.points)}',
    '${req.body.rate}'
  ) RETURNING *`;

  let query_res = await db.query(query)
  .catch(err => {
    console.log(err.stack)
  })



  // Take snapshot and create segmentation
  {
    const analysis_id = req.body.analysis_id;
    const area_code = req.body.area_code;
    const timemark = req.body.timestamp;
    const points = req.body.points;
    const rate = req.body.rate;
    const segmentation_id = query_res.rows[0].segmentation_id
    
    // select file and get patient_id
    let entry = await db.select_file(analysis_id, area_code)
    const patient_id = entry.patient_id
    
    // paths
    let rawVideoPath = paths.rawVideo(patient_id, analysis_id, area_code)
    let snapshotPath = paths.snapshot(patient_id, analysis_id, area_code, timemark)
    let segmentationPath = paths.segmentation(patient_id, analysis_id, area_code, timemark, segmentation_id, rate)

    // jpg file found instead of video file
    // let videoExtension = rawVideoPath.split('.')[1];
    // if(videoExtension=='JPG' || videoExtension=='jpg')
    //   throw new Error('jpg file found instead of video file');

    // take snapshot
    await snapshot(rawVideoPath, snapshotPath, timemark).catch( next )

    // create mask png
    await createSegmentedSnapshot(snapshotPath, segmentationPath, points)

  }
  

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