const fs = require('fs')
const path = require('path');
const { createCanvas, loadImage } = require('canvas')



function createCroppingMask(maskPath, dimensions = {width, height}, bounds = {x,w,th,y,h,ch,bh})  {
  
  var canvas = createCanvas(parseInt(dimensions.width), parseInt(dimensions.height));
  const ctx = canvas.getContext('2d');
  
  // Fill everything black
  ctx.save();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // ctx.scale(dimensions.width/1068, dimensions.width/1068); //dimensions.height/800);
  // Draw cropping mask transparent
  // ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(bounds.x+(bounds.w*bounds.th), bounds.y); // top left
  ctx.quadraticCurveTo(bounds.x+(bounds.w/2), bounds.y+(bounds.h*bounds.ch*2), bounds.x+bounds.w-(bounds.w*bounds.th), bounds.y) // center top -> top right
  // ctx.lineTo(b.x+b.w-(b.w*b.th), b.y); // top right
  ctx.lineTo(bounds.x+bounds.w, bounds.y+(bounds.h*bounds.bh)); // bottom right
  ctx.quadraticCurveTo(bounds.x+(bounds.w/2), bounds.y+bounds.h+(bounds.h-(bounds.h*bounds.bh)), bounds.x, bounds.y+(bounds.h*bounds.bh)) // bottom left
  ctx.closePath();
  ctx.globalCompositeOperation = "destination-out";  // will "punch-out" background
  ctx.fill();
  ctx.restore();

  if (!fs.existsSync(path.dirname(maskPath)))
    fs.mkdirSync(path.dirname(maskPath))
  fs.writeFileSync(maskPath, canvas.toBuffer('image/png'));
  
};



module.exports = createCroppingMask;
