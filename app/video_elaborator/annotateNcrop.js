const sharp = require('sharp');
const getSize = require('./getSize');
const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')

async function annotateNcrop(
        imgFile, outFile,
        {arrowLeft, scaleLeft, top, bottom},
        {focalPoint, rulerLenght, focalPointTopPx, rulerZeroTopPx, rulerMaxTopPx, depthTopPx, pixelsPerCm}
    ) {

    const image = await loadImage(imgFile);
    var canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Draw original image
    ctx.drawImage(image, 0, 0, image.width, image.height);
    
    // Draw annotation
    ctxDrawer(ctx,
        {arrowLeft, scaleLeft, top, bottom},
        {focalPoint, rulerLenght, focalPointTopPx, rulerZeroTopPx, rulerMaxTopPx, depthTopPx, pixelsPerCm}
    );

    // Rotate'N Crop
    // console.log('crop canvas at left: ' + (arrowLeft?arrowLeft-10:scaleLeft-20))
    canvas = cropCanvas(canvas,(arrowLeft?arrowLeft-10:scaleLeft-20),rulerZeroTopPx,40,rulerMaxTopPx-rulerZeroTopPx)//left,top,width,height
    canvas = rotateCanvas(canvas)//left,top,width,height
    
    // Save
    try {
        const buffer = canvas.toBuffer('image/png')
        fs.writeFileSync(outFile, buffer)
    } catch (error) {
        console.error(error)
    }

}

function ctxDrawer(
    ctx,
    {arrowLeft, scaleLeft, top, bottom},
    {focalPoint, rulerLenght, focalPointTopPx, rulerZeroTopPx, rulerMaxTopPx, depthTopPx, pixelsPerCm}
) {

    // Set style
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';
    ctx.font = 'bold 12pt Menlo'

    if (focalPointTopPx) {
        // Focal point
        ctx.beginPath();
        ctx.moveTo(scaleLeft-20, focalPointTopPx);
        ctx.lineTo(scaleLeft, focalPointTopPx);
        ctx.stroke();
        ctx.textBaseline = 'bottom'
        ctx.fillText(focalPoint, arrowLeft, focalPointTopPx)
    }

    // Zero
    ctx.beginPath();
    ctx.moveTo(scaleLeft-30, rulerZeroTopPx);
    ctx.lineTo(scaleLeft, rulerZeroTopPx);
    ctx.lineTo(scaleLeft, rulerZeroTopPx+pixelsPerCm);
    ctx.stroke();
    ctx.textBaseline = 'top'
    ctx.fillText(0, arrowLeft, rulerZeroTopPx)

    // Max
    ctx.beginPath();
    ctx.moveTo(scaleLeft-30, rulerMaxTopPx);
    ctx.lineTo(scaleLeft, rulerMaxTopPx);
    ctx.stroke();
    ctx.textBaseline = 'bottom'
    ctx.fillText(rulerLenght, arrowLeft, rulerMaxTopPx)
}



const rotateCanvas = (sourceCanvas) => {
    let destCanvas = createCanvas(sourceCanvas.height, sourceCanvas.width); // swapped width height
    let ctx = destCanvas.getContext('2d');
    ctx.rotate(Math.PI/2);
    ctx.drawImage(
        sourceCanvas,
        0,0,sourceCanvas.width,sourceCanvas.height,  // source rect with content to crop
        0,-sourceCanvas.height,sourceCanvas.width,sourceCanvas.height);      // newCanvas, same size as source rect
    return destCanvas;
}



const cropCanvas = (sourceCanvas,left,top,width,height) => {
    let destCanvas = createCanvas(width, height);
    let ctx = destCanvas.getContext('2d');
    ctx.drawImage(
        sourceCanvas,
        left,top,width,height,  // source rect with content to crop
        0,0,width,height);      // newCanvas, same size as source rect
    return destCanvas;
}

// (async ()=>{
//     annotateNcrop('./profiles/canvas.png', './profiles/canvasOUT.png',
//         {arrowLeft: 857, scaleLeft: 877, top: 140, bottom: 688},
//         {focalPoint: 22, rulerLenght: 100, focalPointTopPx: 297, rulerZeroTopPx: 200, rulerMaxTopPx: 643, depthTopPx: 688, pixelsPerCm: ''}
//     );
// })();

// original image
// let originalImage = '.\\screenshot\\video_1419_1-at-1-seconds.png';
// 
// file name for cropped image
// let outputImage = '.\\screenshot\\video_1419_1-at-1-seconds-D.png';
// 
// crop({ width: 60, height: 14, left: 180, top: 66 }, originalImage, outputImage)

// crop({ width: 27, height: 18, left: 184, top: 65 },
//     './unzipped/1416/raw/video_1416_1.png',
//     './unzipped/1416/raw/video_1416_1_D.png');

module.exports = {annotateNcrop, ctxDrawer};