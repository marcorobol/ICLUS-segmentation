const cropNread = require("./cropNread");
const ctxDrawer = require("./ctxDrawer");



function depthElaborator( {area} ) {
    
    return async (snapshotFile, croppedFile, {canvasCtx} = currentData) => {
        
        let readValue = await cropNread(snapshotFile, croppedFile, area);
        
        // get numerical value
        let numValue = readValue;
        if ( typeof readValue === 'string' || readValue instanceof String )
            numValue = Number(numValue.replace(',','.') );

        // compute uniformed
        let uniformedValue = numValue;
        if ( numValue<25 )
            uniformedValue = numValue*10;

        // Draw cropping box on main canvasCtx
        ctxDrawer(canvasCtx, area);

        return {value: uniformedValue, extraData: {readValue: readValue, numValue: numValue}};

    }

}



module.exports = depthElaborator;