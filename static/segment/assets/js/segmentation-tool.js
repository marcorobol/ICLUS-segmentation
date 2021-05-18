
var Handle = function (x, y, active=true) {
    this.x = x;
    this.y = y;
    this.active = active;
}

var SelectionFigure = function () {

    const handles = [];

    const nextHandle = new Handle(x=10, y=10, active=false)

    const getHandle = function (x, y) {
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
            canvas: null,
            ctx: null,
            selection: null,
            drag: false,
            currentHandle: null
        }
    },
    mounted () {
        canvas = this.canvas = this.$el.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.selection = new SelectionFigure();
        
        // canvas.addEventListener('mousedown', this.mouseDown, false);
        document.addEventListener('mousemove', this.mouseMove, false);
        // document.addEventListener('mouseup', this.mouseUp, false);

        this.draw();
    },
    methods: {
        inCanvas: function (x, y) {
            if (x<=0 || y<=0 || x>=this.canvas.width || y>=this.canvas.height )
                return false
            else
                return true
        },
        mouseDown: function (e) {
            var pos = this.getCanvasRelativePosition(e.clientX,e.clientY)

            if (this.inCanvas(pos.x, pos.y) && this.currentHandle!=null) {
                this.drag = true;
            }
        },
        mouseMove: function (e) {
            var pos = this.getCanvasRelativePosition(e.clientX,e.clientY)

            if (this.drag) {
                this.currentHandle.x = pos.x
                this.currentHandle.y = pos.y
            } else {
                this.currentHandle = this.selection.getHandle(pos.x, pos.y)
                if (this.currentHandle!=null) {
                    this.currentHandle.selected = true
                    this.selection.nextHandle.active = false
                }
                else if ( !this.inCanvas(pos.x, pos.y) ) {
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
            pos = this.getCanvasRelativePosition(e.clientX,e.clientY);
            if (this.drag) {
                this.drag = false;
            }
            else if (this.selection.nextHandle!=null) {
                this.selection.handles.push( new Handle(pos.x, pos.y) );
            }
        },
        getCanvasRelativePosition: function (x, y) {
            // console.log(x)
            const canvasWrapper = this.$el;
            var wrapperBounds = canvasWrapper.getBoundingClientRect();
            var canvasBounds = this.canvas.getBoundingClientRect();
            // console.log(canvasBounds.left)
            var x = this.canvas.width / wrapperBounds.width * (x - canvasBounds.left) ;
            var y = this.canvas.height / wrapperBounds.height * (y - canvasBounds.top) ;
            var w = this.canvas.width;
            var h = this.canvas.height;
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x > w) x = w;
            if (y > h) y = h;
            return {
                x: x,
                y: y,
            };
        },
        getPoints: function () {
            this.selection.handles.map( (e)=>{return {x:e.x, y:e.y}} )
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
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.selection.draw(this.ctx);
        }
    },
    template: `
        <div class="positioner" style="z-index: 2; position: absolute; top: 0px;">
            <canvas @mousedown="mouseDown" @mouseup="mouseUp" width="1068" height="800"></canvas>
        </div>
    `
});
