require('dotenv').config()
const fs = require('fs')
const db = require('../app/db');
const paths = require('../app/paths/paths');
const overlayVideos = require('../app/mp4/overlayVideos');
const { listen } = require('../app/app');



async function script() {

  const query_res = await db.query(`SELECT * FROM (
  
  SELECT crops.*,
    approvals_count
  FROM
  
  crops
  
  LEFT JOIN
  
  (
  SELECT approvals.analysis_id,
    approvals.area_code,
    COUNT (approvals.approval_id) AS approvals_count
  FROM approvals
  GROUP BY approvals.analysis_id, approvals.area_code
  ) AS ap
  
  ON CONCAT(crops.analysis_id,crops.area_code) = CONCAT(ap.analysis_id,ap.area_code)
  
  WHERE approvals_count is null
    
  ) AS crops_missing_approval;
  `)

  // console.log(query_res)

  var results = {already_exist: [], created: []}

  for (let row of query_res.rows) {

    let crop_id = row.crop_id;
    let analysis_id = row.analysis_id;
    let area_code = row.area_code;
    
    if(crop_id && analysis_id && area_code) {
      
      // select file
      let file = await db.selectFile(analysis_id, area_code)
      // get patientId
      var patient_id = file.patient_id
      
      // paths
      let croppingMaskPath = paths.croppingMask(patient_id, analysis_id, area_code)
      let rawVideoPath = paths.rawVideo(patient_id, analysis_id, area_code)
      let clippedVideoPath = paths.clippedVideo(patient_id, analysis_id, area_code)

      if (fs.existsSync(clippedVideoPath)) {
        console.log("skipped " + clippedVideoPath)
        results.already_exist.push(clippedVideoPath)
        continue;
      }

      // create overlay mp4
      await overlayVideos(rawVideoPath, croppingMaskPath, clippedVideoPath)
      .catch(
        err => console.log(err)
      )

      console.log("created " + clippedVideoPath)
      results.created.push(clippedVideoPath)
      
    }
  }

  return results;
}

script()
.catch( (err) => console.log(err) )



module.exports = script;