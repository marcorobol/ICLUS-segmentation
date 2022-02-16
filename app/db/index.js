const { Pool } = require('pg');

const pool = new Pool();

const db = this

async function query(text, params) {
    // invocation timestamp for the query method
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        // time elapsed since invocation to execution
        const duration = Date.now() - start;
        console.log(
            'executed query', 
            {text: text.split('\n')[0] + (text.split('\n').length>1?'...':''), duration, rows: res.rowCount}
        );
        return res;
    } catch (error) {
        console.log('error in query', {text}, 'with parameters', params);
        throw error;
    }
}

async function selectFile(analysisId, areaCode) {
    const query_res = await query(`SELECT * FROM app_file_flat WHERE CONCAT(analysis_id,'_',file_area_code)=$1`, [analysisId+'_'+areaCode])
    if(query_res.rows.length==0)
        throw new Error('No entry exists in db.app_file_flat for analysis_id='+analysisId+' AND file_area_code='+areaCode)
    return query_res.rows[0]
}

async function selectFiles() {
    const query_res = await query(`SELECT * FROM app_file_flat`)
    return query_res.rows
}

async function selectCrops(analysisId, areaCode) {
    // let query = `SELECT * FROM crops WHERE CONCAT(analysis_id,'_',area_code)='${req.params.video_ref}'`
    const query_res = await query(`SELECT * FROM crops WHERE analysis_id  =$1 AND area_code = $2`, [analysisId, areaCode])
    return query_res.rows
}

// ALTER TABLE crops ADD UNIQUE (analysis_id, area_code);
async function insertUpdateCrop(user_id, analysis_id, area_code, bounds) {
    const crop_created_at = new Date()
    const query_res = await query( `INSERT INTO crops (crop_id, crop_created_at, user_id, analysis_id, area_code, crop_bounds)
        VALUES ( DEFAULT, $1, $2, $3, $4, $5 )
        ON CONFLICT (analysis_id, area_code) 
        DO UPDATE SET crop_created_at = $1, user_id = $2, crop_bounds = $5;`,
        [crop_created_at, user_id, analysis_id, area_code, bounds] )
    return query_res
}

module.exports = {query, selectFile, selectFiles, selectCrops, insertUpdateCrop};