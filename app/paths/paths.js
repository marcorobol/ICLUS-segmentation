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

function cropCsv(patientId, analysisId, areaCode) {
  return path.resolve( path.join(
    process.env.UNZIPPED,
    String(patientId),
    String(analysisId),
    '/clipped/',
    `crop_${analysisId}_${areaCode}.csv`
  ) )
}

function approvalCsv(patientId, analysisId, areaCode) {
  return path.resolve( path.join(
    process.env.UNZIPPED,
    String(patientId),
    String(analysisId),
    '/clipped/',
    `approval_${analysisId}_${areaCode}.csv`
  ) )
}

// patientId/analysisId/raw/video_analysisId_areaCode.*
function rawFolder(patientId, analysisId) {

  let folder = path.join(
    process.env.UNZIPPED,
    String(patientId),
    String(analysisId),
    '/raw/'
  )
    
  return path.resolve( folder )
}

// patientId/analysisId/raw/video_analysisId_areaCode.*
function rawVideo(patientId, analysisId, areaCode, extension=null) {
  
  // if extension is known/provided
  if(extension) {
    // if extension does not start with '.'
    if (extension[0]!='.')
      extension = '.'+extension
    return path.resolve( path.join(
      process.env.UNZIPPED,
      String(patientId),
      String(analysisId),
      '/raw/',
      `video_${analysisId}_${areaCode}${extension}`
    ) )
  }


  function findFile(folder, fileName) {
    if (fs.existsSync(folder)) {
      let files = fs.readdirSync(folder);
      for (var f of files) {
        if ( f.split('.')[0] == fileName )
          return f;
      }
    }
    // return null;
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
function snapshot(patientId, analysisId, areaCode, timemark=null) {
  if(timemark)
    return path.resolve( path.join(
      process.env.UNZIPPED,
      String(patientId),
      String(analysisId),
      '/clipped/',
      `snapshot_${analysisId}_${areaCode}_${timemark}.png`
    ) )
  else
    return path.resolve( path.join(
      process.env.UNZIPPED,
      String(patientId),
      String(analysisId),
      '/raw/',
      `snapshot_${analysisId}_${areaCode}.png`
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

function segmentationCsv(patientId, analysisId, areaCode, timemark, segmentationId, rate) {
  return path.resolve( path.join(
    process.env.UNZIPPED,
    String(patientId),
    String(analysisId),
    '/clipped/',
    `segmentation_${segmentationId}_rated_${rate}_snapshot_${analysisId}_${areaCode}_${timemark}.csv`
  ) )
}



module.exports = {croppingMask, cropCsv, approvalCsv, rawVideo, rawFolder, mp4Video, clippedVideo, snapshot, segmentation, segmentationCsv};