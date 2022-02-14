var express = require('express');
var router = express.Router();
const db = require('../db');


function caseOf (field, ranges) {
  let SQL = ''
  for (r of ranges) {
    let [range, leftParenthesis, left, right, rightParenthesis] = r
    if (left && right) {
      let label = `${leftParenthesis} ${left} , ${right} ${rightParenthesis}`

      let excludes = []
      for ( let [exclude, value] of [ [leftParenthesis=='(', left], [rightParenthesis==')', right] ] ) {
        if (exclude)
        excludes.push(value)
      }

      let notIn = (excludes.length>0?`AND ${field} NOT IN (${excludes.join(',')})`:'')
      SQL = SQL + `when ${field} between ${left} and ${right} ${notIn} then '${label}' `
    }
    else {
      let label = `${left}`
      SQL = SQL + `when ${field} = ${left} then '${label}' `
    }
  }
  return SQL;
}

router.get('/', async function(req, res, next) {

  /**
   * Request params
   */
  const where = (Array.isArray(req.query.where)?req.query.where:(req.query.where?[req.query.where]:[]))
  const groupBy = (Array.isArray(req.query.groupBy)?req.query.groupBy:[req.query.groupBy])

  const roundDepthBy = req.query.roundDepthBy;
  const roundFrequencyBy = req.query.roundFrequencyBy;
  const roundPixelDensityBy = req.query.roundPixelDensityBy;

  /**
   * Query subparts
   */
  let SUBSUBSELECT = [];
  let SUBSELECT = [];
  let SELECT = [];
  let GROUP_BY = [];
  let ORDER_BY = [];
  let WHERE = [];

  /**
   * WHERE
   */
  // WHERE.push('frames IS NOT NULL')
  for (wh of where)
    WHERE.push( wh )
  
  
  for (by of groupBy) {

    /**
     * groupBy fields (with eventual alias)
     */
    let alis_field = by.match(/(\w+)/g)[0];
    let field = alis_field
    if   (alis_field=="structure")   field = `structure_id`
    else if (alis_field=="rating")   field = `rating_operator`
    else if (alis_field=="status")   field = `analysis_status`

    /**
     * SELECT
     */
    if   (alis_field != field)   SELECT.push(`__${field} AS ${alis_field}`)
    else                         SELECT.push(`__${field} AS ${field}`)
    // list of values in the around or in the cluster
    SELECT.push(`ARRAY_AGG (DISTINCT __${field}) AS ${field}s`)

    /**
     * SUBSELECT __clustered
     */
    let ranges = [...by.matchAll(/(\(|\[)(\d*\.?\d*),*(\d*\.?\d*)(\)|\])/g)]
    if(ranges.length>0) {
      SUBSELECT.push(`(select case ${caseOf('_'+field,ranges)} else 'others' end) as __${field}`)
    }
    else {
      SUBSELECT.push(`_${field} AS __${field}`)
    }

    /**
     * SUBSUBSELECT _rounded
     */
    //::numeric similar to +0.00001
    if      (field=="depth")         SUBSUBSELECT.push((roundDepthBy?`ROUND ( (depth::numeric)/${roundDepthBy} )*${roundDepthBy} AS _depth`:`depth AS _depth`))
    else if (field=="frequency")     SUBSUBSELECT.push((roundFrequencyBy?`ROUND ( (frequency::numeric)/${roundFrequencyBy} )*${roundFrequencyBy} AS _frequency`:`frequency AS _frequency`))
    else if (field=="pixel_density") SUBSUBSELECT.push((roundPixelDensityBy?`ROUND ( (pixel_density::numeric)/${roundPixelDensityBy} )*${roundPixelDensityBy} AS _pixel_density`:`pixel_density AS _pixel_density`))
    else                             SUBSUBSELECT.push(field+' AS _'+field)

    /**
     * GROUP_BY and ORDER_BY
     */
    GROUP_BY.push('__'+field)
    ORDER_BY.push('__'+field+" ASC")

  }

  /**
   * Additional fields in SELECT SUBSELECT and SUBSUBSELECT
   */
  SELECT.push('SUM (frames) AS number_of_frames')
  SELECT.push('COUNT (file_id) AS number_of_files')
  SELECT.push('COUNT (DISTINCT analysis_id) AS number_of_analyses')
  SELECT.push('COUNT (DISTINCT patient_id) AS number_of_patients')
  SELECT.push('COUNT (DISTINCT operator_id) AS number_of_operators')
  SELECT.push('ARRAY_AGG (DISTINCT operator_id) AS operators')
  SUBSELECT.push('*')
  SUBSUBSELECT.push('*')

  /**
   * Query: super compact version
   */
  let my_query =
`SELECT ${SELECT.join(', ')} FROM (
  SELECT ${SUBSELECT.join(', ')} FROM (
    SELECT ${SUBSUBSELECT.join(', ')} FROM files_segmentations
    ${WHERE.length>0?'WHERE':''} ${WHERE.map( w=>'('+w+')').join(' AND ')}
  ) AS _rounded
) AS __clustered
GROUP BY ${GROUP_BY.join(', ')} ORDER BY ${ORDER_BY.join(', ')}`;
  
  
  // Execute query
  query_res = await db.query(my_query)
  .catch(err => {
    next(err);
  })

  // Respond
  res.json(query_res.rows);

});




module.exports = router;