
var SegmentationTool = function(wrapper) {

    if(typeof wrapper==="undefined" || wrapper==null){
        console.error("no wrapper specified")
        return;
    }

    var canvasWrapper = wrapper; 
    var canvas = wrapper.querySelector('canvas')
    var ctx = canvas.getContext("2d");

    var Handle = function (x, y) {
        this.x = x;
        this.y = y;
    }

    var SelectionFigure = function () {

        this.handles = [];
        handles = this.handles
        this.nextHandle = new Handle(x=10, y=10)


        this.getHandle = function (x, y) {
            for (var h = 0; h < handles.length; h++) {
                handle = handles[h]
                hx = handle.x
                hy = handle.y
                if (x>hx-10 && x<hx+10 && y>hy-10 && y<hy+10) {
                    return handle;
                }
            }
            return null;
        }

        this.draw = function (ctx) {

            ctx.save();
            ctx.strokeStyle = "#00FF00BB";
            ctx.fillStyle = '#00FF0022';
            ctx.beginPath();
            if (handles.length>0) {
                ctx.moveTo(handles[0].x, handles[0].y);
                for (var h = 0; h < handles.length-1; h++) {
                    var current = handles[h]
                    var next = handles[h+1]
                    ctx.lineTo(next.x, next.y);
                }
            }
            if (this.nextHandle)
                ctx.lineTo(this.nextHandle.x, this.nextHandle.y);
            ctx.closePath();
            ctx.stroke(); 
            ctx.fill();
            ctx.restore();

            for (var i = 0; i < handles.length; i++) {
                var h = handles[i];
                var x = h.x;
                var y = h.y;
                var size = 10
                if(h.type=="bounds"){
                    ctx.fillStyle = '#FF0000FF';
                }else{
                    ctx.fillStyle = '#00FF00FF';
                }
                ctx.fillRect(x - (size / 2), y - (size / 2), size, size);
            }

        }.bind(this)

    }

    var selection = new SelectionFigure();

    var drag = false;
    var currentHandle = null;
    
    function mouseDown(e) {
        if (currentHandle)
            drag = true;
    }

    function mouseMove(e) {
        var pos = getCanvasRelativePosition(e.clientX,e.clientY)

        if (drag) {
            currentHandle.x = pos.x
            currentHandle.y = pos.y
        } else {
            currentHandle = selection.getHandle(pos.x, pos.y)
            if (currentHandle!=null) {
                currentHandle.selected = true
                selection.nextHandle = null
            }
            else if (pos.x<=0 || pos.y<=0 || pos.x>=canvas.width || pos.y>=canvas.height ) {
                selection.nextHandle = null
            }
            else {
                if (selection.nextHandle==null)
                    selection.nextHandle = new Handle(pos.x, pos.y)
                selection.nextHandle.x = pos.x
                selection.nextHandle.y = pos.y
            }
        }
        draw();
    }

    function mouseUp(e) {
        pos = getCanvasRelativePosition(e.clientX,e.clientY);
        if (drag) {
            drag = false;
        }
        else if (selection.nextHandle!=null) {
            selection.handles.push( new Handle(pos.x, pos.y) );
        }
    }

    canvas.addEventListener('mousedown', mouseDown, false);
    document.addEventListener('mousemove', mouseMove, false);
    document.addEventListener('mouseup', mouseUp, false);

    var inCanvas = function (x, y) {
        if (x<=0 || y<=0 || x>=canvas.width || y>=canvas.height )
            return false
        else
            true
    }
    var getCanvasRelativePosition = function (x, y) {
        // console.log(x)
        var wrapperBounds= canvasWrapper.getBoundingClientRect();
        var canvasBounds = canvas.getBoundingClientRect();
        // console.log(canvasBounds.left)
        var x = canvas.width / wrapperBounds.width * (x - canvasBounds.left) ;
        var y = canvas.height / wrapperBounds.height * (y - canvasBounds.top) ;
        var w = canvas.width;
        var h = canvas.height;
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > w) x = w;
        if (y > h) y = h;
        return {
            x: x,
            y: y,
        };
    };

    var draw = function (e) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        selection.draw(ctx);
        var b=selection.bounds;
        if(selection.movingBounds!=null){
            b=selection.movingBounds;
        }
        // $("#x")[0].value = b.x
        // $("#y")[0].value = b.y
        // $("#w")[0].value = b.w
        // $("#h")[0].value = b.h
        // $("#th")[0].value = b.th
        // $("#bh")[0].value = b.bh
        // $("#ch")[0].value = b.ch
    }
    draw();
        
    return {
        getPoints: () => selection.handles.map( (e)=>{return {x:e.x, y:e.y}} ),
        clearPoints: () => selection.handles.length = 0,
        addPoint: (p) => selection.handles.push( new Handle(p.x, p.y) ),
        addPoints: (points) => {
            for (p of points) {
                selection.handles.push( new Handle(p.x, p.y) )
            }
        },
        draw: draw
    };
};