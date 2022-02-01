require('dotenv').config()
const express = require('express')
var router = express.Router()
const fs = require('fs')
const path = require('path');
const AdmZip = require("adm-zip");
const db = require('../db');



if (!('toJSON' in Error.prototype))
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {};

        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);

        return alt;
    },
    configurable: true,
    writable: true
});



function findFileByString(folder, string) {
  
  folder = folder + '/';

  if (!fs.existsSync(folder)){
    return undefined;
  }

  let files = fs.readdirSync(folder);

  for (const f of files) {
    // console.log( f.slice(0,string.length) )

    if ( fs.lstatSync(folder + f).isDirectory() ) {
      let found = findFileByString(folder + f + '/', string)
      if (found)
        return f + '/' + found;
    }

    // if it matches
    if ( f.slice(0,string.length) == string )
      return f;
  }

  return undefined;
  
}



router.get('/clipped_:where.zip', async function(req, res, next) { 
  console.log(req.path)
  console.log(req.params)

  // zip/clipped_where=analysis_id=1%20OR%20analysis_id=1042&where=file_area_code=%271%27.zip
  // var whereQueryString = req.params.where;
  // let whereArray = whereQueryString.split('&').map( s => s.slice(6) )
  // let whereSql = whereArray.map( w=>'(' + w + ')' ).join(' AND ')
  
  // zip/clipped_analysis_id=1ORanalysis_id=1042ANDfile_area_code=1.zip
  var whereQueryString = req.params.where;
  let whereArray = whereQueryString.split(' AND ')
  let whereSql = whereArray.map( w=>'(' + w + ')' ).join(' AND ')
  
  let query = `SELECT * FROM app_file_flat ${whereArray.length>0?'WHERE '+whereSql:''}`;
  const query_res = await db.query(query)
  .catch(err => {
    next(err);
  })
  
  const zip = new AdmZip();
  const outputFile = './tmp/'+req.url;

  for (const row of query_res.rows) {
      var {patient_id, analysis_id} = row;
      const localFolder = process.env.UNZIPPED+'/'+patient_id+'/'+analysis_id+'/raw/'
      if (!fs.existsSync(localFolder))
        fs.mkdirSync(localFolder, {recursive: true})
      zip.addLocalFolder(localFolder, patient_id+'/'+analysis_id);
  }

  zip.writeZip(outputFile);
  console.log(`Created ${outputFile} successfully`);

  res.sendFile(path.resolve(outputFile))
  
});



module.exports = router;
