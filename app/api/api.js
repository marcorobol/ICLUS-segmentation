require('dotenv').config()
var express = require('express')
var router = express.Router()




/**
 * API
 */
 router.use('/', async function(req, res, next) {
  // console.log('API '+req.method+' request on ' + req.path)
  next();
})

var api_segmentations = require('./segmentations');
router.use('/segmentations', api_segmentations)

var api_stats = require('./stats');
router.use('/stats', api_stats)

var api_stats_federico = require('./stats_federico');
router.use('/stats_federico', api_stats_federico)

var api_videos_federico = require('./videos_federico');
router.use('/videos_federico/', api_videos_federico)

var api_videos = require('./videos');
router.use('/videos/', api_videos)



module.exports = router;
