require('dotenv').config()
const db = require('../app/db');
const paths = require('../app/paths/paths');
const overlayVideos = require('../app/mp4/overlayVideos');



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

  for (let row of query_res.rows) {

    let crop_id = row.crop_id;
    let analysis_id = row.analysis_id;
    let area_code = row.area_code;

    console.log("processing " + analysis_id + "_" + area_code)
    
    if(crop_id && analysis_id && area_code) {
      
      // select file
      let file = await db.selectFile(analysis_id, area_code)
      // get patientId
      var patient_id = file.patient_id
      
      // paths
      let croppingMaskPath = paths.croppingMask(patient_id, analysis_id, area_code)
      let rawVideoPath = paths.rawVideo(patient_id, analysis_id, area_code)
      let clippedVideoPath = paths.clippedVideo(patient_id, analysis_id, area_code)

      // create overlay mp4
      await overlayVideos(rawVideoPath, croppingMaskPath, clippedVideoPath)
      .catch(
        err => console.log(err)
      )

      console.log("created video " + clippedVideoPath)
      
    }
  }
}

script()
.catch( (err) => console.log(err) )



module.exports = script;