const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')



async function overlayVideos(background, foreground, overlayed)  {
  
  console.log(background)
  console.log(foreground)

  let status = await new Promise( (res) => ffmpeg()
    // First input
    .input(background)
    // Second input
    .input(foreground)
    // Filters
    .complexFilter(
      [
        // Overlay 'green' onto 'padded', moving it to the center,
        // and name output 'redgreen'
        {
          filter: 'overlay', options: { x: 0, y: 0 },
          inputs: ['0:v', '1:v'], outputs: 'overlayed'
        }
      ],
      // Output
      'overlayed'
    )
    .on('error', function(err) {
      console.log(err);
    })
    .on('start', function(commandLine) {
      console.log('Spawned Ffmpeg with command: ' + commandLine);
    })
    .on('end', res)
    .save(overlayed)
  );
  
};



module.exports = overlayVideos;
