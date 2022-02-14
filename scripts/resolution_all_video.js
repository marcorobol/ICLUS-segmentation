require('dotenv').config()
const db = require('./app/db');
const sizeOf = require('image-size');



function sizeOfPromisified(snapshotPath) {
  return new Promise( (res,rej) => {
    sizeOf(snapshotPath, function (err, resolution) {
      if (err) rej(err);
      res(resolution);
    });
  })
}



async function resolution_all_video() {

  const query_res = await db.query(`SELECT * FROM app_file_flat`).catch(next)

  for (row of query_res.rows) {
    console.log("Resolving ", row.patient_id, row.analysis_id, row.file_area_code)
    
    let folder = process.env.UNZIPPED+'/'+row.patient_id+'/'+row.analysis_id+'/raw/'
    var snapshotPath = folder + 'snapshot_' + row.analysis_id + '_' + row.file_area_code + '.png'
    
    await sizeOfPromisified(snapshotPath)
    .then( async (resolution) => {
      row.extra.resolution = resolution

      await db.query(`UPDATE app_file_flat SET extra = $1 WHERE CONCAT(analysis_id,'_',file_area_code)=$2`,
        [row.extra, row.analysis_id+'_'+row.file_area_code] ).catch(next)
    })
    .catch( (err) => {} )

  }

}
resolution_all_video()



module.exports = resolution_all_video;