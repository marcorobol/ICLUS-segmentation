require('dotenv').config()
const fs = require('fs')
const path = require('path');
const db = require('../app/db');
const paths = require('../app/paths/paths');
const s3_utils = require('./s3_utils');
const videoElaborator = require('../app/video_elaborator/videoElaborator');



async function downloadAllVideosFromS3() {

  const query_res = await db.query(`SELECT * FROM app_file_flat`)

  for (let row of query_res.rows) {

    let operatorId = row.operator_id;
    let patientId = row.patient_id;
    let analysisId = row.analysis_id;
    let areaCode = row.file_area_code;
    
    console.log(patientId, analysisId, areaCode, paths.rawVideo(patientId, analysisId, areaCode))

    // if video does not exists locally
    if(null==paths.rawVideo(patientId, analysisId, areaCode) ) {

      var entries = await s3_utils.getEntries(`operators/${operatorId}/patients/${patientId}/analisys/${analysisId}/raw/`)
      var rawFileS3Key = entries.find( (e) => e.includes(`video_${analysisId}_${areaCode}`) )
      
      let rawVideoPath = paths.rawVideo(patientId, analysisId, areaCode, path.extname(rawFileS3Key))
      let snapshotPath = paths.snapshot(patientId, analysisId, areaCode)

      // let rawFolderS3Key = `operators/${operatorId}/patients/${patientId}/analisys/${analysisId}/raw/`
      // await s3_utils.downloadFolder(rawFolderS3Key, rawFolderPath)

      console.log('going to download s3://' + rawFileS3Key)
      await s3_utils.downloadFile(rawFileS3Key, rawVideoPath)

      let elabData = await videoElaborator(rawVideoPath, snapshotPath)

      
      let operator_id = operatorId
      let patient_id = patientId
      let analysis_id = analysisId
      let file_area_code = areaCode
      let depth = parseFloat(elabData.depth.value)||null
      let frequency = parseFloat(elabData.frequency.value)||null
      let focal_point = parseFloat(elabData.focalPoint.value)||null
      let pixel_density = parseFloat(elabData.pixel_density)||null
      let frames = parseInt(elabData.nb_frames)
      let profile_label = elabData.profileLabel
      let profile_scanner_brand = elabData.profileScannerBrand
      let extra = Object.assign({}, row.extra, elabData)
      
      let query = `UPDATE app_file_flat SET depth=$1, frequency=$2, focal_point=$3, pixel_density=$4, frames=$5, profile_label=$6, profile_scanner_brand=$7, extra=$8
      WHERE CONCAT(analysis_id,'_',file_area_code)=$9`;
      let values = [ depth, frequency, focal_point, pixel_density, frames, profile_label, profile_scanner_brand, JSON.stringify(extra), analysis_id+'_'+file_area_code ]
      await db.query(query, values)
      
      console.log(values)
    }
  }
}

downloadAllVideosFromS3()
.catch( (err) => { console.log(err.stack) } )



// module.exports = downloadAllVideosFromS3;