require('dotenv').config()
const fs = require('fs')
const path = require('path');
const fastcsv = require('fast-csv')
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;



function fastcsvWritePromisified(rows, options, path) {
  return new Promise((resolve, reject) => {
    fastcsv.writeToStream( fs.createWriteStream(path), rows, options)
    .on('error', (err) => reject(err))
    .on('finish', () => resolve(rows));
  });
}



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
 *   { "a": 1, "b.c": 2}
 */
 const flattenObject = (obj, namespace = '') => {
  const flattened = {}

  Object.keys(obj).forEach((key) => {
    const value = obj[key]

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, ''+namespace+key+'.'))
    } else if (Array.isArray(value)) {
      flattened[''+namespace+key] = JSON.stringify(value)
    } else {
      flattened[''+namespace+key] = value
    }
  })

  return flattened
}



function createCsv(rows, csvPath) {

  if (!Array.isArray(rows))
    rows = [rows]

  // console.log('createCsv: wrinting', rows, 'in', csvPath)
  
  // create folder
  if (!fs.existsSync(path.dirname(csvPath)))
    fs.mkdirSync(path.dirname(csvPath), {recursive: true})
  
  var flatRows = rows.map( row => flattenObject(row) )
  return fastcsvWritePromisified(flatRows, { headers: true, delimiter: ';' }, csvPath)
  // let csvWriter = createCsvWriter({ path: partialCsvPath, header: csvHeader, fieldDelimiter: ';' });
  // await csvWriter.writeRecords(flatRows)
  
};



module.exports = createCsv;
