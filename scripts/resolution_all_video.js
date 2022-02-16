require('dotenv').config()
const sizeOf = require('image-size');
const db = require('../app/db');
const paths = require('../app/paths/paths');



function sizeOfPromisified(snapshotPath) {
  return new Promise( (res,rej) => {
    sizeOf(snapshotPath, function (err, resolution) {
      if (err) rej(err);
      res(resolution);
    });
  })
}



async function resolution_all_video() {

  const rows = await db.selectFiles();//.catch( err => console.log(err) )
  
  for (let row of rows) {
    
    let patientId = row.patient_id;
    let analysisId = row.analysis_id;
    let areaCode = row.file_area_code;
    
    console.log("Resolving ", patientId, analysisId, areaCode)
    
    let snapshotPath = paths.snapshot(patientId, analysisId, areaCode)

    await sizeOfPromisified(snapshotPath)
    .then( (resolution) => {
      row.extra.resolution = resolution;
      return db.query(`UPDATE app_file_flat SET extra = $1 WHERE CONCAT(analysis_id,'_',file_area_code)=$2`,
        [row.extra, row.analysis_id+'_'+row.file_area_code] );
    })
    .catch( err => console.log(err) )

  }

}

resolution_all_video()
.catch( err => console.log(err) )



module.exports = resolution_all_video;