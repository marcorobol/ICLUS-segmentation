const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')



function overlayVideos(background, foreground, overlayed, { trim: {start, duration} } = { trim: {start: null, duration: null} } )  {
  
  // console.log(background)
  // console.log(foreground)
  
  return new Promise( (res) => {
    var command = ffmpeg()
    // First input
    .input(background)

    if(duration!=null && start!=null)
      command.setStartTime(start) //Can be in "HH:MM:SS" format also
             .setDuration(duration);
    
    // Second input
    command.input(foreground)
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
    
    return command
  });
  
};



module.exports = overlayVideos;
