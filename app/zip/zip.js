require('dotenv').config()
const express = require('express')
var router = express.Router()
const fs = require('fs')
const path = require('path');
const AdmZip = require("adm-zip");
const db = require('../db');
const createCsv = require('../zip/createCsv')



router.get('/clipped_:where.zip', async function(req, res, next) { 
  // console.log(req.path)
  // console.log(req.params)

  // zip/clipped_where=analysis_id=1%20OR%20analysis_id=1042&where=file_area_code=%271%27.zip
  // var whereQueryString = req.params.where;
  // let whereArray = whereQueryString.split('&').map( s => s.slice(6) )
  // let whereSql = whereArray.map( w=>'(' + w + ')' ).join(' AND ')
  
  // zip/clipped_analysis_id=1ORanalysis_id=1042ANDfile_area_code=1.zip
  var whereQueryString = req.params.where;
  let whereArray = whereQueryString.split(' AND ')
  let whereSql = whereArray.map( w=>'(' + w + ')' ).join(' AND ')
  
  let query = `SELECT * FROM files_segmentations ${whereArray.length>0?'WHERE '+whereSql:''}`;
  const query_res = await db.query(query).catch(next)

  await prepareAndSendZip(req, res, next, query_res.rows, {whereQueryString, whereArray, whereSql})

});



router.get('/clipped_.zip', async function(req, res, next) {
  
  let query = `SELECT * FROM files_segmentations`;
  const query_res = await db.query(query).catch(next)

  await prepareAndSendZip(req, res, next, query_res.rows, {whereQueryString:'', whereArray:[], whereSql:''})

});


  
async function prepareAndSendZip(req, res, next, rows, {whereQueryString, whereArray, whereSql}) {

  const zip = new AdmZip();
  const outputFile = './tmp/'+req.url;

  for (const row of rows) {
      var {patient_id, analysis_id, file_area_code} = row;
      
      // create specific csv video file
      var csvPath = process.env.UNZIPPED+'/'+patient_id+'/'+analysis_id+'/clipped/video_'+analysis_id+'_'+file_area_code+'.csv'
      await createCsv([row], csvPath)

      // add entire folder
      var localFolder = process.env.UNZIPPED+'/'+patient_id+'/'+analysis_id+'/clipped/'
      zip.addLocalFolder(localFolder, patient_id+'/'+analysis_id);
  }
  


  // create global csv videos file
  let partialCsvPath = './tmp/videos.csv'
  await createCsv(rows, partialCsvPath)
  // add specific csv file
  zip.addLocalFile(partialCsvPath);



  // // create global csv segmentations file
  // let segmentations_query = `SELECT * FROM segmentations ${whereArray.length>0?'WHERE '+whereSql:''}`;
  // let segmentations_query_res = await db.query(segmentations_query).catch(next)
  // let partialSegCsvPath = './tmp/segmentations_'+req.params.where+'.csv'
  // await createCsv(segmentations_query_res.rows, partialSegCsvPath)
  // // add specific csv file
  // zip.addLocalFile(partialSegCsvPath);



  zip.writeZip(outputFile);
  console.log(`Created ${outputFile} successfully`);

  res.sendFile(path.resolve(outputFile))
  
};



module.exports = router;
