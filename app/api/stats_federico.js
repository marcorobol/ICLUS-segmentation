var express = require('express');
var router = express.Router();
const pool = require('../pool')



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



router.get('/', async function(req, res) {

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
    federico_dataset--app_file_flat
    --AND analysis_id IN ( ${federico_subset.join(',')} )
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