require('dotenv').config()
const path = require('path');
const fs = require('fs')



// patientId/analysisId/clipped/cropping-mask_analysisId_areaCode.png
function croppingMask(patientId, analysisId, areaCode) {
  return path.resolve( path.join(
    process.env.UNZIPPED,
    String(patientId),
    String(analysisId),
    '/clipped/',
    `cropping-mask_${analysisId}_${areaCode}.png`
  ) )
}

// patientId/analysisId/raw/video_analysisId_areaCode.*
function rawVideo(patientId, analysisId, areaCode) {
  
  function findFile(folder, fileName) {
    if (fs.existsSync(folder)) {
      let files = fs.readdirSync(folder);
      for (var f of files) {
        if ( f.split('.')[0] == fileName )
          return f;
      }
    }
    return null;
    throw new Error('paths/paths.js: No file Found for ' + fileName + ' in folder ' + folder)
  }

  let folder = path.join(
    process.env.UNZIPPED,
    String(patientId),
    String(analysisId),
    '/raw/'
  )
  
  let file = findFile(folder, 'video_'+analysisId+'_'+areaCode)
  
  if (file==null)
    return null;
    
  return path.resolve( path.join( folder, file ) )
}

// patientId/analysisId/raw/video_analysisId_areaCode.mp4
function mp4Video(patientId, analysisId, areaCode) {
  return path.resolve( path.join(
    process.env.UNZIPPED,
    String(patientId),
    String(analysisId),
    '/raw/',
    `video_${analysisId}_${areaCode}.mp4`
  ) )
}

// patientId/analysisId/clipped/video_analysisId_areaCode.*
function clippedVideo(patientId, analysisId, areaCode) {
  return path.resolve( path.join(
    process.env.UNZIPPED,
    String(patientId),
    String(analysisId),
    '/clipped/',
    `clipped_${analysisId}_${areaCode}.mp4`
  ) )
}

// patientId/analysisId/clipped/snapshot_${analysisId}_${areaCode}_${timemark}.png
function snapshot(patientId, analysisId, areaCode, timemark) {
  return path.resolve( path.join(
    process.env.UNZIPPED,
    String(patientId),
    String(analysisId),
    '/clipped/',
    `snapshot_${analysisId}_${areaCode}_${timemark}.png`
  ) )
}

// patientId/analysisId/clipped/segmentation_${segmentationId}_rated_${rate}_snapshot_${analysisId}_${areaCode}_${timemark}.png`
function segmentation(patientId, analysisId, areaCode, timemark, segmentationId, rate) {
  return path.resolve( path.join(
    process.env.UNZIPPED,
    String(patientId),
    String(analysisId),
    '/clipped/',
    `segmentation_${segmentationId}_rated_${rate}_snapshot_${analysisId}_${areaCode}_${timemark}.png`
  ) )
}
// function segmentation(patientId, analysisId, areaCode, timemark, segmentationId, rate) {
//   function findFile(folder, fileName) {
//     let files = fs.readdirSync(folder);
//     for (var f of files) {
//       if ( f.slice(0,fileName.length) == fileName )
//         return f;
//     }
//     throw new Error('no file Found for', fileName, 'in folder', folder)
//   }
//   var folder =  path.join(
//     process.env.UNZIPPED,
//     String(patientId),
//     String(analysisId),
//     '/clipped/'
//   )
//   let file = findFile(folder, `segmentation_${segmentationId}_`)
//   return path.resolve( path.join( folder, file ) )
// }



module.exports = {croppingMask, rawVideo, mp4Video, clippedVideo, snapshot, segmentation};