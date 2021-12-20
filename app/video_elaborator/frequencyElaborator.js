const cropNread = require("./cropNread");
const ctxDrawer = require("./ctxDrawer");



function defaultFrequencyElaborator( {area} ) {
    
    return async (snapshotFile, croppedFile, {canvasCtx} = currentData) => {

        let readValue = await cropNread(snapshotFile, croppedFile, area)

        // get numerical value
        let numValue = readValue;
        if ( typeof readValue === 'string' || readValue instanceof String )
            if ( readValue == 'PEN' )
                numValue = 5;
            else if ( readValue == 'Ris-A' )
                numValue = 5;
            else if ( readValue == 'Gen-M' )
                numValue = 5;
            else if ( readValue == 'G' )
                numValue = 5;
            else
                numValue = Number(readValue.replace(',','.') );

        // Draw cropping box on main canvasCtx
        ctxDrawer(canvasCtx, area);

        return {value: numValue, extraData: {readValue: readValue}};
    }

}



module.exports = defaultFrequencyElaborator;