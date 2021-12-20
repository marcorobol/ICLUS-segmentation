const sizeOf = require('image-size');
const getPixels = require("get-pixels");
const getSize = require('./getSize');
const depthElaborator = require('./depthElaborator');
const frequencyElaborator = require('./frequencyElaborator');
const focalPointElaborator = require('./focalPointElaborator');
const focalPointElaborator2 = require('./focalPointElaborator2');

const avi1260_910 = {
    applicable: (image, dimensions) => { return dimensions.width==1260 && dimensions.height==910 },
    label: 'avi1260_910',
    brand: 'mindray',
    depthElab: depthElaborator( { area: { width: 1185-1136, height: 250-228, left: 1136, top: 228 } } ),
    freqElab: frequencyElaborator( { area: { width: 1195-1135, height: 224-203, left: 1135, top: 203 } } ),
    focalPointElab: focalPointElaborator2( {top: 170, bottom: 910, arrowLeft: 1065, scaleLeft: 1067} )
}

const avi860_808 = {
    applicable: (image, dimensions) => { return dimensions.width==860 && dimensions.height==808 },
    label: 'avi860_808',
    brand: 'EsaoteMyLab',
    depthElab: depthElaborator( { area: { width: 137-75, height: 139-126, left: 75, top: 126 } } ),
    freqElab: frequencyElaborator( { area: { width: 137-75, height: 126-113, left: 75, top: 113 } } ),
    focalPointElab: focalPointElaborator2( {top: 170, bottom: 808, arrowLeft: 841, scaleLeft: 856} )
}

const avi720_540 = {
    applicable: (image, dimensions) => { return dimensions.width==720 && dimensions.height==540 },
    label: 'avi720_540',
    brand: 'Mindray',
    depthElab: depthElaborator( { area: { width: 25, height: 13, left: 12, top: 150 } } ),
    freqElab: frequencyElaborator( { unit: 'MHz', area: { width: 55, height: 13, left: 11, top: 111 } } ),
    focalPointElab: focalPointElaborator2( {top: 40, bottom: 540, arrowLeft: 691, scaleLeft: 700} )
}

const avi880_688 = {
    applicable: (image, dimensions) => { return dimensions.width==880 && dimensions.height==688 },
    label: 'avi880_688',
    brand: 'EsaoteMyLab',
    depthElab: depthElaborator( { area: { width: 27, height: 16, left: 184, top: 65 } } ),
    freqElab: frequencyElaborator( { unit: 'MHz', area: { width: 39, height: 13, left: 185, top: 52 } } ),
    focalPointElab: focalPointElaborator2( {unit: 'cm', top: 140, bottom: 688, arrowLeft: 857, scaleLeft: 877, useDepthAtBottom: true} ) //focalPointElaborator( { top: 227, bottom: 688, left: 857 } )
}

const avi880_672 = { //TOTALE sono 2 immagini!!!!
    applicable: (image, dimensions) => { return dimensions.width==880 && dimensions.height==672 },
    label: 'avi880_672',
    brand: 'EsaoteMyLab',
    depthElab: depthElaborator( { area: { width: 30, height: 16, left: 180, top: 47 } } ),
    freqElab: frequencyElaborator( { unit: 'MHz', area: { width: 39, height: 13, left: 185, top: 34 } } ),
    focalPointElab: focalPointElaborator( { unit: 'cm', top: 192, bottom: 666, left: 858 } )
}

const avi800_652 = { //ex avi800
    applicable: (image, dimensions) => { return dimensions.width==800 && dimensions.height==652 },
    label: 'avi800_652',
    brand: 'EsaoteMyLab',
    depthElab: depthElaborator( { area: { width: 37, height: 14, left: 187, top: 65 } } ),
    freqElab: frequencyElaborator( { unit: 'MHz', area: { width: 40, height: 15, left: 185, top: 51 } } ),
    focalPointElab: focalPointElaborator2( {top: 100, bottom: 652, arrowLeft: undefined, scaleLeft: 795} )
}

const avi800_608 = {
    applicable: (image, dimensions) => { return dimensions.width==800 && dimensions.height==608 },
    label: 'avi800_608',
    brand: 'EsaoteMyLab',
    depthElab: depthElaborator( { area: { width: 60, height: 81-66, left: 165, top: 66 } } ),
    freqElab: frequencyElaborator( { area: { width: 100, height: 125-81, left: 0, top: 81 } } ),
    focalPointElab: focalPointElaborator2( {top: 100, bottom: 608, arrowLeft: 774, scaleLeft: 799} )
}

const avi1068 = {
    applicable: (image, dimensions) => { return dimensions.width==1068 },
    label: 'avi1068',
    brand: 'EsaoteMyLab',
    depthElab: depthElaborator( { area: { width: 48, height: 15, left: 283, top: 128 } } ),
    freqElab: frequencyElaborator( { unit: 'MHz', area: { width: 190, height: 30, left: 5, top: 115 } } ),
    focalPointElab: focalPointElaborator2( {unit: 'mm', top: 200, bottom: 800, arrowLeft: 1043, scaleLeft: 1065} ) // focalPointElaborator( { unit: 'mm', top: 217, bottom: 785, left: 1043 } )
}   // focalPoint max depth should be considered at the bottom of scanned area

const MOV1920 = {
    applicable: (image, dimensions) => { return dimensions.width==1920 },
    label: 'MOV1920',
    brand: 'CerberoATL',
    depthElab: depthElaborator( { area: { width: 120, height: 30, left: 100, top: 189 } } ),
    freqElab: frequencyElaborator( { unit: 'MHz', area: { width: 140, height: 36, left: 100, top: 332 } } ),
    focalPointElab: focalPointElaborator( { unit: 'mm', top: 26, bottom: 1357, left: 44 } )
}

const MOV960 = {
    applicable: (image, dimensions) => { return dimensions.width==960 },
    label: 'MOV960',
    brand: 'CerberoATL',
    depthElab: depthElaborator( { area: { width: 62, height: 18, left: 57, top: 85 } } ),
    freqElab: frequencyElaborator( { unit: 'MHz', area: { width: 75, height: 18, left: 57, top: 158 } } ),
    focalPointElab: focalPointElaborator( { top: 5, bottom: 671, left: 29 } )
}

const mp41024 = {
    applicable: (image, dimensions) => { return dimensions.width==1024 },
    label: 'mp41024',
    brand: 'PhilipsIU22',
    depthElab: depthElaborator( { area: { width: 48, height: 29, left: 940, top: 317 } } ),
    //freqElab: frequencyElaborator( { unit: 'Hz', area: { width: 53, height: 27, left: 940, top: 198 } } ),
    focalPointElab: focalPointElaborator2( {unit: 'cm', top: 50, bottom: 768, arrowLeft: 1, scaleLeft: 7} ) // focalPointElaborator( { top: 50, bottom: 768, left: 2 } )
}

const mpeg480 = {
    applicable: (image, dimensions) => { return dimensions.width==480 },
    label: 'mpeg480',
    brand: 'CerberoATL',
    depthElab: depthElaborator( { area: { width: 29, height: 8, left: 29, top: 43 } } ),
    freqElab: frequencyElaborator( { unit: 'MHz', area: { width: 39, height: 10, left: 29, top: 79 } } ),
    focalPointElab: focalPointElaborator( { top: 2, bottom: 335, left: 14 } )
}

const mpeg1280pixel255 = {
    applicable: async (image, dimensions) => {
        if (dimensions.width==1280) {
            let pixels = await getPixelsPromisified(image)
            return pixels.get(49,137,2)==255;
        }
        return false;
    },
    label: 'mpeg1280pixel255',
    brand: 'CerberoATL',
    depthElab: depthElaborator( { area: { width: 83, height: 22, left: 67, top: 125 } } ),
    freqElab: frequencyElaborator( { unit: 'MHz', area: { width: 83, height: 23, left: 65, top: 221 } } ),
    focalPointElab: focalPointElaborator( { top: 16, bottom: 900, left: 29 } ) // circa 900
}

const mpeg1280pixelfalse = {
    applicable: async (image, dimensions) => {
        if (dimensions.width==1280) {
            let pixels = await getPixelsPromisified(image)
            return pixels.get(49,137,2)!=255;
        }
        return;
    },
    label: 'mpeg1280pixelfalse',
    brand: 'CerberoATL',
    depthElab: depthElaborator( { area: { width: 83, height: 22, left: 77, top: 125 } } ),
    freqElab: frequencyElaborator( { unit: 'MHz', area: { width: 83, height: 24, left: 75, top: 221 } } ),
    focalPointElab: focalPointElaborator( { top: 16, bottom: 900, left: 26 } ) // circa 900
}

const unknowProfile = {
    label: 'unknown',
}

const profiles = [avi1260_910, avi720_540, avi860_808, avi880_688, avi880_672, avi800_652, avi800_608, avi1068, MOV1920, MOV960, mp41024, mpeg480, mpeg1280pixel255, mpeg1280pixelfalse]



async function getScannerProfileByLabel(label) {
    for (const p of profiles)
        if (p.label=label)
            return p
    return unknowProfile
}



async function detectScannerProfile(image, dimensions) {

    // let dimensions = await getSize(image);

    // console.log(dimensions);
    
    if ( avi1260_910.applicable(image, dimensions) )
        return avi1260_910

    else if ( avi720_540.applicable(image, dimensions) )
        return avi720_540
    
    else if ( avi860_808.applicable(image, dimensions) )
        return avi860_808
    
    else if ( avi880_688.applicable(image, dimensions) )
        return avi880_688

    else if ( avi880_672.applicable(image, dimensions) )
        return avi880_672

    else if ( avi800_652.applicable(image, dimensions) ) //800*652
        return avi800_652

    else if ( avi800_608.applicable(image, dimensions) ) //800*608
        return avi800_608

    else if ( avi1068.applicable(image, dimensions) ) //1068*
        return avi1068

    else if ( MOV1920.applicable(image, dimensions) ) //1920*1408
        return MOV1920

    else if ( MOV960.applicable(image, dimensions) ) //960*704
        return MOV960

    else if ( mp41024.applicable(image, dimensions) )
        return mp41024

    else if ( mpeg480.applicable(image, dimensions) )
        return mpeg480

    else if ( await mpeg1280pixel255.applicable(image, dimensions) )
            return mpeg1280pixel255

    else if ( await mpeg1280pixelfalse.applicable(image, dimensions) )
        return mpeg1280pixelfalse

    else {
        console.log("Unknown scanner profile for image " + image)
        return unknowProfile
    }

}



function getPixelsPromisified (image) {
    return new Promise ( res =>
        getPixels(image, function(err, pixels) {
            if(err) {
                console.log("Bad image path");
                return;
            }
            // console.log("got pixels", pixels.get(49,137,2))
            res(pixels);
        })
    );
};



// const crop = require('./crop');
// (async ()=>{

//     var area = await selectCroppingArea('./profiles/avi.snapshot_1122_1.png')
    
//     // console.log(area);
    
//     await crop(area,
//         './profiles/' + 'avi.snapshot_1122_1.png',
//         './profiles/' + 'avi.snapshot_1122_1_D.png'
//     );

// })();


// ( async () => {

//     let p = await detectScannerProfile('./profiles/1047_10.png')
//     let v = await p.focalPointElab('./profiles/1047_10.png', './profiles/1047_10_Fc.png', {depth: 7})
//     console.log(v)

//     p = await detectScannerProfile('./profiles/1119_1.png')
//     v = await p.focalPointElab('./profiles/1119_1.png', './profiles/1119_1_Fc.png', {depth: 11})
//     console.log(v)

//     p = await detectScannerProfile('./profiles/1163_10.png')
//     v = await p.focalPointElab('./profiles/1163_10.png', './profiles/1163_10_Fc.png', {depth: 10})
//     console.log(v)

//     p = await detectScannerProfile('./profiles/1212_2.png')
//     v = await p.focalPointElab('./profiles/1212_2.png', './profiles/1212_2_Fc.png', {depth: 9})
//     console.log(v)
    
// })()



module.exports = detectScannerProfile;