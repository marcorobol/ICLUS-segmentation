
var Handle = function (x, y, active=true) {
    this.x = x;
    this.y = y;
    this.active = active;
}

var SegmentFigure = function () {

    const handles = [];

    const nextHandle = new Handle(x=10, y=10, active=false)

    const getHandle = function (x, y) {
        for (var h = 0; h < handles.length; h++) {
            handle = handles[h]
            hx = handle.x
            hy = handle.y
            if (x>hx-5 && x<hx+5 && y>hy-5 && y<hy+5) {
                return handle;
            }
        }
        return null;
    }

    const draw = function (ctx) {

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
        if (nextHandle.active)
            ctx.lineTo(nextHandle.x, nextHandle.y);
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

    }//.bind(this)

    return {handles, nextHandle, getHandle, draw}
}

Vue.component('segmentation-tool', {
    data: () => {
        return {
            ctx: null,
            selection: null,
            drag: false,
            currentHandle: null,
            croppingPath: new Path2D()
        }
    },
    props: ['croppingBounds', 'width', 'height'],
    watch: { 
        croppingBounds: function(croppingBounds, oldCroppingBounds) { // watch it
            // console.log('croppingBounds', croppingBounds)
            
            let b = croppingBounds
            this.croppingPath = new Path2D();
            this.croppingPath.moveTo(b.x+(b.w*b.th), b.y); // top left
            this.croppingPath.quadraticCurveTo(b.x+(b.w/2), b.y+(b.h*b.ch*2), b.x+b.w-(b.w*b.th), b.y) // center top -> top right
            // ctx.lineTo(b.x+b.w-(b.w*b.th), b.y); // top right
            this.croppingPath.lineTo(b.x+b.w, b.y+(b.h*b.bh)); // bottom right
            this.croppingPath.quadraticCurveTo(b.x+(b.w/2), b.y+b.h+(b.h-(b.h*b.bh)), b.x, b.y+(b.h*b.bh)) // bottom left
            this.croppingPath.closePath();
      }
    },
    emits: [ 'update' ],
    mounted () {
        var canvas = this.$el.querySelector("canvas");
        this.ctx = canvas.getContext("2d");
        this.selection = new SegmentFigure();

        // canvas.addEventListener('mousedown', this.mouseDown, false);
        document.addEventListener('mousemove', this.mouseMove, false);
        // document.addEventListener('mouseup', this.mouseUp, false);

        this.draw();
    },
    methods: {
        inCanvas: function (x, y) {
            if (x<=0 || y<=0 || x>=this.width || y>=this.height )
                return false
            else
                return true
        },
        mouseDown: function (e) {
            var pos = this.getCanvasRelativePosition(e)

            if (this.inCanvas(pos.x, pos.y) && this.currentHandle!=null) {
                this.drag = true;
            }
        },
        mouseMove: function (e) {
            var pos = this.getCanvasRelativePosition(e)
            // console.log(pos)

            if (this.drag) {
                if (this.ctx.isPointInPath(this.croppingPath, pos.x, pos.y)) {
                    this.currentHandle.x = pos.x
                    this.currentHandle.y = pos.y
                    this.$emit('update', this.getPoints())
                }
            } else {
                this.currentHandle = this.selection.getHandle(pos.x, pos.y)
                if (this.currentHandle!=null) {
                    this.currentHandle.selected = true
                    this.selection.nextHandle.active = false
                }
                else if ( !this.inCanvas(pos.x, pos.y) || !this.ctx.isPointInPath(this.croppingPath, pos.x, pos.y) ) {
                    this.selection.nextHandle.active = false
                }
                else {
                    if (this.selection.nextHandle.active == false)
                        this.selection.nextHandle.active = true
                    this.selection.nextHandle.x = pos.x
                    this.selection.nextHandle.y = pos.y
                }
            }
            this.draw();
        },
        mouseUp: function (e) {
            pos = this.getCanvasRelativePosition(e);
            if (this.drag) {
                this.drag = false;
            }
            else if (this.ctx.isPointInPath(this.croppingPath, pos.x, pos.y) && this.selection.nextHandle!=null) {
                this.selection.handles.push( new Handle(pos.x, pos.y) );
                this.$emit('update', this.getPoints())
            }
        },
        getCanvasRelativePosition: function (evt) {
            var canvas = this.$el.querySelector("canvas");
            var canvasBounds = canvas.getBoundingClientRect();
                        
            var x = (evt.clientX - canvasBounds.left) * this.width / canvasBounds.width; // mousepos * videoWidth / 880
            var y = (evt.clientY - canvasBounds.top) * this.height / canvasBounds.height; // mousepos * videoHeight / 645
            
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x > this.width) x = this.width;
            if (y > this.height) y = this.height;

            return {x, y};
        },
        getPoints: function () {
            return this.selection.handles.map( (e)=>{return {x:e.x, y:e.y}} )
        },
        clearPoints: function () {
            this.selection.handles.length = 0
        },
        addPoint: function (p) {
            this.selection.handles.push( new Handle(p.x, p.y) )
        },
        addPoints: function (points) {
            for (p of points) {
                this.selection.handles.push( new Handle(p.x, p.y) )
            }
        },
        draw: function (e) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.ctx.strokeStyle = "red";
            this.selection.draw(this.ctx);
            this.ctx.stroke(this.croppingPath)
        }
    },
    // fixed canvas was 1068x800
    template: `
        <div class="positioner" style="z-index: 2; position: absolute; top: 0px;">
            <canvas @mousedown="mouseDown" @mouseup="mouseUp" :width="width" :height="height"></canvas>
        </div>
    `
});
