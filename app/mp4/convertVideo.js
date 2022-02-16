const hbjs = require('handbrake-js')

const convertVideo = function(sourceVideoPath, finalMp4Path) {
    
    return new Promise( (res, rej) => {
        hbjs.spawn({
            input: sourceVideoPath,
            output: finalMp4Path,
            crop:"<0:0:0:0>"
        }) //"loose-anamorphic": true

        .on('error', err => {
            // console.log(err)
            rej(err)
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


  module.exports = convertVideo;