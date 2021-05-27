require('dotenv').config()
const express = require('express')
const router = express.Router()
const path = require('path')


router.get('/', async function(req, res) {
  console.log('GET /segment')

  if (!req.query.patient_id || !req.query.analysis_id || !req.query.area_code) {

    let client = await req.pool.connect();
    let query = `SELECT * FROM app_file_flat ORDER BY RANDOM() LIMIT 1;`
    let query_res = await client.query(query)
    .catch(err => { console.log(err.stack) })
    client.release()
    let patient_id = query_res.rows[0].patient_id
    let analysis_id = query_res.rows[0].analysis_id
    let area_code = query_res.rows[0].file_area_code

    res.redirect('?patient_id=' + patient_id + "&analysis_id=" + analysis_id + "&area_code=" + area_code);
    return;
  }

  let patientId = req.query.patient_id;
  let analysisId = req.query.analysis_id;
  let area_code = req.query.area_code;
  console.log(path.join(__dirname, './'))
  res.sendFile('./segment.html', { root: path.join(__dirname, './') })
  .catch( (err) => { console.err(err) })
  // res.render('segment.ejs', {
  //   rawVideoUrl: '../mp4/'+patientId+'/'+analysisId+'/'+area_code+'/video',
  //   annotationPngUrl: '../unzipped/'+patientId+'/'+analysisId+'/raw/annotation_'+analysisId+'_'+area_code+'.png'
  // });
});



module.exports = router;
