// Clamp number between two values with the following line:
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);


var MaskHandle = function (figure, {type, cursor, size, position, doMove}) {
    var params = {type, cursor, size, position, doMove}
    for (const property in params) {
        this[property] = params[property];
    }

    this.inRange = function (x, y,range) {
        var p = this.getPosition();
        var rad = (size / 2) + range;
        return x>p.x-rad && x<p.x+rad && y>p.y-rad && y<p.y+rad
    }

    this.getPosition = function () {
        var b = figure.movingBounds;
        return position(b);
    }

    this.move = function (dx, dy) {
        doMove(figure,dx,dy)
    }

}

var croppingMaskHandles = function(figure = {bounds, movingBounds}) {
    
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

    return [
        new MaskHandle(figure,{
            type:"bounds",
            cursor: "nw-resize",
            size: hSize,
            position: function (b) { return { x: b.x, y: b.y }},
            doMove: function (f,dx, dy) { moveBoundHandle(f,dx,true,dy,true) },
        }),
        new MaskHandle(figure,{ // nord rosso
            type:"bounds",
            cursor: "n-resize",
            size: hSize,
            position: function (b) { return { x: b.x+(b.w/2), y: b.y } },
            doMove: function (f, dx, dy) { moveBoundHandle(f,0,false,dy,true) },
        }),
        new MaskHandle(figure,{
            type:"bounds",
            cursor: "ne-resize",
            size: hSize,
            position: function (b) { return { x: b.x+b.w, y: b.y } },
            doMove: function (f, dx, dy) { moveBoundHandle(f,-dx,false,dy,true) },
        }),
        new MaskHandle(figure,{
            type:"bounds",
            cursor: "e-resize",
            size: hSize,
            position: function (b) { return { x: b.x+b.w, y: b.y+(b.h/2) } },
            doMove: function (f, dx, dy) { moveBoundHandle(f,-dx,false,0,false) },
        }),
        new MaskHandle(figure,{
            type:"bounds",
            cursor: "se-resize",
            size: hSize,
            position: function (b) { return { x: b.x+b.w, y: b.y+b.h } },
            doMove: function (f, dx, dy) { moveBoundHandle(f,-dx,false,-dy,false) },
        }),
        new MaskHandle(figure,{
            type:"bounds",
            cursor: "s-resize",
            size: hSize,
            position: function (b) { return { x: b.x+(b.w/2), y: b.y+b.h } },
            doMove: function (f, dx, dy) { moveBoundHandle(f,0,false,-dy,false) },
        }),
        new MaskHandle(figure,{
            type:"bounds",
            cursor: "sw-resize",
            size: hSize,
            position: function (b) { return { x: b.x, y: b.y+b.h } },
            doMove: function (f, dx, dy) { moveBoundHandle(f,dx,true,-dy,false) },
        }),
        new MaskHandle(figure,{
            type:"bounds",
            cursor: "e-resize",
            size: hSize,
            position: function (b) { return { x: b.x, y: b.y+(b.h/2) } },
            doMove: function (f, dx, dy) { moveBoundHandle(f,dx,true,0,false) },
        }),
        new MaskHandle(figure,{
            type:"bounds",
            cursor: "all-scroll",
            size: 40,
            position: function (b) { return { x: b.x+(b.w/2), y: b.y+(b.h/2) } },
            doMove: function (f, dx, dy) {
                f.movingBounds.x = Math.max(f.bounds.x+dx, 0)//, width-f.bounds.w);
                f.movingBounds.y = Math.max(f.bounds.y+dy, 0)//, height-f.bounds.h);
            },
        }),
        new MaskHandle(figure,{ // basso destra cono
            type:"mask",
            cursor: "n-resize",
            size: hSize,
            position: function (b) { return { x: b.x+b.w, y: b.y+(b.h*b.bh) } },
            doMove: function (f, dx, dy) { 
                    var sp = f.bounds.y + (f.bounds.h * f.bounds.bh);
                    dy = clamp(dy, f.bounds.y-sp+10, f.bounds.y+f.bounds.h-sp-10);
                    f.movingBounds.bh=(sp+dy-f.bounds.y)/f.bounds.h;
            },
        }),
        new MaskHandle(figure,{ // basso sinistra cono
            type:"mask",
            cursor: "n-resize",
            size: hSize,
            position: function (b) { return { x: b.x, y: b.y+(b.h*b.bh) } },
            doMove: function (f, dx, dy) {
                var sp=f.bounds.y+(f.bounds.h*f.bounds.bh);
                dy = clamp(dy, f.bounds.y-sp+10, f.bounds.y+f.bounds.h-sp-10);
                f.movingBounds.bh=(sp+dy-f.bounds.y)/f.bounds.h;
            },
        }),
        new MaskHandle(figure,{
            type:"mask",
            cursor: "e-resize",
            size: hSize,
            position: function (b) { return { x: b.x+(b.w*b.th), y: b.y} },
            doMove: function (f, dx, dy) {
                var sp=f.bounds.x+(f.bounds.w*f.bounds.th);
                dx = clamp(dx, f.bounds.x+10-sp, f.bounds.x+(f.bounds.w/2)-10-sp)
                f.movingBounds.th = (sp+dx-f.bounds.x)/f.bounds.w;
            },
        }),
        new MaskHandle(figure,{
            type:"mask",
            cursor: "e-resize",
            size: hSize,
            position: function (b) { return { x: b.x+b.w-(b.w*b.th), y: b.y} },
            doMove: function (f, dx, dy) {
                var sp=f.bounds.x+f.bounds.w-(f.bounds.w*f.bounds.th);
                dx = clamp(dx, f.bounds.x+(f.bounds.w/2)+10-sp, f.bounds.x+f.bounds.w-10-sp)
                f.movingBounds.th = Math.abs(((sp+dx-f.bounds.x)/f.bounds.w)-1);
            },
        }),
        new MaskHandle(figure,{ // centro alto verde
            type:"mask",
            cursor: "s-resize",
            size: hSize,
            position: function (b) { return { x: b.x+(b.w/2), y: b.y + b.h*b.ch } },
            doMove: function (f, dx, dy) {
                var sp=f.bounds.y+(f.bounds.h*f.bounds.ch);
                dy = clamp(dy, f.bounds.y+10-sp, f.bounds.y+f.bounds.h-10-sp)
                f.movingBounds.ch=(sp+dy-f.bounds.y)/f.bounds.h;
            },
        })
    ];
}






Vue.component('cropping-tool', {
    data: () => {
        return {
            ctx: null,
            handles: [],
            bounds: {x:null,y:null,w:null,h:null,th:null,bh:null,ch:null},
            movingBounds: {x:null,y:null,w:null,h:null,th:null,bh:null,ch:null}
        }
    },
    props: ['patient_id', 'analysis_id', 'area_code', 'width', 'height'],
    watch: {},
    emits: [ 'bounds-update' ],
    async mounted () {
        
        var wrapper = this.$el
        var canvas = wrapper.querySelector('canvas')
        var ctx = this.ctx = canvas.getContext("2d");

        // initial
        var bounds = this.bounds = {
            x : this.width*0.1,
            y : this.height*0.1,
            w : this.width-(this.width*0.2),
            h : this.height-(this.height*0.2),
            th: 0.35,
            bh: 0.80,
            ch: 0.10,
        }
        // existing
        let response = await fetchCrops(this.analysis_id, this.area_code);
        Object.assign(bounds, (response.length>0 ? response[response.length-1].crop_bounds : {}));
        // oversized
        bounds.w = clamp(bounds.w, 0, this.width - bounds.x - 5);
        bounds.h = clamp(bounds.h, 0, this.height - bounds.y - 5);
        // emits
        this.$emit('bounds-update', bounds)
                
        this.movingBounds = Object.assign({}, bounds);
        
        this.handles = croppingMaskHandles(this)
        


        // mouse down move up
        {
            let drag = false;
            let currentHandle = null;
            let initalMousePos = null;
            
            let mouseDown = (e) => {
                initalMousePos = this.getCanvasRelativePosition(e);
                drag = true;
            }

            let mouseMove = (e) => {
                var pos = this.getCanvasRelativePosition(e)
                if (drag) {
                    var dx = pos.x - initalMousePos.x;
                    var dy = pos.y - initalMousePos.y;
                    if (currentHandle != null) {
                        currentHandle.move(dx,dy);
                    }
                    this.draw();
                } else {
                    // updateHandle(pos.x, pos.y);
                    var handle = this.getHandle(pos.x, pos.y, range=0);
                    if (currentHandle != handle) {
                        canvas.style.cursor = "default";
                        currentHandle = handle;
                        if (currentHandle != null) {
                            let cursor = handle.cursor;
                            if (cursor != undefined && cursor != null) {
                                canvas.style.cursor = cursor;
                            }
                        }
                    }
                }
            }

            let mouseUp = (e) => {
                initalMousePos=null;
                drag = false;
                Object.assign(this.bounds, this.movingBounds);
                this.$emit('bounds-update', this.bounds) //atEndMove(this.bounds)
            }

            canvas.addEventListener('mousedown', mouseDown, false);
            document.addEventListener('mousemove', mouseMove, false);
            document.addEventListener('mouseup', mouseUp, false);
        }
        
    },
    methods: {
        getCanvasRelativePosition: function (evt) {
            var canvas = this.$el.querySelector('canvas')
            var canvasBounds = canvas.getBoundingClientRect();
                        
            var x = (evt.clientX - canvasBounds.left) * this.width / canvasBounds.width; // mousepos * videoWidth / 880
            var y = (evt.clientY - canvasBounds.top) * this.height / canvasBounds.height; // mousepos * videoHeight / 645
            
            x = clamp(x, 0-this.width/4, this.width*5/4)
            y = clamp(y, 0-this.height/4, this.height*5/4)

            return {x, y};
        },
        draw: function () {
            // console.log('cropping-tool.draw() width', this.width)
            // console.log('cropping-tool.draw() movingBounds', this.movingBounds)

            var ctx = this.ctx;
            var handles = this.handles;
            var b = this.movingBounds;

            ctx.clearRect(0, 0, this.width, this.height);
                        
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
    
        },
        getHandle: function (x, y, range) {
            for (var h = 0; h < this.handles.length; h++) {
                if (this.handles[h].inRange(x, y, range)) {
                    return this.handles[h];
                }
            }
            return null;
        }
    },
    async updated () {
        this.$nextTick(async function () {
            // Code that will run only after the
            // entire view has been re-rendered
            
            // reset initial bounds
            this.bounds = {
                x : this.width*0.1,
                y : this.height*0.1,
                w : this.width-(this.width*0.2),
                h : this.height-(this.height*0.2),
                th: 0.35,
                bh: 0.80,
                ch: 0.10,
            }

            // fetch existing bounds
            let response = await fetchCrops(this.analysis_id, this.area_code);
            let existingBounds = (response.length>0 ? response[response.length-1].crop_bounds : {})
            Object.assign(this.bounds, existingBounds);
            Object.assign(this.movingBounds, this.bounds);
            
            this.draw()
        })
    },
    template: `
        <div class="positioner" style="z-index: 2; position: absolute; top: 0px;">
            <canvas :width="width" :height="height"></canvas>
        </div>
    `
});
