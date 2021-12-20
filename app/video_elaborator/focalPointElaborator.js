const fs = require('fs');
const crop = require('./crop');
const getPixelsPromisified = require("./getPixelsPromisified");
const ctxDrawer = require("./ctxDrawer");



function focalPointElaborator( {left, top, bottom} ) {
       
    return async (snapshotFile, croppedFile, {depth, canvasCtx} = currentData) => {
        
        let {focalPointTopPx, focalPoint} = await findFocalPoint( snapshotFile, {depth}, profileParameters = {left, top, bottom} );
        let pixelsPerCm = (bottom-top) / depth * 10;
        let depthTopPx = pixelsPerCm * depth / 10;
        let rulerLenght = depth;
        let extraData = {focalPoint, rulerLenght, focalPointTopPx, rulerZeroTopPx: top, rulerMaxTopPx: bottom, depthTopPx, pixelsPerCm}
        
        await crop( {width: 26, height: 30, left: left-10, top: focalPointTopPx-15}, snapshotFile, croppedFile );

        // Draw cropping box on main canvasCtx
        ctxDrawer(canvasCtx, {width: 26, height: 30, left: left-10, top: focalPointTopPx-15} );

        return {value: focalPoint, extraData: extraData};
    
    }

}



async function findFocalPoint( snapshotFile, {depth}, {left, top, bottom} ) {
    
    // if ( typeof depth === 'string' || depth instanceof String )
    //     depth = Number(depth.replace(',','.') );
    
    pixels = await getPixelsPromisified(snapshotFile);

    let mobileWindow = [0]
    let maxIndex = 0;
    
    for (let index = top+3; index < bottom-3; index++) { //pixels.shape[1]

        // console.log(pixels.get(left,index,2))
        
        let current = 0
        for (let j = -3; j < 3; j++) {
            current += pixels.get(left,index+j,1);
        }

        // console.log(index + ': ' + current)

        mobileWindow[index] = current

        if (current > mobileWindow[maxIndex])
            maxIndex = index;
        
    }

    let topPx = maxIndex-1;
    let topRelative = (maxIndex-1-top) / (bottom-top);
    var computedValue = topRelative*depth
    
    // Rounding
    if (depth<15) // 0 0.5 1 ... 14 14.5 15
        computedValue = Math.round( computedValue*2 )/2;
    else if (depth<30) // 0 1 2 ... 28 29 30
        computedValue = Math.round( computedValue*1 )/1;
    else if (depth<60) // 0 2 4 ... 56 58 60
        computedValue = Math.round( computedValue*0.5 )/0.5;
    else if (depth<150) // 0 5 10 15 ... 140 145 150
        computedValue = Math.round( computedValue*0.2 )/0.2;
    else // 0 10 20 ... 280 290 300
        computedValue = Math.round( computedValue*0.1 )/0.1;

    // console.log('topPx: ' + topPx)
    // console.log('topRelative: ' + topRelative)
    // console.log('depth: ' + depth )
    // console.log('computedValue: ' + computedValue )
    

    return {focalPointTopPx: maxIndex, focalPoint: computedValue};
}



// findFocalPoint( './profiles/MOV960.png', {depth: 160}, { unit: 'mm', top: 5, bottom: 671, left: 29 } )


module.exports = focalPointElaborator;