const getPixels = require("get-pixels");



function getPixelsPromisified (image) {

    return new Promise ( (res, rej) =>
        
        getPixels(image, (err, pixels) => {
            if(err)
                rej(err) // console.log("Bad image path");
            else
                res(pixels); // console.log("got pixels", pixels.get(49,137,2))
        })

    );

};



module.exports = getPixelsPromisified;