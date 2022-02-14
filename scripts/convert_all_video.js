require('dotenv').config()
const express = require('express')
const fs = require('fs')
const hbjs = require('handbrake-js')
const db = require('./app/db');


async function convert_all_video() {

  const query_res = await db.query(`SELECT * FROM app_file_flat`).catch(next)
  for (row of query_res.rows) {
    console.log("Converting ", row.patient_id, row.analysis_id, row.file_area_code)
    if(row.patient_id && row.analysis_id && row.file_area_code)
      try{
        await mp4ConverterHandler(row.patient_id, row.analysis_id, row.file_area_code)
      } catch{ (err) => console.log("Skipping ", row.patient_id, row.analysis_id, row.file_area_code) }
  }
}
convert_all_video()

function findFile(folder, fileName) {
  let files = fs.readdirSync(folder);
  for (var f of files) {
    if ( f.split('.')[0] == fileName )
      return f;
  }
  throw new Error('no file Found for', fileName, 'in folder', folder)
}


const mp4ConverterHandler = async function(patientId, analysisId, area_code) {
  
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

  return mp4Path;
}


module.exports = convert_all_video;