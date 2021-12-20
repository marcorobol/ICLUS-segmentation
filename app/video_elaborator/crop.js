const sharp = require('sharp');
const getSize = require('./getSize');

async function crop({width, height, left, top}, originalImage, outputImage, rotate){

    let dimensions = await getSize(originalImage);

    if (left < 0)
        left=0
    if (left > dimensions.width)
        left = dimensions.width
    if (top < 0)
        top=0
    if (top > dimensions.height)
        top = dimensions.height

    if (width+left > dimensions.width)
        width = dimensions.width - left
    if (height+top > dimensions.height)
        height = dimensions.height - top
    
    if (!rotate)
        rotate = 0;

    return sharp(originalImage).extract({width, height, left, top}).rotate(rotate).toFile(outputImage)
        .then(function(new_file_info) {
            // console.log("Image cropped and saved");
        })
        .catch(function(err) {
            console.log({width, height, left, top});
            console.log("ERROR: crop not valid for " + originalImage);
            throw err;
        });
}

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

module.exports = crop;