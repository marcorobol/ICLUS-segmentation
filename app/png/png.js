require('dotenv').config()
const express = require('express')
var router = express.Router()
const fs = require('fs')
const hbjs = require('handbrake-js')
const ffmpeg = require('fluent-ffmpeg')
const snapshot = require('./snapshot')
const db = require('../db');



if (!('toJSON' in Error.prototype))
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {};

        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);

        return alt;
    },
    configurable: true,
    writable: true
});



function findFileByString(folder, string) {
  
  folder = folder + '/';

  if (!fs.existsSync(folder)){
    return undefined;
  }

  let files = fs.readdirSync(folder);

  for (const f of files) {
    // console.log( f.slice(0,string.length) )

    if ( fs.lstatSync(folder + f).isDirectory() ) {
      let found = findFileByString(folder + f + '/', string)
      if (found)
        return f + '/' + found;
    }

    // if it matches
    if ( f.slice(0,string.length) == string )
      return f;
  }

  return undefined;
  
}



router.use('/:imageParams.png', async function(req, res, next) {
  var imageParams = req.params.imageParams.split("_")
  if(imageParams.length==4) {
    req.params.patientId = imageParams[0];
    req.params.analysisId = imageParams[1];
    req.params.area_code = imageParams[2];
    req.params.timemark = imageParams[3];
  }
  else if(imageParams.length==3) {
    req.params.analysisId = imageParams[0];
    req.params.area_code = imageParams[1];
    req.params.timemark = imageParams[2];
    const query_res = await db.query(`SELECT * FROM app_file_flat WHERE analysis_id = $1`, [req.params.analysisId]).catch(next)
    req.params.patientId = query_res.rows[0].patient_id
  }
  getPng(req, res)
})

router.use('/:analysisId_:area_code_:timemark.png', async function(req, res, next) {
  const query_res = await db.query(`SELECT * FROM app_file_flat WHERE analysis_id = $1`, [req.params.analysisId]).catch(next)
  req.params.patientId = query_res.rows[0].patient_id
  getPng(req, res)
})

router.use('/:patient_id/:analysisId/:area_code/:timemark', async function(req, res, next) {
  getPng(req, res)
})

async function getPng(req, res)  {
  let patientId = req.params.patientId;
  let analysisId = req.params.analysisId;
  let area_code = req.params.area_code;
  let timemark = req.params.timemark;
  
  // set-up
  let folder = process.env.UNZIPPED+'/'+patientId+'/'+analysisId+'/raw/'
  let snapshotName = 'snapshot' + analysisId + '_' + area_code + '_' + timemark + '.png'

  // if snapshot exists send it back
  try {
    if (fs.existsSync(folder+snapshotName)) {
      res.sendFile(snapshotName, { root: folder })
      return
    }
  } catch(err) {
    console.log(err)
  }

  // Otherwise take new one

  // get fileName
  // let fileName = 'video_'+analysisId+'_'+area_code
  // search for raw video file
  let searchString = 'video_' + analysisId + '_' + area_code + '.';
  let videoName = await findFileByString( folder, searchString )
  if(!videoName)
    throw new Error('no file found for ' + searchString + ' in ' + folder);
  
  // get video extension
  let videoExtension = videoName.videoExtension = videoName.split('.')[1];
  if(videoExtension=='JPG' || videoExtension=='jpg')
    throw new Error('jpg file found instead of video file');

  //take snapshot
  await snapshot(folder, videoName, snapshotName, timemark)
  .catch( err => {
    console.log(err)
    res.send(err)
  })

  // respond with snapshot
  // .then( () => {
    res.sendFile(snapshotName, { root: folder })
  // })


};



module.exports = router;
