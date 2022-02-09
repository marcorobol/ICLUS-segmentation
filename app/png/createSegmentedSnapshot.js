const fs = require('fs')
const path = require('path');
const { createCanvas, loadImage } = require('canvas')



async function createSegmentedSnapshot(srcSnapshotPath, destSegmentedPath, points)  {
  
  var img = await loadImage(srcSnapshotPath)
  // Initialiaze a new Canvas with the same dimensions
  // as the image, and get a 2D drawing context for it.

  var canvas = createCanvas(img.width, img.height);
  var ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);
  ctx.fillStyle = "black";
  
  // ctx.scale(img.width/1068, img.height/800); //img.height/800);
  ctx.beginPath();
  if (points.length>0) {
      ctx.moveTo(points[0].x, points[0].y);
      for (var h = 0; h < points.length-1; h++) {
          var current = points[h]
          var next = points[h+1]
          ctx.lineTo(next.x, next.y);
      }
  }
  ctx.closePath();

  ctx.globalCompositeOperation = "destination-in";  // will "punch-out" background
  ctx.fill();
  ctx.restore();

  if (!fs.existsSync(path.dirname(destSegmentedPath)))
    fs.mkdirSync(path.dirname(destSegmentedPath))
  fs.writeFileSync(destSegmentedPath, canvas.toBuffer('image/png'));
  
};



module.exports = createSegmentedSnapshot;
