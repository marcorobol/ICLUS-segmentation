require('dotenv').config()
const fs = require('fs')
const db = require('../app/db');
const paths = require('../app/paths/paths');
const convertVideo = require('../app/mp4/convertVideo');



async function convert_all_video() {

  const query_res = await db.query(`SELECT * FROM app_file_flat`)

  for (let row of query_res.rows) {

    let patientId = row.patient_id;
    let analysisId = row.analysis_id;
    let areaCode = row.file_area_code;

    console.log("Converting ", patientId, analysisId, areaCode)
    
    if(patientId && analysisId && areaCode) {
      
      let mp4Path = paths.mp4Video(patientId, analysisId, areaCode)
      let rawVideo = paths.rawVideo(patientId, analysisId, areaCode)
      
      if ( !fs.existsSync(mp4Path) && rawVideo ) {

        await convertVideo(rawVideo, mp4Path)
        .catch( (err) => console.log(err, "Skipping ", patientId, analysisId, areaCode) )
        
      }
    }
  }
}

convert_all_video()
.catch( (err) => console.log(err) )



module.exports = convert_all_video;