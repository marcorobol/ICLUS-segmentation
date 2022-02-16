const AWS = require('aws-sdk')
const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)
const path = require('path');
require('dotenv').config()



const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
const BUCKET_NAME = process.env.AWS_STORAGE_BUCKET_NAME

var s3 = new AWS.S3({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    endpoint: new AWS.Endpoint("https://s3.amazonaws.com")
})



async function downloadFolder(s3FolderKey, localFolderPath) {

    // Key must be a folder and must include / at the end //'operators/1014/patients/1017/analisys/1047/raw/'
    if (s3FolderKey[s3FolderKey.length-1]!='/')
        s3FolderKey += '/'

    // Get list of files
    let params = {
        Bucket: BUCKET_NAME, /* required */
        Prefix: s3FolderKey  // Can be your folder name
    };
    var s3listObjectsV2Data = await s3.listObjectsV2(params).promise()
    
    // console.log(s3listObjectsV2Data); // successful response

    // Iterate over list of files
    for (const listEntry of s3listObjectsV2Data.Contents) {
        // console.log(listEntry)

        // skip if the entry is not a file
        if (listEntry.Size==0)
            continue;

        let s3EntryKey = listEntry.Key; //'operators/1014/patients/1017/analisys/1047/cropped/crop_video_1047_1.mp4'
        let fileName = s3EntryKey.split('/').splice( s3FolderKey.split('/').length-1 ).join('/'); //cropped/crop_video_1047_1.mp4
        // console.log(s3AnalysisSubPath)

        // Skip subfolders
        if (fileName.split('/').lenght>1)
            continue;
        
        // Set local path and folder
        let localFilePath = path.join(localFolderPath, fileName);

        // Skip if file already exists in local
        if(fs.existsSync(localFilePath))
            continue;

        // Create local folder
        fs.mkdirSync(path.dirname(localFilePath), { recursive: true })

        // Download file
        let params = {
            Bucket: BUCKET_NAME,
            Key: s3EntryKey
        }
        var s3GetObjectData = await s3.getObject(params).promise()
        // console.log(s3GetObjectData) // successful response
        
        // Save file locally
        console.log('downloading s3://' + s3EntryKey + ' on ' + localFilePath)
        await writeFile(localFilePath, s3GetObjectData.Body)
        
    }

}



async function getEntries(s3FolderKey) {

    // Key must be a folder and must include / at the end //'operators/1014/patients/1017/analisys/1047/raw/'
    if (s3FolderKey[s3FolderKey.length-1]!='/')
        s3FolderKey += '/'

    // Get list of files
    let params = {
        Bucket: BUCKET_NAME, /* required */
        Prefix: s3FolderKey  // Can be your folder name
    };
    var s3listObjectsV2Data = await s3.listObjectsV2(params).promise()
    
    // console.log(s3listObjectsV2Data); // successful response

    var list = []

    // Iterate over list of files
    for (const listEntry of s3listObjectsV2Data.Contents) {

        // Skip NON files
        if (listEntry.Size==0)
            continue;

        let s3EntryKey = listEntry.Key; //'operators/1014/patients/1017/analisys/1047/raw/crop_video_1047_1.mp4'

        // Skip subfolders
        let fileName = s3EntryKey.split('/').splice( s3FolderKey.split('/').length-1 ).join('/'); //crop_video_1047_1.mp4
        if (fileName.split('/').lenght>1)
            continue;
        
        list.push(s3EntryKey)
        
    }

    return list;

}



async function downloadFile(s3FileKey, localFilePath) {
    // s3FileKey: 'operators/1014/patients/1017/analisys/1047/cropped/crop_video_1047_1.mp4'
    
    // Skip if file already exists in local
    if(fs.existsSync(localFilePath))
        return;

    // Create local folder
    fs.mkdirSync(path.dirname(localFilePath), { recursive: true })

    // Download file
    let params = {
        Bucket: BUCKET_NAME,
        Key: s3FileKey
    }
    var s3GetObjectData = await s3.getObject(params).promise()
    // console.log(s3GetObjectData) // successful response
    
    // Save file locally
    console.log('downloading s3://' + s3FileKey + ' on ' + localFilePath)
    await writeFile(localFilePath, s3GetObjectData.Body)
    

}





module.exports = {downloadFolder, getEntries, downloadFile};