const fs = require('fs');
const crop = require('./crop');
const ocr = require('./ocr');



async function cropNread( snapshotFile, croppedFile, {width,height,left,top} ) {
    
    // cut/crop snapshot
    // if ( !width || !height || !left || !top) {
    //     console.log('WARNING: invalid crop area for ' + croppedFile + ' ', {width,height,left,top})
    //     return;
    // }
    try {
        await crop({width,height,left,top}, snapshotFile, croppedFile);
    } catch (error) {
        console.error(error)
        return
    }
    
    // read it
    let readValue = await ocr(croppedFile);
    // let readValue = 'undef'
    
    // fix string
    // if ( typeof readValue === 'string' || readValue instanceof String ) {
    readValue = readValue.replace(/(\r\n|\n|\r)/gm, '');
    readValue = readValue.replace(',','.');
    readValue = ( readValue.charAt(0) == '.' ? readValue = readValue.substr(1) : readValue );
    return readValue;
}



module.exports = cropNread;