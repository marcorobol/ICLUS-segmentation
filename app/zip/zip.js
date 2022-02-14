require('dotenv').config()
const express = require('express')
var router = express.Router()
const fs = require('fs')
const path = require('path');
const AdmZip = require("adm-zip");
const db = require('../db');
const fastcsv = require('fast-csv');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;



function fastcsvWritePromisified(rows, options, path) {
  return new Promise((resolve, reject) => {
    fastcsv.writeToStream( fs.createWriteStream(path), rows, options)
    .on('error', (err) => reject(err))
    .on('finish', () => resolve());
  });
}

// if (!('toJSON' in Error.prototype))
// Object.defineProperty(Error.prototype, 'toJSON', {
//     value: function () {
//         var alt = {};

//         Object.getOwnPropertyNames(this).forEach(function (key) {
//             alt[key] = this[key];
//         }, this);

//         return alt;
//     },
//     configurable: true,
//     writable: true
// });
  
// var csvHeader = [
//   {id: 'structure_id',    title: 'structure_id'       },
//   {id: 'operator_id',     title: 'operator_id'        },
//   {id: 'patient_id',      title: 'patient_id'         },
//   {id: 'analysis_id',     title: 'analysis_id'        },
//   {id: 'analysis_status', title: 'analysis_status'    },
//   {id: 'file_id',         title: 'file_id'            },
//   {id: 'file_area_code',  title: 'file_area_code'     },
//   {id: 'rating_operator', title: 'rating_operator'    },
//   {id: 'depth',           title: 'depth'              },
//   {id: 'frequency',       title: 'frequency'          },
//   {id: 'focal_point',     title: 'focal_point'        },
//   {id: 'pixel_density',   title: 'pixel_density'      },
//   {id: 'frames',          title: 'frames'             },
//   {id: 'patient_key',     title: 'patient_key'        },
//   {id: 'profile_label',   title: 'profile_label'      },
//   {id: 'profile_scanner_brand',   title: 'profile_scanner_brand'},
//   {id: 'file_missing',            title: 'file_missing'         },
//   {id: 'extra.resolution.width',  title: 'width'                },
//   {id: 'extra.resolution.height', title: 'height'               }
// ]



/**
 * Flatten a multidimensional object
 *
 * For example:
 *   flattenObject{ a: 1, b: { c: 2 } }
 * Returns:
 *   { a: 1, c: 2}
 */
 const flattenObject = (obj, namespace = '') => {
  const flattened = {}

  Object.keys(obj).forEach((key) => {
    const value = obj[key]

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, ''+namespace+key+'.'))
    } else {
      flattened[''+namespace+key] = value
    }
  })

  return flattened
}



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
  const query_res = await db.query(query)
  .catch(err => {
    next(err);
  })
  
  const zip = new AdmZip();
  const outputFile = './tmp/'+req.url;

  for (const row of query_res.rows) {
      var {patient_id, analysis_id} = row;
      const localFolder = process.env.UNZIPPED+'/'+patient_id+'/'+analysis_id+'/clipped/'
      if (!fs.existsSync(localFolder))
        fs.mkdirSync(localFolder, {recursive: true})
        
      let metadataJsonPath = process.env.UNZIPPED+'/'+patient_id+'/'+analysis_id+'/clipped/metadata.json'
      // if (!fs.existsSync(metadataJsonPath)) {
        fs.writeFileSync(metadataJsonPath, JSON.stringify(row))
      // }
      
      let flatRow = flattenObject(row)
      let csvPath = process.env.UNZIPPED+'/'+patient_id+'/'+analysis_id+'/clipped/metadata.csv'
      await fastcsvWritePromisified([flatRow], { headers: true, delimiter: ';' }, csvPath);
      // let csvWriter = createCsvWriter({ path: csvPath, header: csvHeader });
      // await csvWriter.writeRecords(row)

      zip.addLocalFolder(localFolder, patient_id+'/'+analysis_id);
  }
  

  
  var flatRows = query_res.rows.map( row => flattenObject(row) )
  let partialCsvPath = './tmp/'+whereQueryString+'.csv'
  await fastcsvWritePromisified(flatRows, { headers: true, delimiter: ';' }, partialCsvPath)
  // let csvWriter = createCsvWriter({ path: partialCsvPath, header: csvHeader, fieldDelimiter: ';' });
  // await csvWriter.writeRecords(flatRows)
  
  zip.addLocalFile(partialCsvPath);



  zip.writeZip(outputFile);
  console.log(`Created ${outputFile} successfully`);

  res.sendFile(path.resolve(outputFile))
  
});



module.exports = router;
