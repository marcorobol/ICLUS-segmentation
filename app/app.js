const express = require('express');
const app = express();
const serveIndex = require('serve-index');
const fs = require('fs');
const { Pool } = require('pg')
const pool = require('./pool')
require('dotenv').config()
const hbjs = require('handbrake-js')


/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');



/**
 * Serve front-end static files
 */
app.use('/', express.static('static'));
app.use('/unzipped', express.static(process.env.UNZIPPED), serveIndex(process.env.UNZIPPED, { 'icons': true }) );
app.use('/mp4/:patientId/:analysisId/:area_code/video', async function(req, res) {
  let patientId = req.params.patientId;
  let analysisId = req.params.analysisId;
  let area_code = req.params.area_code;
  
  let folder = process.env.UNZIPPED+'/'+patientId+'/'+analysisId+'/raw/'
  let fileName = 'video_'+analysisId+'_'+area_code
  let mp4Path = folder+fileName+'.mp4'
  
  if ( !fs.existsSync(mp4Path) ) {
    let rawFile = findFile(folder, fileName)
    await new Promise( (res, rej) => {
      hbjs.spawn({ input: folder+rawFile, output: mp4Path, crop:"<0:0:0:0>" }) //"loose-anamorphic": true
        .on('error', err => {
          console.log(err)
          // rej()
        }) // invalid user input, no video found etc
        .on('progress', progress => {
          console.log(
            'Percent complete: %s, ETA: %s',
            progress.percentComplete,
            progress.eta
          )
        })
        .on('complete', () => res() )
      })
  }

  res.sendFile(fileName+'.mp4', { root: folder })
});


function findFile(folder, fileName) {
  let files = fs.readdirSync(folder);
    for (var f of files) {
      if ( f.split('.')[0] == fileName )
        return f;
    }
}


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
    rawVideoUrl: '../mp4/'+patientId+'/'+analysisId+'/'+area_code,
    // rawVideoUrl: '../unzipped/'+patientId+'/'+analysisId+'/cropped/crop_video_'+analysisId+'_'+area_code+'.mp4'
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

app.get('/segment', async function(req, res) {

  if (!req.query.patient_id || !req.query.analysis_id || !req.query.area_code) {

    let client = await pool.connect();
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
  res.render('segment.ejs', {
    rawVideoUrl: '../mp4/'+patientId+'/'+analysisId+'/'+area_code+'/video',
    // rawVideoUrl: '../unzipped/'+patientId+'/'+analysisId+'/cropped/crop_video_'+analysisId+'_'+area_code+'.mp4',
    // rawVideoUrl: '../unzipped/'+patientId+'/'+analysisId+'/raw/video_'+analysisId+'_'+area_code+'.avi', // TODO stream .avi
    annotationPngUrl: '../unzipped/'+patientId+'/'+analysisId+'/raw/annotation_'+analysisId+'_'+area_code+'.png'
  });
});



/**
 * API
 */
app.use('/api', async function(req, res, next) {
  console.log('API '+req.method+' request on /api' + req.path)
  next();
})

var api_segmentations = require('./api/segmentations');
app.use('/api/', api_segmentations)

var api_stats = require('./api/stats');
app.use('/api/stats', api_stats)

var api_stats_federico = require('./api/stats_federico');
app.use('/api/stats_federico', api_stats_federico)

var api_videos_federico = require('./api/videos_federico');
app.use('/api/videos_federico/', api_videos_federico)

var api_videos = require('./api/videos');
app.use('/api/videos/', api_videos)



/**
 * Default 404 handler
 */ 
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});



module.exports = app;
