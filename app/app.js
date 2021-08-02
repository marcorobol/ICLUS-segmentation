require('dotenv').config()
const express = require('express')
const app = express()
const fs = require('fs')
const serveIndex = require('serve-index')
const hbjs = require('handbrake-js')
const path = require('path')



/**
 * Configure Express.js parsing middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



/**
 * Postgres pool connection
 */
const { Pool } = require('pg')
const pool = new Pool()
// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})
app.use('/', async function(req, res, next) {
  req.pool = pool
  next();
})



/**
 * Incoming requests logger
 */
app.use((req, res, next) => {
    console.log('Incoming request ('+req.ip+')', req.method, req.hostname, req.url)//req.queryreq.path
    next()
});



/**
 * Serve front-end static files
 */
// Not indexed
app.use('/', express.static('static'));
// Indexed
app.use('/unzipped', express.static(process.env.UNZIPPED), serveIndex(process.env.UNZIPPED, { 'icons': true }) );



/**
 * Mp4 Service
 */
const mp4_router = require('./mp4/mp4.js');
app.use('/mp4', mp4_router);



/**
 * Webapp
 */

// files
app.use('/webapp', express.static('./webapp'));

// special route to handle segmentation of a random video 
app.get('/webapp/segment', async function(req, res, next) {

  if (!req.query.patient_id || !req.query.analysis_id || !req.query.area_code) {

    let client = await req.pool.connect();
    let query = `SELECT * FROM app_file_flat ORDER BY RANDOM() LIMIT 1;`
    let query_res = await client.query(query)
    .catch(err => { console.log(err.stack) })
    client.release()
    let patient_id = query_res.rows[0].patient_id
    let analysis_id = query_res.rows[0].analysis_id
    let area_code = query_res.rows[0].file_area_code

    res.redirect('../#/segment/?patient_id=' + patient_id + "&analysis_id=" + analysis_id + "&area_code=" + area_code);
    return;

  }
  next();

});

// app main file
app.get('/webapp(/*)?', async function(req, res) {
  res.sendFile('/index.html', { root: path.join(__dirname, '../webapp') })
});



/**
 * API
 */
var api_router = require('./api/api');
app.use('/api', api_router)



/**
 * Default 404 handler
 */ 
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});


/**
 * Errors catcher
 */
app.use((err, req, res, next) => {
  if(err.statusCode) {
      res.status(err.statusCode).send(err.message);
  } else {
      console.log(err);
      // console.log(err.stack)
      res.status(500).send('Something unexpected happened');
  }
});


module.exports = app;