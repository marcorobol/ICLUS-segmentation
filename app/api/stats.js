var express = require('express');
var router = express.Router();
const pool = require('../pool')

router.get('/stats', async function(req, res) {

  // console.log(req.query.groupBy);

  const groupBy = (Array.isArray(req.query.groupBy)?req.query.groupBy:[req.query.groupBy])
  const groupByDepth = req.query.groupBy.includes('depth')
  const groupByFrequency = req.query.groupBy.includes('frequency')
  const groupByPixelDensity = req.query.groupBy.includes('pixel_density')
  const groupByStructure = req.query.groupBy.includes('structure')
  const groupByRating = req.query.groupBy.includes('rating')
  const groupByStatus = req.query.groupBy.includes('status')

  // console.log(req.query.roundDepthBy);
  // console.log(req.query.roundFrequencyBy);
  // console.log(req.query.roundPixelDensityBy);
  
  const roundDepthBy = req.query.roundDepthBy;
  const roundFrequencyBy = req.query.roundFrequencyBy;
  const roundPixelDensityBy = req.query.roundPixelDensityBy;
  
  let SELECT = [];
  for (by of groupBy) {
    SELECT.push(by)
  }
  // if (groupByDepth)         SELECT.push(`depth`)
  // if (groupByFrequency)     SELECT.push(`frequency`)
  // if (groupByPixelDensity)  SELECT.push(`pixel_density`)
  // if (groupByStructure)     SELECT.push(`structure`)
  // if (groupByRating)        SELECT.push(`rating`)
  // if (groupByStatus)        SELECT.push(`status`)
  
  let SUBSELECT = [];
  for (by of groupBy) {
    if      (by=="depth")         SUBSELECT.push((roundDepthBy?`ROUND ( depth/${roundDepthBy} )*${roundDepthBy} AS depth`:`depth`))
    else if (by=="frequency")     SUBSELECT.push((roundFrequencyBy?`ROUND ( frequency/${roundFrequencyBy} )*${roundFrequencyBy} AS frequency`:`frequency`))
    else if (by=="pixel_density")  SUBSELECT.push((roundPixelDensityBy?`ROUND ( pixel_density/${roundPixelDensityBy} )*${roundPixelDensityBy} AS pixel_density`:`pixel_density`))
    else if (by=="structure")     SUBSELECT.push(`structure_id AS structure`)
    else if (by=="rating")        SUBSELECT.push(`rating_operator AS rating`)
    else if (by=="status")        SUBSELECT.push(`analysis_status AS status`)
    else                           SUBSELECT.push(by)
  }
  // if (groupByDepth)         SUBSELECT.push((roundDepthBy?`ROUND ( depth/${roundDepthBy} )*${roundDepthBy} AS depth`:`depth`))
  // if (groupByFrequency)     SUBSELECT.push((roundFrequencyBy?`ROUND ( frequency/${roundFrequencyBy} )*${roundFrequencyBy} AS frequency`:`frequency`))
  // if (groupByPixelDensity)  SUBSELECT.push((roundPixelDensityBy?`ROUND ( pixel_density/${roundPixelDensityBy} )*${roundPixelDensityBy} AS pixel_density`:`pixel_density`))
  // if (groupByStructure)     SUBSELECT.push(`structure_id AS structure`)
  // if (groupByRating)        SUBSELECT.push(`rating_operator AS rating`)
  // if (groupByStatus)        SUBSELECT.push(`analysis_status AS status`)
  
  let GROUP_BY = [];
  for (by of groupBy) {
    GROUP_BY.push(by)
  }
  // if (groupByDepth)         GROUP_BY.push(`depth`)
  // if (groupByFrequency)     GROUP_BY.push(`frequency`)
  // if (groupByPixelDensity)  GROUP_BY.push(`pixel_density`)
  // if (groupByStructure)     GROUP_BY.push(`structure`)
  // if (groupByRating)        GROUP_BY.push(`rating`)
  // if (groupByStatus)        GROUP_BY.push(`status`)
  
  let ORDER_BY = [];
  for (by of groupBy) {
    if (by=="structure")          ORDER_BY.push(`structure ASC`)
    else if (by=="rating")        ORDER_BY.push(`rating ASC`)
    else if (by=="status")        ORDER_BY.push(`status ASC`)
    else                           ORDER_BY.push(by+" ASC")
  }
  // let groupBy = (Array.isArray(req.query.groupBy)?req.query.groupBy:[req.query.groupBy])
  // for (let gp of groupBy){
  //   if      (gp=='depth')         ORDER_BY.push(`depth ASC`)
  //   else if (gp=='frequency')     ORDER_BY.push(`frequency ASC`)
  //   else if (gp=='pixel_density') ORDER_BY.push(`pixel_density ASC`)
  //   else if (gp=='structure')     ORDER_BY.push(`structure ASC`)
  //   else if (gp=='rating')        ORDER_BY.push(`rating ASC`)
  //   else if (gp=='status')        ORDER_BY.push(`status ASC`)
  // }

  let my_query = `
SELECT
${SELECT.join(',\n')}${(SELECT.length>0?',\n':'')}
SUM (_frames) AS number_of_frames,
COUNT (_file_id) AS number_of_files,
COUNT (DISTINCT _analysis_id) AS number_of_analyses,
COUNT (DISTINCT _patient_id) AS number_of_patients,
COUNT (DISTINCT _operator_id) AS number_of_operators,
ARRAY_AGG (DISTINCT _operator_id) operators

FROM
(
  SELECT
    ${SUBSELECT.join(',\n')}${(SUBSELECT.length>0?',\n':'')}
    frames AS _frames,
    file_id AS _file_id,
    analysis_id AS _analysis_id,
    patient_id AS _patient_id,
    operator_id AS _operator_id
    --analysis_status
  FROM
    app_file_flat
  WHERE
    frames IS NOT NULL
) AS app_file_flat_rounded

--WHERE
--depth IS NOT NULL AND
--analysis_status = 2

GROUP BY
${GROUP_BY.join(',\n')}

ORDER BY
${ORDER_BY.join(',\n')}

  `;

  console.log(my_query);


  
  let new_query = `
  SELECT
    MAX (count_pixel_density) count_pixel_density,
    MAX (count_depth) count_depth,
    array_pixel_density,
    array_depth,
    SUM (number_of_frames) AS number_of_frames,
    SUM (number_of_files) AS number_of_files,
    SUM (number_of_analyses) AS number_of_analyses

  FROM
    (
      SELECT 
        COUNT (DISTINCT ROUND ( pixel_density/40 )*40) AS count_pixel_density,
        COUNT (DISTINCT ROUND ( depth/20 )*20) AS count_depth,
        ARRAY_AGG (DISTINCT ROUND ( pixel_density/40 )*40) AS array_pixel_density,
        ARRAY_AGG (DISTINCT ROUND ( depth/20 )*20) AS array_depth,
        SUM (frames) AS number_of_frames,
        COUNT (file_id) AS number_of_files,
        COUNT (DISTINCT analysis_id) AS number_of_analyses
      FROM
        app_file_flat
      WHERE
        --depth IS NOT NULL AND
        analysis_status = 2
      GROUP BY
        analysis_id
      
    ) AS app_file_rounded
    
  GROUP BY
    array_pixel_density,
    array_depth
  `


  let esempio = `
    SELECT
    ROUND ( depth/5 )*5 AS depth_rounded,
    SUM (frames) AS number_of_frames,
    COUNT (file_id) AS number_of_files,
    COUNT (DISTINCT analysis_id) AS number_of_analyses,
    COUNT (DISTINCT patient_id) AS number_of_patients,
    COUNT (DISTINCT operator_id) AS number_of_operator,
    ARRAY_AGG (DISTINCT operator_id) operators

    FROM
    app_file_flat

    WHERE
    depth IS NOT NULL AND
    analysis_status = 2

    GROUP BY
    depth_rounded

    ORDER BY
    depth_rounded DESC
  `;

  // client = await pool.connect();
  // query_res = await client.query(my_query)
  query_res = await pool.query(my_query)
  .catch(err => {
    console.log(err.stack)
  })

  // client.release()
  
  // for (const row of rows) {
  //     [row.structure_id, row.operator_id, row.patient_id, row.analysis_id, row.analysis_status, row.file_id, row.file_area_code, row.rating_operator]);
  // }
  
  res.json(query_res.rows);
});




module.exports = router;