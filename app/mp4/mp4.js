require('dotenv').config()
const express = require('express')
var router = express.Router()
const fs = require('fs')
const hbjs = require('handbrake-js')



router.use('/:patientId/:analysisId/:area_code/video', async function(req, res) {
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



module.exports = router;
