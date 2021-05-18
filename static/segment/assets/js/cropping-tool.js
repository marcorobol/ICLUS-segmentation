

var SelectionBox = function(wrapper,initialBounds={}) {

    if(typeof wrapper==="undefined" || wrapper==null){
        console.error("no wrapper specified")
        return;
    }

    var canvasWrapper = wrapper; 
    var canvas = wrapper.querySelector('canvas')
    var ctx = canvas.getContext("2d");

    var Handle = function (figure,params) {
        for (const property in params) {
            this[property] = params[property];
        }

        this.inRange = function (x, y,range) {
            var p=this.getPosition();
            var rad= (this.size / 2)+range;
            return x>p.x-rad && x<p.x+rad && y>p.y-rad && y<p.y+rad
        }

        this.getPosition = function () {
            var b=figure.bounds;
            if(figure.movingBounds!=null){
                b=figure.movingBounds;
            }
            return this.position(b);
        }

        this.move = function (dx, dy) {
            this.doMove(figure,dx,dy)
        }

    }


    var SelectionFigure = function () {

        var figure = this;

        this.movingBounds = null;

        this.bounds = Object.assign({
            x : canvas.width*0.1,
            y : canvas.height*0.1,
            w : canvas.width-(canvas.width*0.2),
            h : canvas.height-(canvas.height*0.2),
            th: 0.35,
            bh: 0.80,
            ch: 0.10,
        }, initialBounds);
        if(this.bounds.x+this.bounds.w>canvas.width){
        	this.bounds.w=canvas.width-this.bounds.x-5;
        }
        if(this.bounds.y+this.bounds.h>canvas.height){
        	this.bounds.h=canvas.height-this.bounds.y-5;
        }
        
        var moveBoundHandle = function(f,dx,changeXOrigin,dy,changeYOrigin){
            if(f.bounds.w-dx<10){
                dx=f.bounds.w-10;
            }
            if(f.bounds.h-dy<10){
                dy=f.bounds.h-10;
            }
            if(changeXOrigin){
                f.movingBounds.x=f.bounds.x+dx;
            }
            if(changeYOrigin){
                f.movingBounds.y=f.bounds.y+dy;
            }
            f.movingBounds.w=f.bounds.w-dx;
            f.movingBounds.h=f.bounds.h-dy;
        }

        var hSize = 10;
        var handles = [
            new Handle(figure,{
                type:"bounds",
                cursor: "nw-resize",
                size: hSize,
                position: function (b) { return { x: b.x, y: b.y }},
                doMove: function (f,dx, dy) { moveBoundHandle(f,dx,true,dy,true) },
            }),
            new Handle(figure,{ // nord rosso
                type:"bounds",
                cursor: "n-resize",
                size: hSize,
                position: function (b) { return { x: b.x+(b.w/2), y: b.y } },
                doMove: function (f, dx, dy) { moveBoundHandle(f,0,false,dy,true) },
            }),
            new Handle(figure,{
                type:"bounds",
                cursor: "ne-resize",
                size: hSize,
                position: function (b) { return { x: b.x+b.w, y: b.y } },
                doMove: function (f, dx, dy) { moveBoundHandle(f,-dx,false,dy,true) },
            }),
            new Handle(figure,{
                type:"bounds",
                cursor: "e-resize",
                size: hSize,
                position: function (b) { return { x: b.x+b.w, y: b.y+(b.h/2) } },
                doMove: function (f, dx, dy) { moveBoundHandle(f,-dx,false,0,false) },
            }),
            new Handle(figure,{
                type:"bounds",
                cursor: "se-resize",
                size: hSize,
                position: function (b) { return { x: b.x+b.w, y: b.y+b.h } },
                doMove: function (f, dx, dy) { moveBoundHandle(f,-dx,false,-dy,false) },
            }),
            new Handle(figure,{
                type:"bounds",
                cursor: "s-resize",
                size: hSize,
                position: function (b) { return { x: b.x+(b.w/2), y: b.y+b.h } },
                doMove: function (f, dx, dy) { moveBoundHandle(f,0,false,-dy,false) },
            }),
            new Handle(figure,{
                type:"bounds",
                cursor: "sw-resize",
                size: hSize,
                position: function (b) { return { x: b.x, y: b.y+b.h } },
                doMove: function (f, dx, dy) { moveBoundHandle(f,dx,true,-dy,false) },
            }),
            new Handle(figure,{
                type:"bounds",
                cursor: "e-resize",
                size: hSize,
                position: function (b) { return { x: b.x, y: b.y+(b.h/2) } },
                doMove: function (f, dx, dy) { moveBoundHandle(f,dx,true,0,false) },
            }),
            new Handle(figure,{
                type:"bounds",
                cursor: "all-scroll",
                size: 40,
                position: function (b) { return { x: b.x+(b.w/2), y: b.y+(b.h/2) } },
                doMove: function (f, dx, dy) {
                    if(f.bounds.x+dx<0){
                        dx=-f.bounds.x;
                    }
                    if(f.bounds.x+f.bounds.w+dx>canvas.width){
                        dx=f.bounds.x;
                    }
                    if(f.bounds.y+dy<0){
                        dy=-f.bounds.y;
                    }
                    if(f.bounds.y+f.bounds.h+dy>canvas.height){
                        dy=f.bounds.y;
                    }
                    f.movingBounds.x=f.bounds.x+dx;
                    f.movingBounds.y=f.bounds.y+dy;
                },
            }),
            new Handle(figure,{ // basso destra cono
                type:"mask",
                cursor: "n-resize",
                size: hSize,
                position: function (b) { return { x: b.x+b.w, y: b.y+(b.h*b.bh) } },
                doMove: function (f, dx, dy) { 
                        var sp=f.bounds.y+(f.bounds.h*f.bounds.bh);
                        if(sp+dy<f.bounds.y+10){
                            dy=f.bounds.y+10-sp
                        }
                        if(sp+dy>f.bounds.y+f.bounds.h-10){
                            dy=f.bounds.y+f.bounds.h-10-sp
                        }
                        f.movingBounds.bh=(sp+dy-f.bounds.y)/f.bounds.h;
                },
            }),
            new Handle(figure,{ // basso sinistra cono
                type:"mask",
                cursor: "n-resize",
                size: hSize,
                position: function (b) { return { x: b.x, y: b.y+(b.h*b.bh) } },
                doMove: function (f, dx, dy) {
                    var sp=f.bounds.y+(f.bounds.h*f.bounds.bh);
                    if(sp+dy<f.bounds.y+10){
                        dy=f.bounds.y+10-sp
                    }
                    if(sp+dy>f.bounds.y+f.bounds.h-10){
                        dy=f.bounds.y+f.bounds.h-10-sp
                    }
                    f.movingBounds.bh=(sp+dy-f.bounds.y)/f.bounds.h;
                },
            }),
            new Handle(figure,{
                type:"mask",
                cursor: "e-resize",
                size: hSize,
                position: function (b) { return { x: b.x+(b.w*b.th), y: b.y} },
                doMove: function (f, dx, dy) {
                    var sp=f.bounds.x+(f.bounds.w*f.bounds.th);
                    if(sp+dx<f.bounds.x+10){
                        dx=f.bounds.x+10-sp
                    }
                    if(sp+dx>f.bounds.x+(f.bounds.w/2)-10){
                        dx=(f.bounds.x+(f.bounds.w/2)-10)-sp
                    }
                    var per=(sp+dx-f.bounds.x)/f.bounds.w;
                    f.movingBounds.th=per;
                },
            }),
            new Handle(figure,{
                type:"mask",
                cursor: "e-resize",
                size: hSize,
                position: function (b) { return { x: b.x+b.w-(b.w*b.th), y: b.y} },
                doMove: function (f, dx, dy) {
                    var sp=f.bounds.x+f.bounds.w-(f.bounds.w*f.bounds.th);
                    if(sp+dx>f.bounds.x+f.bounds.w-10){
                        dx=f.bounds.x+f.bounds.w-10-sp
                    }
                    if(sp+dx<f.bounds.x+(f.bounds.w/2)+10){
                        dx=(f.bounds.x+(f.bounds.w/2)+10)-sp
                    }
                    var per=Math.abs(((sp+dx-f.bounds.x)/f.bounds.w)-1)
                    f.movingBounds.th=per;
                },
            }),
            new Handle(figure,{ // centro alto verde
                type:"mask",
                cursor: "s-resize",
                size: hSize,
                position: function (b) { return { x: b.x+(b.w/2), y: b.y + b.h*b.ch } },
                doMove: function (f, dx, dy) {
                    var sp=f.bounds.y+(f.bounds.h*f.bounds.ch);
                    if(sp+dy<f.bounds.y+10){
                        dy=f.bounds.y+10-sp
                    }
                    if(sp+dy>f.bounds.y+f.bounds.h-10){
                        dy=f.bounds.y+f.bounds.h-10-sp
                    }
                    f.movingBounds.ch=(sp+dy-f.bounds.y)/f.bounds.h;
                },
            })
        ];

        this.getHandle = function (x, y,range) {
            for (var h = 0; h < handles.length; h++) {
                if (handles[h].inRange(x, y,range)) {
                    return handles[h];
                }
            }
            return null;
        }

        this.draw = function (ctx) {
            var b = this.bounds;
            if(this.movingBounds!=null){
                b = this.movingBounds;
            }

            ctx.save();
                ctx.strokeStyle = "#FF0000BB";
                ctx.setLineDash([2,2]);
                ctx.beginPath();
                ctx.rect(b.x, b.y, b.w, b.h);
                ctx.stroke();
            ctx.restore();
            ctx.save();
                ctx.strokeStyle = "#00FF00BB";
                ctx.fillStyle = '#00FF0022';
                ctx.beginPath();
                ctx.moveTo(b.x+(b.w*b.th), b.y); // top left
                ctx.quadraticCurveTo(b.x+(b.w/2), b.y+(b.h*b.ch*2), b.x+b.w-(b.w*b.th), b.y) // center top -> top right
                // ctx.lineTo(b.x+b.w-(b.w*b.th), b.y); // top right
                ctx.lineTo(b.x+b.w, b.y+(b.h*b.bh)); // bottom right
                ctx.quadraticCurveTo(b.x+(b.w/2), b.y+b.h+(b.h-(b.h*b.bh)), b.x, b.y+(b.h*b.bh)) // bottom left
                ctx.closePath();
                ctx.stroke(); 
                ctx.fill();
            ctx.restore();
            for (var i = 0; i < handles.length; i++) {
                var h = handles[i];
                var p = h.getPosition();
                if(h.type=="bounds"){
                    ctx.fillStyle = '#FF0000FF';
                }else{
                    ctx.fillStyle = '#00FF00FF';
                }
                ctx.fillRect(p.x - (h.size / 2), p.y - (h.size / 2), h.size, h.size);
            }

        }.bind(this)

        this.startMove = function () {
            this.movingBounds=Object.assign({}, this.bounds)
        }.bind(this);

        this.endMove = function () {
            if(this.movingBounds!=null){
                this.bounds=Object.assign({}, this.movingBounds);
                this.movingBounds=null;
            }
        }.bind(this);

    }

    var selection = new SelectionFigure();


    var drag = false;
    var currentHandle = null;


    var initalTouchPos = null;

    var touchStart = function (e) {
        initalTouchPos = getCanvasRelativePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
        updateHandle(initalTouchPos.x, initalTouchPos.y, 20,false);
        startMove();
        canvas.style.border="5px solid "+ (currentHandle != null ? "green" : "blue");
    }
    
    var touchMove = function (e) {
        if (drag) {
            canvas.style.border="5px solid gold";
            dx = 0;
            dy = 0;
            var touchPosition = getCanvasRelativePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
            dx = touchPosition.x - initalTouchPos.x;
            dy = touchPosition.y - initalTouchPos.y;
            move(dx, dy)
        }
    }

    var touchEnd = function (e) {
        endMove();
        initalTouchPos=null;
        canvas.style.border="5px solid red";
    }


    var initalMousePos = null;
    
    function mouseDown(e) {
        
        initalMousePos=getCanvasRelativePosition(e.clientX,e.clientY);
        startMove();
    }

    function mouseMove(e) {
        var pos =getCanvasRelativePosition(e.clientX,e.clientY)
        if (drag) {
            var dx = pos.x - initalMousePos.x;
            var dy = pos.y - initalMousePos.y;
            move(dx, dy)
        } else {
            updateHandle(pos.x, pos.y);
        }
    }

    function mouseUp(e) {
        initalMousePos=null;
        endMove();
    }

    var startMove = function (){
        drag = true;
        selection.startMove();
    }

    var endMove = function (){
        drag = false;
        selection.endMove();
    }

    var move = function (dx, dy) {
        if (currentHandle != null) {
            currentHandle.move(dx,dy);
        }
        draw();
    }

    var updateHandle = function (x, y, range=0, updateCursor=true) {
        var handle = selection.getHandle(x, y,range);
        if (currentHandle == handle) {
            return;
        }
        canvas.style.cursor="default";
        currentHandle = handle;

        if (currentHandle != null && updateCursor) {
            var cursor = handle.cursor;
            if (cursor != undefined && cursor != null) {
                canvas.style.cursor=cursor;
            }
        }
    }

    canvas.addEventListener('touchstart', function () { event.preventDefault(); touchStart(event) }, false);
    canvas.addEventListener('touchmove', function () { event.preventDefault(); touchMove(event) }, false);
    document.addEventListener('touchend', function () { event.preventDefault(); touchEnd(event) }, false);
    canvas.addEventListener('mousedown', mouseDown, false);
    document.addEventListener('mousemove', mouseMove, false);
    document.addEventListener('mouseup', mouseUp, false);

    var getCanvasRelativePosition = function (x, y) {
        
        var wrapperBounds = canvasWrapper.getBoundingClientRect();
        var canvasBounds = canvas.getBoundingClientRect();
        
        var x = canvas.width / wrapperBounds.width * (x - canvasBounds.left);
        var y = canvas.height / wrapperBounds.height * (y - canvasBounds.top);
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
        // $(".log").html("x:"+b.x+"<br/>y:"+b.y+"<br/>w:"+b.w+"<br/>h:"+b.h+"<br/>th:"+b.th+"<br/>bh:"+b.bh+"<br/>ch:"+b.ch)
        $("#x")[0].value = b.x
        $("#y")[0].value = b.y
        $("#w")[0].value = b.w
        $("#h")[0].value = b.h
        $("#th")[0].value = b.th
        $("#bh")[0].value = b.bh
        $("#ch")[0].value = b.ch
    }
    draw();
    
    this.getBounds=function(){
    	return Object.assign({}, selection.bounds);
    }.bind(this);
    
    return this;
};




Vue.component('cropping-tool', {
    data: () => {
        return {
            selectionBox: null
        }
    },
    mounted () {
        this.selectionBox = SelectionBox( this.$el );
    },
    methods: {
    },
    template: `
        <div class="positioner" style="z-index: 2; position: absolute; top: 0px;">
            <canvas width="1068" height="800"></canvas>
        </div>
    `
});
