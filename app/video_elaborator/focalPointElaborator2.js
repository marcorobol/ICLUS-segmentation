const fs = require('fs');
const crop = require('./crop');
const { annotateNcrop, ctxDrawer } = require('./annotateNcrop');
const getPixelsPromisified = require("./getPixelsPromisified");
const mobileMatrix = require("./mobileMatrix");
const ndarray = require("ndarray")
const imshow = require("ndarray-imshow")
var savePixels = require("save-pixels")



function focalPointElaborator2( {arrowLeft, scaleLeft, top, bottom, useDepthAtBottom} = fieldScannerProfile ) {
    
    return async (snapshotFile, croppedFile, {depth, canvasCtx} = currentData) => {

        let computedData = await elaborateImage( snapshotFile, {depth}, {arrowLeft, scaleLeft, top, bottom} );
        let {focalPoint, rulerLenght, focalPointTopPx, rulerZeroTopPx, rulerMaxTopPx, depthTopPx, pixelsPerCm} = computedData;

        await annotateNcrop( snapshotFile, croppedFile, {arrowLeft, scaleLeft, top, bottom}, computedData );
        
        // Draw annotations on main canvasCtx
        ctxDrawer(canvasCtx, {arrowLeft, scaleLeft, top, bottom}, computedData );

        return {value: focalPoint, extraData: computedData};
        
    }

}



async function elaborateImage( snapshotFile, {depth}, {arrowLeft, scaleLeft, top, bottom} ) {
    
    let pixels = await getPixelsPromisified(snapshotFile);
    
    // Detect focal point arrow position [px]
    if (arrowLeft)
        var focalPointTopPx = await findArrow(pixels, {arrowLeft, top, bottom})

    // Detect ruler ticks and get number of ticks and first and last tick position [px]
    let rulerTicksTopPxs = await findRulerTicks(pixels, {scaleLeft, top, bottom})
    let rulerZeroTopPx = rulerTicksTopPxs[0]
    let rulerMaxTopPx = rulerTicksTopPxs[rulerTicksTopPxs.length-1]
    // if (useDepthAtBottom)
    //     maxDepthTopPx = bottom


    // Decide wether the ruler has a tick every 10mm or every 5mm
    // and calculate actual rulerLenght [mm]
    let hp10_ruler_depth = (rulerTicksTopPxs.length-1)*10;
    let hp5_ruler_depth = (rulerTicksTopPxs.length-1)*5;
    if ( hp10_ruler_depth - depth < depth - hp5_ruler_depth ) {
        var rulerLenght = hp10_ruler_depth
    } else {
        var rulerLenght = hp5_ruler_depth
    }

    // Calculate pixelsPerCm [px/cm]
    let pixelsPerCm = (rulerMaxTopPx-rulerZeroTopPx) / rulerLenght * 10;

    // Calculate declaredDepthTopPx [px]
    let depthTopPx = pixelsPerCm * depth / 10;

    // Calculate focalPoint [mm]
    // let focalPoint = rulerLenght * (focalPointTopPx-rulerZeroTopPx) / (rulerMaxTopPx-rulerZeroTopPx);
    if (focalPointTopPx) {
        var focalPoint = (focalPointTopPx-rulerZeroTopPx) / pixelsPerCm * 10;
        focalPoint = Math.round(focalPoint);
    }

    // console.log('arrowTopPx: ' + arrowTopPx)
    // console.log('zeroTopPx: ' + zeroTopPx)
    // console.log('maxDepthTopPx: ' + maxDepthTopPx)
    // console.log('depth: ' + depth)
    // console.log(arrowValue)
    
    // Rounding
    // if (depth<30) // 0 1 2 ... 28 29 30
    //     focalPoint = Math.round( focalPoint*1 )/1;
    // else if (depth<60) // 0 2 4 ... 56 58 60
    //     focalPoint = Math.round( focalPoint*0.5 )/0.5;
    // else if (depth<150) // 0 5 10 15 ... 140 145 150
    //     focalPoint = Math.round( focalPoint*0.2 )/0.2;
    // else // 0 10 20 ... 280 290 300
    //     focalPoint = Math.round( focalPoint*0.1 )/0.1;


    // console.log('topPx: ' + topPx)
    // console.log('topRelative: ' + topRelative)
    // console.log('depth: ' + depth )
    // console.log('computedValue: ' + computedValue )
    
    return {focalPoint, rulerLenght, focalPointTopPx, rulerTicksTopPxs, rulerZeroTopPx, rulerMaxTopPx, depthTopPx, pixelsPerCm};
}



async function findArrow( pixels, {arrowLeft, top, bottom} ) {
    

    let mobileWindow = [0]
    let maxIndex = 0;
    
    for (let index = top+3; index < bottom-3; index++) { //pixels.shape[1]

        // console.log(pixels.get(arrowLeft,index,2))
        
        let current = 0
        for (let j = -3; j < 3; j++) {
            current += pixels.get(arrowLeft,index+j,1);
        }

        // console.log(index + ': ' + current)

        mobileWindow[index] = current

        if (current > mobileWindow[maxIndex])
            maxIndex = index;
        
    }

    return maxIndex-1;
}



async function findRulerTicks( pixels, {scaleLeft, top, bottom} ) {
    
    let column = pixels.hi(scaleLeft+1,bottom).lo(scaleLeft,top);

    let filter1 = ndarray(new Int16Array([ -2, -2, 2, 0, -1 ]), [1, 5]); // check on 1564_14
    let out = mobileMatrix( column, filter1);

    let filter2 = ndarray(new Int16Array([ -1, -1, 10, -1, -1 ]), [1, 5]);
    out = mobileMatrix( out, filter2);

    // console.log(out)
    // var outFile1 = fs.createWriteStream('./profiles/out1.png');
    // savePixels(out, "png").pipe(outFile1)
    // imshow(out, {gray: true})

    let scale = []
    for (let index = 0; index < out.shape[1]; index++) { // pixels on filtered column
        if ( out.get(0, index, 2) > 200 ) {
            scale.push(index+top);
            // console.log(index+top);
        }
    }
    // console.log(scale)

    // mess up with scale red for test
    // scale.splice(3,1)
    // scale.splice(5,1,scale[5]+20)
    // console.log(scale)
    
    let increments = rulerIncrements(scale);
    let rebuilt = rebuildRuler(scale, increments);
    return rebuilt;
}

function rulerIncrements( scale = rulerTicksTopPxs = [] ) {
    
    let increments = new Map();
    
    for (let index = 1; index < scale.length; index++) {
        let increment = scale[index]-scale[index-1]
        if ( !increments.has(increment) )
            increments.set( increment, {increment: increment, count: 0, atIndex: [], withValue: []} );
        incr = increments.get(increment)
        incr.count++
        incr.atIndex.push(index-1)
        incr.withValue.push(scale[index-1])
        // console.log( 'increment of ' + increment + ' => ' + scale[index]);
    }
    // console.log(increments);

    return increments;
}

function rebuildRuler( ruler=[], increments ) {

    let defaultIncrementValue = mostCommonIncrement( increments );
    // console.log(defaultIncrementValue)
    
    // new ruler
    let newRuler = [];

    // start by pushing to new ruler first tick with a default increment // check 1639
    // newRuler.push( ruler[ increments.get(defaultIncrementValue).atIndex[0] ] );
    // start by pushing to new ruler first tick with close to a default increment // check 1639
    for (let index = 0; index < ruler.length; index++) {
        const current = ruler[index];
        let prediction = current + defaultIncrementValue
        if ( includesSimilar(ruler, prediction) ) {
            newRuler.push( current );
            break; // check 1378
        }
    }
    
    while ( newRuler[newRuler.length-1] + 2 < ruler[ruler.length-1] ) {
        // predict next tick by applying increment on last tick
        let prediction = newRuler[newRuler.length-1] + defaultIncrementValue
        // if prediction is close to something that has been detected
        let found = includesSimilar(ruler, prediction);
        if ( found )
            newRuler.push( found );
        else
            newRuler.push( prediction );
    }

    // console.log(newRuler)
    return newRuler;
}

function mostCommonIncrement( increments ) {
    let mostCommon = {count: 0};
    for (const v of increments.values()) {
        if ( v.count > mostCommon.count )
            mostCommon = v
    }
    // console.log(mostCommon)
    return mostCommon.increment;
}

function includesSimilar (array, value) {
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if ( Math.abs( element-value ) < 4 )
            return element;
    }
    return false;
}

// (async () => {

//     if (process.argv[2]!='test')
//         return;

//     // let pixels = await getPixelsPromisified('./profiles/mp41024.png');
//     // let scale = findFocalScale( pixels, {top: 50, bottom: 768, scaleLeft: 7} )

//     focalPoint = await elaborateImage( './profiles/mp41024.png', {depth: 8}, {top: 50, bottom: 768, arrowLeft: 1, scaleLeft: 7} )
//     console.log(focalPoint)

// })()

// findFocalPoint( './profiles/MOV960.png', {depth: 160}, { unit: 'mm', top: 5, bottom: 671, left: 29 } )

// (async () => {
//     let out = await elaborateImage( './profiles/snapshot_1564_14.png', {depth: 90}, {top: 140, bottom: 688, arrowLeft: 857, scaleLeft: 877} )
//     console.log(out)
// })()

module.exports = focalPointElaborator2;