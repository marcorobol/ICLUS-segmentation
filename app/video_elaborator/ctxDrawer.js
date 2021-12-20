function ctxDrawer( ctx, {width, height, left, top} ) {

    // Set style
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';
    ctx.font = 'bold 12pt Menlo'

    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left+width, top);
    ctx.lineTo(left+width, top+height);
    ctx.lineTo(left, top+height);
    ctx.lineTo(left, top);
    ctx.stroke();

}

module.exports = ctxDrawer;