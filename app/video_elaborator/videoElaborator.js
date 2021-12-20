const fs = require('fs');
const snapshot = require('./snapshot');
const ffmpeg = require('fluent-ffmpeg');
const detectScannerProfile = require('./detectScannerProfile.js');
const { createCanvas, loadImage } = require('canvas')
const getSize = require('./getSize');
const sharp = require('sharp');
const { throws } = require('assert');



async function videoElaborator(rawFolder, videoFileName, snapshotFileName) {
    
    const video = {}
    
    // check file exists
    if ( !fs.existsSync(rawFolder+videoFileName) )
        throw new Error('path not valid ' + rawFolder + videoFileName);
    
    /**
     * get length and take snapshot
     */
    // CASE video
    var videoExtension = video.videoExtension = videoFileName.split('.')[1];
    if (videoExtension!='JPG' && videoExtension!='jpg') {

        // get video length
        var frames = await new Promise( (res) => ffmpeg.ffprobe(rawFolder + videoFileName, function(err, metadata) {
                //console.dir(metadata); // all metadata
                if(metadata && metadata.streams && metadata.streams[0])
                    res(metadata.streams[0].nb_frames);
                else
                    res(0)
            })
        );
        // set nb_frames
        video.nb_frames = frames;

        // Take snapshot
        if ( !fs.existsSync(rawFolder + snapshotFileName) ) {

            await snapshot( rawFolder, videoFileName, snapshotFileName )

            // Throw error if snapshot not taken
            if( !fs.existsSync(rawFolder + snapshotFileName) )
                throw new Error('no snapshot taken for video ' + videoFileName)
            
        }

    }
    // CASE image
    else {

        // set nb_frames
        video.nb_frames = 1;

        // console.log("converting image from "+rawFolder + videoFileName+" to "+rawFolder + snapshotFileName)
        await sharp(rawFolder + videoFileName).toFile(rawFolder + snapshotFileName)
        .catch( (err) => {
            // console.log('no snapshot taken for image ' + videoFileName);
            // video.videoError = 'no snapshot taken for image ' + videoFileName;
            throw err;
        });

    }



    /**
     * get dimensions
     */
    // let {width, height} = await loadImage(rawFolder + snapshotFileName); // Slower then image-size used in getSize
    let dimensions = video.dimensions = {width, height} = await getSize(rawFolder + snapshotFileName);      // Faster then canvas.loadImage



    /**
     * Detect scanner profile
     */
    var profile = {label, brand, depthElab, freqElab, focalPointElab} = await detectScannerProfile( rawFolder + snapshotFileName, dimensions );
    video.profileLabel = profile.label;
    video.profileScannerBrand = profile.brand;
    
    // STOP HERE in case of unknown profile
    if (profile.label=='unknown')
        throw new Error('no known profile matches')
    
    

    /**
     * Call scanner-profile-specific field processor for Depth, Frequency and Focal point
     */
    
    // setup empty annotation canvasCtx
    var canvas = createCanvas(parseInt(dimensions.width), parseInt(dimensions.height));
    const canvasCtx = canvas.getContext('2d');
    // Set style
    canvasCtx.lineWidth = 4;
    canvasCtx.strokeStyle = 'red';
    canvasCtx.fillStyle = 'red';
    canvasCtx.font = 'bold 12pt Menlo'
    
    // Depth
    let D_cropFileName = snapshotFileName.split('.').slice(0,-1).join('').concat('_D.png')
    video.depth = await processField( rawFolder, snapshotFileName, D_cropFileName, 'D', profile.depthElab, {canvasCtx} );
    
    // Freq
    let F_cropFileName = snapshotFileName.split('.').slice(0,-1).join('').concat('_F.png')
    video.frequency = await processField( rawFolder, snapshotFileName, F_cropFileName, 'F', profile.freqElab, {canvasCtx} );
    
    // focalPoint
    let Fc_cropFileName = snapshotFileName.split('.').slice(0,-1).join('').concat('_Fc.png')
    let {value: focalPointValue,
        extraData: {focalPoint, rulerLenght, focalPointTopPx, rulerZeroTopPx, rulerMaxTopPx, depthTopPx, pixelsPerCm}
    } = video.focalPoint = await processField( rawFolder, snapshotFileName, Fc_cropFileName, 'Fc', profile.focalPointElab, {depth: video.depth.value, canvasCtx} );
    
    if ( pixelsPerCm )
        video.pixel_density = pixelsPerCm; // [pixels/cm]
    else if ( rulerMaxTopPx && rulerZeroTopPx )
        video.pixel_density = (rulerMaxTopPx - rulerZeroTopPx) / rulerLenght * 10; // [pixels/cm]
    else
        video.pixel_density = null;

    // save annotated canvasCtx on file
    // var data = canvasCtx.getImageData(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height).data;
    let annotation_FileName = 'annotation_' + snapshotFileName.split('_').slice(1).join('_');
    // if ( !fs.existsSync(rawFolder + annotationFileName) )
        fs.writeFileSync(rawFolder + annotation_FileName, canvas.toBuffer('image/png'));
    

    
    return video;

}
// (async ()=>{
//     videoElaborator({patientId: 1048}, {analysisId: 1124}, {areaCode: 1})
// })()



async function processField( rawFolder, snapshotFile, croppedFile, fieldCode, fieldElab, currentInfo ) {
    
    if (!fieldElab || !(fieldElab instanceof Function)) {
        // console.log('unavailable elaboration function for field ' + fieldCode + ' for ' + snapshotFile)
        throw new Error('unavailable elaboration profile');
    }
    
    // call scanner-specific field-specific snapshot elaborator
    var elab = await fieldElab( rawFolder + snapshotFile, rawFolder + croppedFile, currentInfo );

    if (!elab) {
        // console.log('field ' + fieldCode + ' not correctly processed for' + snapshotFile);
        throw new Error('field not correctly processed');
    }
    
    return elab;
}



module.exports = videoElaborator;