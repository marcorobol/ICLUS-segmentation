const fs = require('fs');
const getPixelsPromisified = require("./getPixelsPromisified");
const ndarray = require("ndarray")
const imshow = require("ndarray-imshow")
var savePixels = require("save-pixels")


function mobileMatrix( pixels, filter ) {

    let width = pixels.shape[0];
    let height = pixels.shape[1];
    let channels = 3;

    filterHalfWidth = Math.floor( filter.shape[0] / 2 )
    filterHalfHeight = Math.floor( filter.shape[1] / 2 )
    
    var out = ndarray( new Uint8Array( width * height * channels ), [width, height, channels] ) 
    
    for (let x = 0; x < width; x++) { // width

        for (let y = 0; y < height; y++) { // height

            for (let k = 0; k < channels; k++) { // channels

                // console.log(x + ',' + y + ': ' + pixels.get(x, y, k))
        
                var current = 0; // x y
                
                for (let i = -filterHalfWidth; i <= filterHalfWidth; i++) { // x-axis filter

                    for (let j = -filterHalfHeight; j <= filterHalfHeight; j++) { // y-axis filter

                        // console.log((x+i) + ',' + (y+j))
                        let px = pixels.get(x+i, y+j, k);

                        let fx = filter.get(filterHalfWidth + i, filterHalfHeight + j);
                        // console.log(fx)
                            
                        current += px * fx;

                        // console.log(x + ',' + y + ': ' + px)

                        // console.log(x + ',' + y + ': ' + fx)
                    }
                }

                if ( current > 255 )
                    current = 255
                else if ( current < 0 )
                    current = 0

                out.set(x, y, k, current);
            }

            // console.log(x + ',' + y + ': ' + current) // log only last color
            
        }
    }

    return out;
}



// (async () => {

//     if (process.argv[2]!='test')
//         return;

//     let pixels = await getPixelsPromisified('./profiles/mp41024.png');

//     // imshow(pixels)

//     let filter = ndarray(new Int16Array([
//         0, 0, 0, 0, 0,
//         0, 0, 0, 0, 0,
//         -2, -2, 1, 0, 0,
//         0, 0, 0, 0, 0,
//         0, 0, 0, 0, 0
//     ]), [5,5])

//     let out1 = mobileMatrix( pixels, filter);

//     // var outFile1 = fs.createWriteStream('./profiles/out1.png');
//     // savePixels(out1, "png").pipe(outFile1)

//     let filter2 = ndarray(new Int16Array([
//         0, 0, 0, 0, 0,
//         0, 0, 0, 0, 0,
//         -1, -1, 10, -1, -1,
//         0, 0, 0, 0, 0,
//         0, 0, 0, 0, 0
//     ]), [5,5])

//     // var outFilterFile2 = fs.createWriteStream('./profiles/filterout2.png');
//     // savePixels(filter2, "png").pipe(outFilterFile2)

//     let out2 = mobileMatrix( out1, filter2);

//     var outFile2 = fs.createWriteStream('./profiles/out2.png');
//     savePixels(out2, "png").pipe(outFile2)
//     // imshow(out2, {gray: true})

// })()



module.exports = mobileMatrix;