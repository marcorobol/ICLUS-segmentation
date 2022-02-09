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

async function select_file(analysisId, areaCode) {
    const app_file_flat_query_res = await query(`SELECT * FROM app_file_flat WHERE CONCAT(analysis_id,'_',file_area_code)=$1`, [analysisId+'_'+areaCode])
    if(app_file_flat_query_res.rows.length==0)
        throw new Error('No entry exists in db.app_file_flat for analysis_id='+analysisId+' AND file_area_code='+areaCode)
    return app_file_flat_query_res.rows[0]
}

module.exports = {query, select_file};