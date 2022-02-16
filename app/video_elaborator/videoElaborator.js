const fs = require('fs');
const snapshot = require('./snapshot');
const ffmpeg = require('fluent-ffmpeg');
const detectScannerProfile = require('./detectScannerProfile.js');
const { createCanvas, loadImage } = require('canvas')
const getSize = require('./getSize');
const sharp = require('sharp');
const { throws } = require('assert');
const path = require('path');



async function videoElaborator(videoPath, snapshotPath) {

    const video = {}
    
    // check file exists
    if ( !fs.existsSync(videoPath) )
        throw new Error('path not valid ' + videoPath);
    
    /**
     * get length and take snapshot
     */
    // CASE video
    var videoExtension = video.videoExtension = path.extname(videoPath)
    if (videoExtension!='.JPG' && videoExtension!='.jpg') {

        // get video length
        var frames = await new Promise( (res) => ffmpeg.ffprobe(videoPath, function(err, metadata) {
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
        if ( !fs.existsSync(snapshotPath) ) {

            await snapshot( videoPath, snapshotPath )

            // Throw error if snapshot not taken
            if( !fs.existsSync(snapshotPath) )
                throw new Error('no snapshot taken for video ' + videoPath)
            
        }

    }
    // CASE image
    else {

        // set nb_frames
        video.nb_frames = 1;

        // console.log("converting image from "+videoPath+" to "+snapshotPath)
        await sharp(videoPath).toFile(snapshotPath)
        .catch( (err) => {
            // console.log('no snapshot taken for image ' + videoPath);
            // video.videoError = 'no snapshot taken for image ' + videoPath;
            throw err;
        });

    }



    /**
     * get dimensions
     */
    // let {width, height} = await loadImage(snapshotPath); // Slower then image-size used in getSize
    let dimensions = video.dimensions = {width, height} = await getSize(snapshotPath);      // Faster then canvas.loadImage



    /**
     * Detect scanner profile
     */
    var profile = {label, brand, depthElab, freqElab, focalPointElab} = await detectScannerProfile( snapshotPath, dimensions );
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
    let D_cropPath = path.join( path.dirname(snapshotPath), path.basename(snapshotPath, '.png') + '_D.png' );
    video.depth = await processField( snapshotPath, D_cropPath, 'D', profile.depthElab, {canvasCtx} );
    
    // Freq
    let F_cropPath = path.join( path.dirname(snapshotPath), path.basename(snapshotPath, '.png') + '_F.png' );
    video.frequency = await processField( snapshotPath, F_cropPath, 'F', profile.freqElab, {canvasCtx} );
    
    // focalPoint
    let Fc_cropPath = path.join( path.dirname(snapshotPath), path.basename(snapshotPath, '.png') + '_Fc.png' );
    let {value: focalPointValue,
        extraData: {focalPoint, rulerLenght, focalPointTopPx, rulerZeroTopPx, rulerMaxTopPx, depthTopPx, pixelsPerCm}
    } = video.focalPoint = await processField( snapshotPath, Fc_cropPath, 'Fc', profile.focalPointElab, {depth: video.depth.value, canvasCtx} );
    
    if ( pixelsPerCm )
        video.pixel_density = pixelsPerCm; // [pixels/cm]
    else if ( rulerMaxTopPx && rulerZeroTopPx )
        video.pixel_density = (rulerMaxTopPx - rulerZeroTopPx) / rulerLenght * 10; // [pixels/cm]
    else
        video.pixel_density = null;

    // save annotated canvasCtx on file
    // var data = canvasCtx.getImageData(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height).data;
    let annotationPath = path.join( path.dirname(snapshotPath), 'annotation_' + path.basename(snapshotPath).split('_').slice(1).join('_') );
    // if ( !fs.existsSync(annotationPath) )
        fs.writeFileSync(annotationPath, canvas.toBuffer('image/png'));
    

    
    return video;

}
// (async ()=>{
//     videoElaborator({patientId: 1048}, {analysisId: 1124}, {areaCode: 1})
// })()



async function processField( snapshotPath, croppedPath, fieldCode, fieldElab, currentInfo ) {
    
    if (!fieldElab || !(fieldElab instanceof Function)) {
        // console.log('unavailable elaboration function for field ' + fieldCode + ' for ' + snapshotFile)
        throw new Error('unavailable elaboration profile');
    }
    
    // call scanner-specific field-specific snapshot elaborator
    var elab = await fieldElab( snapshotPath, croppedPath, currentInfo );

    if (!elab) {
        // console.log('field ' + fieldCode + ' not correctly processed for' + snapshotFile);
        throw new Error('field not correctly processed');
    }
    
    return elab;
}



module.exports = videoElaborator;