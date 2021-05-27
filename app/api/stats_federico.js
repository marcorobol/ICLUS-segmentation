var express = require('express');
var router = express.Router();



// COVID

// 1080, 1083, 1141, 1140, 1139, 1142, 1143, 1144, 1537, 1538, 1539, 1540, 1541, 1543, 1546, 1545, 1547, 1548, 1639, 
// 1365, 1366, 1368, 1375, 1378, 1380, 1384, 1524, 1521, 1720, 1721, 1722, 1727, 1728, 1730, 1731, 1802, 1804, 1805, 1806, 
// 1047, 1048, 1119, 1120, 1122, 1124, 1126, 1127, 1128, 1129, 1133, 1149, 1150, 1151, 1152, 1153, 1155, 1156, 1157, 1158, 1159, 1160, 1161, 1162, 1163, 1212, 1213, 1222, 1223, 1224, 1247, 1252, 1265, 1266, 1267, 1268, 1269, 1270, 1305, 1306, 1309, 1310, 1311, 1312, 1313, 1314, 1315, 1317, 1323, 1330, 1331, 1332, 1381, 1382, 1388, 1389, 1390, 1391, 1392, 1393, 1394, 1395, 1396, 1397, 1398, 1405, 1406, 1407, 1408, 1409, 1410, 1411, 1412, 1413, 1414, 1415, 1416, 1417, 1418, 1419, 1420, 1552, 1553, 1564, 1565, 1566, 1567, 1570, 1571, 1574, 1576, 1580, 1581, 1582

// POST-COVID

// 1808, 1809, 1812, 1920, 1814, 1914, 1915, 1916, 1917, 1919, 1939
// 1821, 1824, 1826, 1832, 1833, 1834, 1835, 1836, 1837, 1838, 1839, 1840, 1841, 1843, 1844, 1817, 1818, 1819, 1820, 1823, 1825, 1828, 1829, 1830, 1831, 1842, 1845, 1846, 1847, 1848, 1849, 1850, 1851, 1852, 1853, 1854, 1855, 1856, 1857, 1858, 1859, 1860, 1861, 1862, 1863, 1865, 1866, 1867, 1868, 1869, 1864, 1880, 1881, 1882, 1883, 1884, 1885, 1886, 1887, 1888, 1870, 1871, 1872, 1873, 1874, 1875, 1876, 1877, 1878, 1879, 1889, 1890, 1891, 1892, 1893, 1894, 1895, 1896, 1897, 1898, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1911, 1912, 1899, 1901, 1902, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1932, 1933, 1934, 1935, 1936, 1937

const roma_smargiassi_post_covid = [
  1808,
  1809,
  1812,
  1920,
  1814,
  1914,
  1915,
  1916,
  1917,
  1919,
  1939
]
const roma_smargiassi = [
  1080,
  1083,
  1141,
  1140,
  1139,
  1142,
  1143,
  1144,
  1537,
  1538,
  1539,
  1540,
  1541,
  1543,
  1546,
  1545,
  1547,
  1548,
  1639
]
const lodi_macioce = [
  1365,
  1366,
  1368,
  1375,
  1378,
  1380,
  1384,
  1524,
  1521,
  1720,
  1721,
  1722,
  1727,
  1728,
  1730,
  1731,
  1802,
  1804,
  1805,
  1806
]
const pavia_perrone_post_covid = [
  1821,
  1824,
  1826,
  1832,
  1833,
  1834,
  1835,
  1836,
  1837,
  1838,
  1839,
  1840,
  1841,
  1843,
  1844,
  1817,
  1818,
  1819,
  1820,
  1823,
  1825,
  1828,
  1829,
  1830,
  1831,
  1842,
  1845,
  1846,
  1847,
  1848,
  1849,
  1850,
  1851,
  1852,
  1853,
  1854,
  1855,
  1856,
  1857,
  1858,
  1859,
  1860,
  1861,
  1862,
  1863,
  1865,
  1866,
  1867,
  1868,
  1869,
  1864,
  1880,
  1881,
  1882,
  1883,
  1884,
  1885,
  1886,
  1887,
  1888,
  1870,
  1871,
  1872,
  1873,
  1874,
  1875,
  1876,
  1877,
  1878,
  1879,
  1889,
  1890,
  1891,
  1892,
  1893,
  1894,
  1895,
  1896,
  1897,
  1898,
  1903,
  1904,
  1905,
  1906,
  1907,
  1908,
  1909,
  1910,
  1911,
  1912,
  1899,
  1901,
  1902,
  1921,
  1922,
  1923,
  1924,
  1925,
  1926,
  1927,
  1928,
  1929,
  1930,
  1932,
  1933,
  1934,
  1935,
  1936,
  1937
]
const pavia_perrone = [
  1047,
  1048,
  1119,
  1120,
  1122,
  1124,
  1126,
  1127,
  1128,
  1129,
  1133,
  1149,
  1150,
  1151,
  1152,
  1153,
  1155,
  1156,
  1157,
  1158,
  1159,
  1160,
  1161,
  1162,
  1163,
  1212,
  1213,
  1222,
  1223,
  1224,
  1247,
  1252,
  1265,
  1266,
  1267,
  1268,
  1269,
  1270,
  1305,
  1306,
  1309,
  1310,
  1311,
  1312,
  1313,
  1314,
  1315,
  1317,
  1323,
  1330,
  1331,
  1332,
  1381,
  1382,
  1388,
  1389,
  1390,
  1391,
  1392,
  1393,
  1394,
  1395,
  1396,
  1397,
  1398,
  1405,
  1406,
  1407,
  1408,
  1409,
  1410,
  1411,
  1412,
  1413,
  1414,
  1415,
  1416,
  1417,
  1418,
  1419,
  1420,
  1552,
  1553,
  1564,
  1565,
  1566,
  1567,
  1570,
  1571,
  1574,
  1576,
  1580,
  1581,
  1582
]
const federico_subset_covid = roma_smargiassi.concat(lodi_macioce).concat(pavia_perrone);
const federico_subset_post = roma_smargiassi_post_covid.concat(pavia_perrone_post_covid);
const federico_subset = federico_subset_covid.concat(federico_subset_post);


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

router.get('/', async function(req, res) {

  let SELECT = [];
  let SUBSELECT = [];
  let SUBSUBSELECT = [];
  let GROUP_BY = [];
  let ORDER_BY = [];

  // if (req.query.clusterIn) {
  //   const clusterIn = (Array.isArray(req.query.clusterIn)?req.query.clusterIn:[req.query.clusterIn])
  //   for (c of clusterIn) {
  //     let field = c.match(/(\w+)/g)[0];
  //     let ranges = [...c.matchAll(/(\(|\[)(\d+),(\d+)(\)|\])/g)]
  //     SUBSELECT.push(`(select case ${caseOf(field,ranges)} else 'others' end) as _${field}`)
  //   }
  // }
  
  const roundDepthBy = req.query.roundDepthBy;
  const roundFrequencyBy = req.query.roundFrequencyBy;
  const roundPixelDensityBy = req.query.roundPixelDensityBy;

  const groupBy = (Array.isArray(req.query.groupBy)?req.query.groupBy:[req.query.groupBy])
  for (by of groupBy) {
    let field = by.match(/(\w+)/g)[0];



    SELECT.push(field)



    let ranges = [...by.matchAll(/(\(|\[)(\d*\.?\d*),*(\d*\.?\d*)(\)|\])/g)]
    console.log(by)
    if(ranges.length>0) {
      SUBSELECT.push(`(select case ${caseOf(field,ranges)} else 'others' end) as ${field}`)
      SUBSELECT.push(`${field} AS _${field}`)
    }
    else {
      SUBSELECT.push(field)
      SUBSELECT.push(`${field} AS _${field}`)
    }


    //::numeric similar to +0.00001
    if      (field=="depth")         SUBSUBSELECT.push((roundDepthBy?`ROUND ( (depth::numeric)/${roundDepthBy} )*${roundDepthBy} AS depth`:`depth`))
    else if (field=="frequency")     SUBSUBSELECT.push((roundFrequencyBy?`ROUND ( (frequency::numeric)/${roundFrequencyBy} )*${roundFrequencyBy} AS frequency`:`frequency`))
    else if (field=="pixel_density") SUBSUBSELECT.push((roundPixelDensityBy?`ROUND ( (pixel_density::numeric)/${roundPixelDensityBy} )*${roundPixelDensityBy} AS pixel_density`:`pixel_density`))
    else if (field=="structure")     SUBSUBSELECT.push(`structure_id AS structure`)
    else if (field=="rating")        SUBSUBSELECT.push(`rating_operator AS rating`)
    else if (field=="status")        SUBSUBSELECT.push(`analysis_status AS status`)
    else                             SUBSUBSELECT.push(by)



    GROUP_BY.push(field)
    


    if (field=="structure")          ORDER_BY.push(`structure ASC`)
    else if (field=="rating")        ORDER_BY.push(`rating ASC`)
    else if (field=="status")        ORDER_BY.push(`status ASC`)
    else                          ORDER_BY.push(field+" ASC")

  }



  let my_query = `
SELECT
${SELECT.join(',\n')}${(SELECT.length>0?',\n':'')}
${SELECT.map((field)=>{return `ARRAY_AGG (DISTINCT _${field}) AS ${field}s`}).join(',\n')}${(SELECT.length>0?',\n':'')}
SUM (_frames) AS number_of_frames,
COUNT (_file_id) AS number_of_files,
COUNT (DISTINCT _analysis_id) AS number_of_analyses,
COUNT (DISTINCT _patient_id) AS number_of_patients,
COUNT (DISTINCT _operator_id) AS number_of_operators,
ARRAY_AGG (DISTINCT _operator_id) operators

FROM
(
  SELECT
    ${SUBSELECT.join(',\n')}${(SUBSELECT.length>0?',':'')}
    _frames,
    _file_id,
    _analysis_id,
    _patient_id,
    _operator_id
  FROM
  (
    SELECT
      ${SUBSUBSELECT.join(',\n')}${(SUBSUBSELECT.length>0?',':'')}
      frames AS _frames,
      file_id AS _file_id,
      analysis_id AS _analysis_id,
      patient_id AS _patient_id,
      operator_id AS _operator_id
    FROM
      federico_dataset--app_file_flat
      --AND analysis_id IN ( ${federico_subset.join(',')} )
    --WHERE frames IS NOT NULL
  ) AS rounded
) AS clustered

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
  
  
  
  query_res = await req.pool.query(my_query)
  .catch(err => {
    console.log(err.stack)
  })
  
  // for (const row of rows) {
  //     [row.structure_id, row.operator_id, row.patient_id, row.analysis_id, row.analysis_status, row.file_id, row.file_area_code, row.rating_operator]);
  // }
  
  res.json(query_res.rows);
});




module.exports = router;