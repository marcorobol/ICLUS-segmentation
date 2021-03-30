var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Video', new Schema({ 
	patientId: String, //"1017"
	operator: String, //"Tiziano Perrone"
	analysisId: String, //1047"
	date: String, //"04/04/2020 00:00"
	areaId: String, //1305
	areaCode: String, //"1"
	profileLabel: String, //"avi880_688"
	profileScannerBrand: String, //"EsaoteMyLab"
	depth: String, //70
	frequency: String, //5
	focalPoint: String, //20
	resolution: String, //66.15384615384615
	nb_frames: String //117
}));