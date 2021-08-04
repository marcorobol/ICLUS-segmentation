

globalThis.videoList = {

    // props: ['patient_id', 'analysis_id', 'area_code'],

    data: () => {
        return {
            headers: [
                { text: "Operator", value: "operator_id", options:[], select: [1001], filterName: "operatorName" },
                { text: "Patient", value: "patient_id", options:[], select: [] },
                { text: "Analysis", value: "analysis_id", options:[], select: [] },
                { text: "Area", value: "file_area_code", options:[], select: [] },
                { text: "Status", value: "analysis_status", options:[], select: [], filterName: "covidStatus" },
                { text: "Rating", value: "rating_operator", options:[], select: [], filterName: "ratingLabel" },
                { text: "Depth", value: "depth", options:[], select: [] },
                { text: "Frequency", value: "frequency", options:[], select: [] },
                { text: "Focal point", value: "focal_point", options:[], select: [] },
                { text: "Pixel density", value: "pixel_density", options:[], select: [] }
            ],
            
            roundDepthBy: "null",
            roundFrequencyBy: "null",
            roundPixelDensityBy: "null",

            videos: []
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
        for (let {value,options,select} of this.headers) {
            
            let strings = this.$route.query[value]
            if(!Array.isArray(strings))
                strings = [strings]
            
            if (strings)
                for (string of strings) {
                    let found = options.find( opt => ''+opt.id == ''+string )
                    if ( found!=undefined && !select.includes(found.id) )
                        select.push(found.id)
                }
            
        }

        this.refresh()
    },

    filters: {
        operatorName: function(id) {
            const statusMap = {
                1001: 'Andrea Smargiassi',
                1014: 'Tiziano Perrone',
                1015: 'Elena Torri',
                1206: 'Fabiola Pugliese',
                1255: 'Veronica Narvena Macioce'
            }
            return statusMap[id]
        },
        covidStatus: function(id) {
            const statusMap = {
                1: 'Suspect',
                2: 'COVID-19',
                3: 'Negative',
                4: 'post-COVID-19'
            }
            return statusMap[id]
        },
        ratingLabel: function(id) {
            const statusMap = {
                0: 'Rated 0',
                1: 'Rated 1',
                2: 'Rated 2',
                3: 'Rated 3',
                null: 'Not rated'
            }
            return statusMap[id]
        },
        listOfIds: function(list) {
            return (list?list.map( e => (e==null?'null':e) ).join(', '):'')
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
                        if(value=="file_area_code")
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
                        opt.counter = s.number_of_files
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
            queryParams.push("where=frames%20IS%20NOT%20NULL")
            
            for (field of this.selectedWhereParams(this.headers)) {
                queryParams.push('where='+field)
            }
            
            // Push to browser query
            console.log("pushing to router")
            this.$router.push( { query: this.headers.reduce( (query, column) => {query[column.value] = column.select.map(e=>(e==null?'null':e)); return query}, {} ) } );
            // console.log(this.$route.query)
            

            let query = '../api/videos?' + queryParams.join("&");
            
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
  
            let queryParams = []
          
            for (field of groupBy) {
            //   if(field=="depth" || field=="frequency" || field=="pixel_density" || field=="structure" || field=="rating" || field=="structure")
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
          
            return query_res = await fetch('../api/stats?'+queryParams.join('&'))
              .then((resp) => resp.json()) // Transform the data into json
              .catch( error => console.error(error) ); // If there is any error you will catch them here
        },

        getFilterOfHeader: function (header) {
            if ( filter = this.$options.filters[header.filterName] )
                return filter
            else // default filter
                return (id) => (id!=null?id:'null')
        }

    },
    template: `
        <div>
        <v-container fluid>

            <v-btn type="button" v-on:click="refresh()">Refresh</v-btn>

            <template>
            <v-data-table
                :headers="headers"
                :items="videos"
                :items-per-page="5"
                item-key="file_id"
                class="elevation-1"
                show-expand
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
                

                <template v-slot:item.operator_id="{ item }">
                        {{ item.operator_id }}
                    <br/>
                        {{ item.operator_id | operatorName }}
                </template>
                <template v-slot:item.patient_id="{ item }">
                    <a v-bind:href=" '../unzipped/'+ item.patient_id +'/' ">
                        {{ item.patient_id }}
                    </a>
                    <br/>
                    {{ item.patient_key }}
                </template>
                <template v-slot:item.analysis_id="{ item }">
                    <a v-bind:href=" '../unzipped/'+ item.patient_id +'/'+ item.analysis_id +'/' ">
                        {{ item.analysis_id }}
                    </a>
                </template>
                <template v-slot:item.file="{ item }">
                    <a v-bind:href=" '/unzipped/'+ item.patient_id +'/'+ item.analysis_id +'/raw/snapshot_'+ item.analysis_id +'_'+ item.file_area_code +'.png' ">
                        png
                    </a>
                    <a v-bind:href=" '/segment?patient_id='+ item.patient_id +'&analysis_id='+ item.analysis_id +'&area_code='+ item.file_area_code " >
                        Segment
                    </a>
                </template>
                <template v-slot:item.analysis_status="{ item }">
                    {{ item.analysis_status | covidStatus }}
                </template>
                <template v-slot:item.rating_operator="{ item }">
                    {{ item.rating_operator | ratingLabel }}
                </template>

                <template v-slot:expanded-item="{ headers, item }">
                    <td :colspan="headers.length-4">
                        More info about {{ item.name }}
                        <a v-bind:href=" '/unzipped/'+ item.patient_id +'/'+ item.analysis_id +'/raw/snapshot_'+ item.analysis_id +'_'+ item.file_area_code +'.png' ">
                            png
                        </a>
                        <router-link to="/segment?patient_id='+ item.patient_id +'&analysis_id='+ item.analysis_id +'&area_code='+ item.file_area_code">
                            Segment
                        </router-link>
                    </td>
                    <td>
                        <img v-if="item.depth"
                            v-bind:src=" '../unzipped/'+ item.patient_id +'/'+ item.analysis_id +'/raw/snapshot_'+ item.analysis_id +'_'+ item.file_area_code +'_D.png' "
                        />
                    </td>
                    <td>
                        <img v-if="item.frequency"
                            v-bind:src=" '../unzipped/'+ item.patient_id +'/'+ item.analysis_id +'/raw/snapshot_'+ item.analysis_id +'_'+ item.file_area_code +'_F.png' "
                        />
                    </td>
                    <td>
                        <img v-if="item.frequency"
                            v-bind:src=" '../unzipped/'+ item.patient_id +'/'+ item.analysis_id +'/raw/snapshot_'+ item.analysis_id +'_'+ item.file_area_code +'_Fc.png' "
                        />
                    </td>
                </template>

            </v-data-table>
            </template>


        </v-container>
        </div>
    `
}
Vue.component('video-list', videoList)
