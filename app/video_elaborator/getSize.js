const sizeOf = require('image-size');

function getSize(image){

    return new Promise( res => {
        
        sizeOf(image, function (err, dimensions) {

            if (err) {
                console.log(err);
                throw err
            }

            // console.log(dimensions);

            res(dimensions);
        });

    });
    
}

// crop({ width: 27, height: 18, left: 184, top: 65 },
//     './unzipped/1416/raw/video_1416_1.png',
//     './unzipped/1416/raw/video_1416_1_D.png');

module.exports = getSize;