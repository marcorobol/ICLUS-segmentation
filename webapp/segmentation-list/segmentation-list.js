
Vue.component('segment-crop', {
    data: () => {
        return {
            canvas: null,
            ctx: null,
            crop: {width:0, height:0, left:0, top:0}
        }
    },
    props: ['imgSrc', 'points'],
    async mounted () {
        var canvas = this.canvas = this.$el.querySelector("canvas")
        // var image = this.image = this.$el.querySelector("img")
        var ctx = this.ctx = canvas.getContext("2d")
        var points = this.points

        let min_top = points.map(p => p.y).reduce( (prev,curr) => (curr<prev?curr:prev), 800 )
        let max_top = points.map(p => p.y).reduce( (prev,curr) => (curr>prev?curr:prev), 0 )
        let min_left = points.map(p => p.x).reduce( (prev,curr) => (curr<prev?curr:prev), 1068 )
        let max_left = points.map(p => p.x).reduce( (prev,curr) => (curr>prev?curr:prev), 0 )
        
        this.crop.top = min_top
        this.crop.height = max_top-min_top
        this.crop.left = min_left
        this.crop.width = max_left-min_left

        // wait all child components to be rendered
        await new Promise( (success) => this.$nextTick(success) );

        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        var image = new Image();
        image.src = this.imgSrc;
        await new Promise( (res,rej) => {image.onload = res} )

        const imageBitmap = await createImageBitmap(image);
        ctx.drawImage(imageBitmap, -this.crop.left, -this.crop.top, 1068, 800)
        
        ctx.save();
        ctx.translate(-this.crop.left, -this.crop.top);
        ctx.strokeStyle = "#00FF00BB";
        ctx.fillStyle = '#00FF0022';
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
        ctx.stroke(); 
        ctx.fill();
        ctx.restore();

    },
    methods: {
    },
    template: `
        <div>
            <canvas
                v-bind:width="crop.width"
                v-bind:height="crop.height"
                style="background-color: red; max-height: 100px; max-max-width: 200px"
            ></canvas>
        </div>
    `
});













globalThis.segmentationList = {

    // props: ['patient_id', 'analysis_id', 'area_code'],

    data: () => {
        return {
            headers: [
                { text: "Segmentation id", value: "segmentation_id", options:[], select: [] },
                { text: "Analysis", value: "analysis_id", options:[], select: [] },
                { text: "Area", value: "area_code", options:[], select: [] },
                { text: "Timestamp", value: "timestamp", options:[], select: [] },
                { text: "Points", value: "points", options:[], select: [], filterName: "points"  },
                { text: "Rate/label", value: "rate", options:[], select: [], filterName: "ratingLabel" }
            ],
            
            roundDepthBy: "null",
            roundFrequencyBy: "null",
            roundPixelDensityBy: "null",

            videos: [],
            query: ""
        }
    },

    watch: {
        $route: {
            handler: function(to, from) {
                // console.log(to)
            },
            // immediate: true
        }
    },

    mounted: async function () {
        
        for (let {text,value,options,select,filterName} of this.headers) {
            let stats = await this.callStats( groupBy= [value] )
            for (entry of stats) {
                options.push({id: entry[value]})
            }
        }
        
        // Pull from browser query into filters
        console.log('pulling from browser queries')
        for (let {value,options,select} of this.headers) {
            
            let queryValues = this.$route.query[value]
            
            for (string of ( queryValues ? ( Array.isArray(queryValues) ? queryValues : [queryValues] ) : [] ) ) {
                // let found = options.find( opt => ''+opt.id == ''+string )
                // if ( found!=undefined && !select.includes(found.id) )
                //     select.push(found.id)
                if(parseInt(string)!=NaN)
                    select.push(parseInt(string))
                else
                    select.push(string)
            }
            
        }

        this.refresh()
    },

    filters: {
        ratingLabel: function(id) {
            return {
                0: 'Rated 0',
                1: 'Rated 1',
                2: 'Rated 2',
                3: 'Rated 3',
                4: 'Consolidation',
                5: 'Pleural Line',
                6: 'Pleural Effusion',
                7: 'Vertical Artifact',
                null: 'Not labelled'
            }[id]
        },
        listOfIds: function(list) {
            return (list?list.map( e => (e==null?'null':e) ).join(', '):'')
        },
        points: function(list) {
            return (list?list.map( e => JSON.stringify(e) ).join(', '):'')
        }
    },

    methods: {

        textIntoSelect: function (text, {options,select}=column) {

            // clear current select
            select.splice(0);
            
            // loop over keys
            if (text)
                for (string of text.replaceAll(' ','').split(',')) {
                    let found = options.find( opt => ''+opt.id == ''+string )
                    if ( found!=undefined && !select.includes(found.id) )
                        select.push(found.id)
                }
            
            // refresh view
            this.refresh()
        },

        lookupIntoOption: function(string, options) {
            return options.find( opt => (''+opt.id).replaceAll(' ','') == (''+string).replaceAll(' ','') )
        },

        selectedWhereParams: function (headers) {
            const queryParams = []
            for ({text,value,options,select} of headers) {
                if(!select)
                    continue
                const whereOR = []
                for (sel of select) {
                    if(sel=="null" || sel==null)
                        whereOR.push(value+"%20IS%20NULL");
                    else if(sel!="any")
                        if(value=="area_code" || value=="profile_scanner_brand")
                            whereOR.push(value+"='"+sel+"'");
                        else
                            whereOR.push(value+"="+sel);
                }
                if(whereOR.length>0)
                queryParams.push(whereOR.join(" OR "));
            }
            return queryParams;
        },
        
        /**
         * This function refresh the list
         */
        refresh: async function () {
            
            /**
             * Refresh headers statistics!
             */
            for (let {text,value,options,select,filterName} of this.headers) {
                let stats = await this.callStats( groupBy = [value], where = this.selectedWhereParams( this.headers.filter(h => h.value!=value) ) )
                for (opt of options) {
                    let s = stats.find( s => s[value] == opt.id )
                    if ( s ) {
                        opt.counter = s.number_of_segmentations
                    }
                    else {
                        opt.counter = 0
                    }
                }
            }
            
            /**
             * Calling videos APIs
             */
            var queryParams = []

            // queryParams.push("where=depth%20IS%20NOT%20NULL")
            // queryParams.push("where=frames%20IS%20NOT%20NULL")
            
            for (field of this.selectedWhereParams(this.headers)) {
                queryParams.push('where='+field)
            }
            
            // Push to browser query
            console.log("pushing to router")
            this.$router.push( { query: this.headers.reduce( (query, column) => {query[column.value] = column.select.map(e=>(e==null?'null':e)); return query}, {} ) } );
            // console.log(this.$route.query)
            

            let query = this.query = '../api/segmentations?' + queryParams.join("&");
            
            // fetch('../api/videos?where=depth%20IS%20NOT%20NULL')
            fetch(query)
            .then((resp) => resp.json()) // Transform the data into json
            .then( (data) => { // Here you get the data to modify as you please
                
                this.videos.splice(0);
                this.videos.push.apply( this.videos, data.map( entry => entry ) );
                
            })
            .catch( error => console.error(error) );// If there is any error you will catch them here
            
        },

        callStats: async function (groupBy=[], where=[]) {
  
            if(groupBy.length==0) return []

            let queryParams = []
          
            for (field of groupBy) {
                if(field=="points") return []
                queryParams.push('groupBy='+field)
            }
            for (field of where) {
                queryParams.push('where='+field)
            }
            
            // let roundDepthBy = $('#roundDepthBy')[0].value
            // let roundFrequencyBy = $('#roundFrequencyBy')[0].value
            // let roundPixelDensityBy = $('#roundPixelDensityBy')[0].value
          
            // if (this.roundDepthBy!="null") queries.push('roundDepthBy='+this.roundDepthBy)
            // if (this.roundFrequencyBy!="null") queries.push('roundFrequencyBy='+this.roundFrequencyBy)
            // if (this.roundPixelDensityBy!="null") queries.push('roundPixelDensityBy='+this.roundPixelDensityBy)
          
            return query_res = await fetch('../api/segmentations/stats?'+queryParams.join('&'))
              .then((resp) => resp.json()) // Transform the data into json
              .catch( error => console.error(error) ); // If there is any error you will catch them here
        },

        getFilterOfHeader: function (header) {
            let filter = this.$options.filters[header.filterName]
            if ( filter != undefined )
                return filter
            else // default filter
                return (id) => (id!=null?id:'null')
        }

    },
    template: `
        <div>
        <v-container fluid>

            <v-btn type="button" v-on:click="refresh()">Refresh</v-btn>
            <v-btn type="button" :href="query" :download="query" target="_blank">Get JSON data</v-btn>

            <template>
            <v-data-table
                :headers="headers"
                :items="videos"
                :items-per-page="5"
                item-key="segmentation_id"
                class="elevation-1"
                multi-sort
                show-group-by
                :footer-props="{
                    showFirstLastPage: true,
                    firstIcon: 'mdi-arrow-collapse-left',
                    lastIcon: 'mdi-arrow-collapse-right',
                    prevIcon: 'mdi-minus',
                    nextIcon: 'mdi-plus',
                    'items-per-page-options': [5, 10, 50, 100, 500, -1]
                }"
            >
                <template v-slot:body.prepend="{ headers }">
                    <tr>
                        <td v-for="column in headers" :colspan="1">
                            <v-select
                                v-if="column.text"
                                v-model="column.select"
                                :items="column.hideEmptyOptions?column.options.filter(o=>o.counter>0||column.select.includes(o.id)):column.options"
                                item-value="id"
                                :item-text="opt => getFilterOfHeader(column)(opt.id) + ' - ' + opt.counter + ' videos'"
                                :label="column.text"
                                multiple
                                chips
                                v-on:change="refresh"
                            >
                                <template v-slot:item_not_used_template="{ parent, item, on, attrs }">
                                    <v-list-item
                                        ripple
                                        @click="on.click"
                                    >
                                        <v-list-item-action>
                                            <v-icon v-if="attrs.inputValue">mdi-checkbox-marked</v-icon>
                                            <v-icon v-else>mdi-checkbox-blank-outline</v-icon>
                                        </v-list-item-action>
                                        <v-list-item-content>
                                            <v-list-item-title>
                                                {{ item.label }} {{ parent.props }}
                                            </v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>

                                <template v-slot:prepend-item>
                                    <v-list-item
                                    >
                                        <v-list-item-action>
                                            Filters:
                                        </v-list-item-action>
                                        <v-list-item-content>
                                            <v-textarea
                                                name="input-7-1"
                                                v-bind:value="column.select | listOfIds"
                                                v-on:change="textIntoSelect($event, column)"
                                                hint="Coma separated ids"
                                                clearable
                                                clear-icon="mdi-close-circle"
                                                rows="1"
                                                auto-grow
                                            ></v-textarea>
                                        </v-list-item-content>
                                    </v-list-item>
                                    <v-divider class="mt-2"></v-divider>

                                    <v-list-item>
                                        <v-list-item-action>
                                            <v-switch
                                                v-model="column.hideEmptyOptions"
                                            ></v-switch>
                                        </v-list-item-action>
                                        <v-list-item-content>
                                            <v-list-item-title>
                                                Hide empty options
                                            </v-list-item-title>
                                        </v-list-item-content>
                                    </v-list-item>

                                    <v-divider class="mt-2"></v-divider>
                                </template>
                            </v-select>
                        </td>
                    </tr>
                </template>
                

                <template v-slot:item.analysis_id="{ item }">
                    <router-link v-bind:to=" '/video-list?analysis_id='+ item.analysis_id +'&area_code='+ item.area_code ">
                        {{ item.analysis_id }}
                    </router-link>
                </template>
                
                <template v-slot:item.points="{ item }">
                    <router-link
                        v-bind:to=" '/segment?analysis_id='+ item.analysis_id +'&area_code='+ item.area_code +'&step=3' "
                    >
                        <segment-crop
                            v-bind:img-src=" '../png/'+ item.analysis_id +'_'+ item.area_code +'_'+ item.timestamp +'.png'"
                            v-bind:points="item.points"
                        ></segment-crop>
                    </router-link>
                </template>

                <template v-slot:item.rating_operator="{ item }">
                    {{ item.rating_operator | ratingLabel }}
                </template>

            </v-data-table>
            </template>


        </v-container>
        </div>
    `
}
Vue.component('segmentation-list', segmentationList)
