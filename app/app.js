const express = require('express');
const app = express();
const serveIndex = require('serve-index');
const fs = require('fs');
const { Pool } = require('pg')
require('dotenv').config()



/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');



/**
 * Postgres pool connection
 */
const pool = new Pool()
// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})



/**
 * Serve front-end static files
 */
app.use('/', express.static('static'));
app.use('/unzipped', express.static('../ICLUS-crawler/unzipped'), serveIndex('../ICLUS-crawler/unzipped', { 'icons': true }) );



/**
 * Web pages routing
 */
// http://localhost:8080/crop_image/1049/1125/1
// http://localhost:8080/crop_image?patientId=1049&analysisId=1125&area_code=1
app.get('/crop_image', function(req, res) {
  let patientId = req.query.patientId;
  let analysisId = req.query.analysisId;
  let area_code = req.query.area_code;
  res.render('crop.ejs', {
    rawVideoUrl: '../unzipped/'+patientId+'/'+analysisId+'/cropped/crop_video_'+analysisId+'_'+area_code+'.mp4',
    // rawVideoUrl: '../unzipped/'+patientId+'/'+analysisId+'/raw/video_'+analysisId+'_'+area_code+'.avi', // TODO stream .avi
    annotationPngUrl: '../unzipped/'+patientId+'/'+analysisId+'/raw/annotation_'+analysisId+'_'+area_code+'.png'
  });
});

app.get('/overview', function(req, res) {
    let rawdata = fs.readFileSync('./db.json');
    let db = JSON.parse(rawdata);
    res.render('overview.ejs', {patients: db});
});

let rawdata = fs.readFileSync('./db.json');
let db = JSON.parse(rawdata);
// let filderedPatients = [];
// Object.entries(db).forEach(patient => {
//     if (patient.analyses)
//         filderedPatients.push(patient);
// });
// let randomIndex = Math.round( Math.random() * filderedPatients.length )
// console.log(filderedPatients[randomIndex])

let video = {
    "areaId": 1616,
    "areaCode": "1",
    "status": 3,
    "statusMessage": "SEGMENTED",
    "rating_operator": 2,
    "original_path": "operators/1014/patients/1052/analisys/1129/raw/video_1129_1.avi",
    "videoExtension": "avi",
    "nb_frames": 231,
    "profileLabel": "avi880_688",
    "profileScannerBrand": "EsaoteMyLab",
    "depth": {
      "value": 110
    },
    "frequency": {
      "value": 5
    },
    "focalPoint": {
      "value": 20,
      "extraData": {
        "focalPoint": 22,
        "rulerLenght": 100,
        "focalPointTopPx": 297,
        "rulerTicksTopPxs": [
          200,
          244,
          289,
          333,
          377,
          421,
          466,
          510,
          554,
          598,
          643
        ],
        "rulerZeroTopPx": 200,
        "rulerMaxTopPx": 643,
        "depthTopPx": 487.3,
        "pixelsPerCm": 44.3
      }
    },
    "resolution": 44.3
};
video = db[1052].analyses[1129].areas[1];

app.get('/segment', function(req, res) {
    res.render('segment.ejs', {rawVideoUrl: `unzipped/1052/1129/cropped/crop_video_1129_1.mp4` } );
});



/**
 * API
 */
app.use('/api', async function(req, res, next) {
  console.log('API '+req.method+' request on /api' + req.path)
  next();
})

app.get('/api/videos', async function(req, res) {
  
  client = await pool.connect();
  
  query_res = await client.query(`SELECT * FROM app_file_flat WHERE depth IS NOT NULL`)
  .catch(err => {
    console.log(err.stack)
  })

  client.release()
  
  // for (const row of rows) {
  //     [row.structure_id, row.operator_id, row.patient_id, row.analysis_id, row.analysis_status, row.file_id, row.file_area_code, row.rating_operator]);
  // }
  
  console.log('API respond to ' + req.path)
  res.json(query_res.rows);
});

app.get('/api/stats', async function(req, res) {

  // console.log(req.query.groupBy);

  const groupByDepth = req.query.groupBy.includes('depth')
  const groupByFrequency = req.query.groupBy.includes('frequency')
  const groupByPixelDensity = req.query.groupBy.includes('pixel_density')
  const groupByStructure = req.query.groupBy.includes('structure')

  // console.log(req.query.roundDepthBy);
  // console.log(req.query.roundFrequencyBy);
  // console.log(req.query.roundPixelDensityBy);
  
  const roundDepthBy = req.query.roundDepthBy;
  const roundFrequencyBy = req.query.roundFrequencyBy;
  const roundPixelDensityBy = req.query.roundPixelDensityBy;
  
  let SELECT = [];
  if (groupByDepth)         SELECT.push(`depth`)
  if (groupByFrequency)     SELECT.push(`frequency`)
  if (groupByPixelDensity)  SELECT.push(`pixel_density`)
  if (groupByStructure)     SELECT.push(`structure`)
  
  let SUBSELECT = [];
  if (groupByDepth)         SUBSELECT.push((roundDepthBy?`ROUND ( depth/${roundDepthBy} )*${roundDepthBy} AS depth`:`depth`))
  if (groupByFrequency)     SUBSELECT.push((roundFrequencyBy?`ROUND ( frequency/${roundFrequencyBy} )*${roundFrequencyBy} AS frequency`:`frequency`))
  if (groupByPixelDensity)  SUBSELECT.push((roundPixelDensityBy?`ROUND ( pixel_density/${roundPixelDensityBy} )*${roundPixelDensityBy} AS pixel_density`:`pixel_density`))
  if (groupByStructure)     SUBSELECT.push(`structure_id AS structure`)
  
  let GROUP_BY = [];
  if (groupByDepth)         GROUP_BY.push(`depth`)
  if (groupByFrequency)     GROUP_BY.push(`frequency`)
  if (groupByPixelDensity)  GROUP_BY.push(`pixel_density`)
  if (groupByStructure)     GROUP_BY.push(`structure`)
  
  let ORDER_BY = [];
  for (let gp of req.query.groupBy)
    if      (gp=='depth')         ORDER_BY.push(`depth ASC`)
    else if (gp=='frequency')     ORDER_BY.push(`frequency ASC`)
    else if (gp=='pixel_density') ORDER_BY.push(`pixel_density ASC`)
    else if (gp=='structure')     ORDER_BY.push(`structure ASC`)

  let my_query = `
SELECT
${SELECT.join(',\n')}${(SELECT.length>0?',\n':'')}
SUM (frames) AS number_of_frames,
COUNT (file_id) AS number_of_files,
COUNT (DISTINCT analysis_id) AS number_of_analyses,
COUNT (DISTINCT patient_id) AS number_of_patients,
COUNT (DISTINCT operator_id) AS number_of_operators,
ARRAY_AGG (DISTINCT operator_id) operators

FROM
(
  SELECT
    ${SUBSELECT.join(',\n')}${(SUBSELECT.length>0?',\n':'')}
    frames,
    file_id,
    analysis_id,
    patient_id,
    operator_id,
    analysis_status
  FROM
    app_file_flat
) AS app_file_flat_rounded

WHERE
depth IS NOT NULL AND
analysis_status = 2

GROUP BY
${GROUP_BY.join(',\n')}

ORDER BY
${ORDER_BY.join(',\n')}

  `;

  console.log(my_query);

  let esempio = `
    SELECT
    ROUND ( depth/5 )*5 AS depth_rounded,
    SUM (frames) AS number_of_frames,
    COUNT (file_id) AS number_of_files,
    COUNT (DISTINCT analysis_id) AS number_of_analyses,
    COUNT (DISTINCT patient_id) AS number_of_patients,
    COUNT (DISTINCT operator_id) AS number_of_operator,
    ARRAY_AGG (DISTINCT operator_id) operators

    FROM
    app_file_flat

    WHERE
    depth IS NOT NULL AND
    analysis_status = 2

    GROUP BY
    depth_rounded

    ORDER BY
    depth_rounded DESC
  `;

  client = await pool.connect();
  query_res = await client.query(my_query)
  .catch(err => {
    console.log(err.stack)
  })

  client.release()
  
  // for (const row of rows) {
  //     [row.structure_id, row.operator_id, row.patient_id, row.analysis_id, row.analysis_status, row.file_id, row.file_area_code, row.rating_operator]);
  // }
  
  res.json(query_res.rows);
});

app.get('/api/videos/:video_ref', function(req, res) {
    res.json('hi', req.params.video_ref );
});



/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});



module.exports = app;
