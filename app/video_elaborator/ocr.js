const { createWorker, PSM, OEM }  = require('tesseract.js');

async function ocr(file) {
  const worker = createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789,.',
    tessedit_pageseg_mode: PSM.PSM_SINGLE_LINE,
    tessedit_ocr_engine_mode: OEM.OEM_LSTM_ONLY,
    user_defined_dpi: '70'
  });
  var { data: { text } } = await worker.recognize(file);
  text = text.trim().split(' ')[0];
  if ( text.substring(text.length-1) == '.' || text.substring(text.length-1) == ',' )
    text = text.substr(0, text.length-1)
  
  // console.log('Ocr read: ' + text);
  
  await worker.terminate();
  return text;
};

// (async () => {
//   var text = await ocr('./unzipped/1416/raw/video_1416_1_D.png');
//   var text = await ocr('./unzipped/1417/raw/video_1417_1_D.png');
// })();

// (async () => {
//   var text = await ocr('./crops/ref/1081_0.png');
//   console.log(text)
  
//   // var text = await ocr('./crops/1047_4_7.png');
//   // console.log(text)
// })();

module.exports = ocr;
