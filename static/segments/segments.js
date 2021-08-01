

globalThis.segments = {

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

    mounted: async function () {
        
        for (let {text,value,options,filterName} of this.headers) {
            let stats = await this.callStats( groupBy= [value] )
            for (entry of stats) {
                options.push({id: entry[value]})
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
            return list.map( e => (e==null?'null':e) ).join(', ')
        }
    },

    methods: {

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
    
            await this.refreshHeaders()

            var queryParams = []

            // queryParams.push("where=depth%20IS%20NOT%20NULL")
            queryParams.push("where=frames%20IS%20NOT%20NULL")
            
            for (field of this.selectedWhereParams(this.headers)) {
                queryParams.push('where='+field)
            }
            
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

        refreshHeaders: async function () {
            
            for (let {text,value,options,filterName} of this.headers) {
                let stats = await this.callStats( groupBy = [value], where = this.selectedWhereParams( this.headers.filter(h => h.value!=value) ) )
                for (opt of options) {
                    let s = stats.find( s => s[value] == opt.id )
                    if ( s ) {
                        opt.disabled = false
                        let filter = this.$options.filters[filterName]
                        opt.label = (filter?filter(opt.id):(opt.id!=null?opt.id:'null')) + ' - ' + s.number_of_files + ' videos'
                    }
                    else {
                        opt.disabled = true
                        let filter = this.$options.filters[filterName]
                        opt.label = (filter?filter(opt.id):(opt.id!=null?opt.id:'null')) + ' - no videos'
                    }
                }
            }

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


        textIntoSelect: function (value, column) {
            let select = column.select
            select.splice(0);
            if(value)
                for (v of value.split(',')) {
                    
                    if ( v.replaceAll(' ','') == 'null' )
                        v = null
                    else if (!isNaN(v))
                        v = parseFloat(v)

                    if ( column.options.find( e=>e.id==v ) && !select.includes(v) )
                        select.push(v)
                }
            this.refresh()
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
                item-key="name"
                class="elevation-1"
                show-expand
                :footer-props="{
                showFirstLastPage: true,
                firstIcon: 'mdi-arrow-collapse-left',
                lastIcon: 'mdi-arrow-collapse-right',
                prevIcon: 'mdi-minus',
                nextIcon: 'mdi-plus'
                }"
            >
                <template
                    v-slot:body.prepend="{ headers }"
                >
                    <tr>
                        <td v-for="column in headers" :colspan="1">
                            <v-select
                                v-if="column.text"
                                v-model="column.select"
                                :items="column.options"
                                item-value="id"
                                item-text="label"
                                :label="column.text"
                                multiple
                                v-on:change="refresh"
                                :menu-props="{ 'content-class': (column.hideDisabledItems?'v-select--hide-disabled-items':'') }"
                            >
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
                                                v-model="column.hideDisabledItems"
                                            ></v-switch>
                                        </v-list-item-action>
                                        <v-list-item-content>
                                            <v-list-item-title>
                                                Hide unavailable options
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
                        <a v-bind:href=" '/segment?patient_id='+ item.patient_id +'&analysis_id='+ item.analysis_id +'&area_code='+ item.file_area_code " >
                            Segment
                        </a>
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
Vue.component('segments', segments)



var old_table_template =`


                <template v-slot:header.operator_id="{ header }">
                    <v-select
                        v-model="header.select"
                        :items="header.options"
                        item-value="id"
                        item-text="label"
                        :menu-props="{ maxHeight: '200' }"
                        :label="header.text"
                        multiple
                        dense
                        v-on:change="refresh"
                    ></v-select>
                    {{ header.text }}
                </template>
                <template v-slot:header.patient_id="{ header }">
                    <v-select
                        v-model="header.select"
                        :items="header.options"
                        item-value="id"
                        item-text="label"
                        :menu-props="{ maxHeight: '200' }"
                        :label="header.text"
                        multiple
                        dense
                        v-on:change="refresh"
                    ></v-select>
                    {{ header.text }}
                </template>
                <template v-slot:header.analysis_id="{ header }">
                    <v-select
                        v-model="header.select"
                        :items="header.options"
                        item-value="id"
                        item-text="label"
                        :menu-props="{ maxHeight: '200' }"
                        :label="header.text"
                        multiple
                        dense
                        v-on:change="refresh"
                    ></v-select>
                    {{ header.text }}
                </template>
                <template v-slot:header.analysis_status="{ header }">
                    <v-select
                        v-model="header.select"
                        :items="header.options"
                        item-value="id"
                        item-text="label"
                        :menu-props="{ maxHeight: '200' }"
                        :label="header.text"
                        multiple
                        dense
                        v-on:change="refresh"
                    ></v-select>
                    {{ header.text }}
                </template>
                <template v-slot:header.rating_operator="{ header }">
                    <v-select
                        v-model="header.select"
                        :items="header.options"
                        item-value="id"
                        item-text="label"
                        :menu-props="{ maxHeight: '200' }"
                        :label="header.text"
                        multiple
                        dense
                        v-on:change="refresh"
                    ></v-select>
                    {{ header.text }}
                </template>
                <template v-slot:header.depth="{ header }">
                    <v-select
                        v-model="header.select"
                        :items="header.options"
                        item-value="id"
                        item-text="label"
                        :menu-props="{ maxHeight: '200' }"
                        :label="header.text"
                        multiple
                        dense
                        v-on:change="refresh"
                    ></v-select>
                    {{ header.text }}
                </template>
                <template v-slot:header.frequency="{ header }">
                    <v-select
                        v-model="header.select"
                        :items="header.options"
                        item-value="id"
                        item-text="label"
                        :menu-props="{ maxHeight: '200' }"
                        :label="header.text"
                        multiple
                        dense
                        v-on:change="refresh"
                    ></v-select>
                    {{ header.text }}
                </template>
                <template v-slot:header.focal_point="{ header }">
                    <v-select
                        v-model="header.select"
                        :items="header.options"
                        item-value="id"
                        item-text="label"
                        :menu-props="{ maxHeight: '200' }"
                        :label="header.text"
                        multiple
                        dense
                        v-on:change="refresh"
                    ></v-select>
                    {{ header.text }}
                </template>
                <template v-slot:header.pixel_density="{ header }">
                    <v-select
                        v-model="header.select"
                        :items="header.options"
                        item-value="id"
                        item-text="label"
                        :menu-props="{ maxHeight: '200' }"
                        :label="header.text"
                        multiple
                        dense
                        v-on:change="refresh"
                    ></v-select>
                    {{ header.text }}
                </template>


<table id="videos" v-if="false">

<thead>
    <tr>
        <th v-for="column in headers">

            {{ column.text }}
            <br/>
            <select v-if="column.value" >
                <option                                       value="any"  >    any    </option>
                <option v-for="value in column.options" v-bind:value="value">{{ value }}</option>
            </select>

            <v-select
                v-if="column.value"
                v-model="column.select"
                :items="column.options"
                item-value="id"
                item-text="label"
                :label="column.text"
                multiple
            ></v-select>

        </th>
    </tr>
</thead>

<tbody>

    <tr v-for="video in videos">

        <td>
            {{ video.operator_id }}
        </td>

        <td>
            <a v-bind:href=" '../unzipped/'+ video.patient_id +'/' ">
                {{ video.patient_id }}
            </a>
        </td>

        <td>
            <a v-bind:href=" '../unzipped/'+ video.patient_id +'/'+ video.analysis_id +'/' ">
                {{ video.analysis_id }}
            </a>
        </td>

        <td>
            <a v-bind:href=" '/unzipped/'+ video.patient_id +'/'+ video.analysis_id +'/raw/snapshot_'+ video.analysis_id +'_'+ video.file_area_code +'.png' ">
                png
            </a>
            <a v-bind:href=" '/segment?patient_id='+ video.patient_id +'&analysis_id='+ video.analysis_id +'&area_code='+ video.file_area_code " >
                Segment
            </a>
        </td>

        <td>
            {{ video.analysis_status | covidStatus}} ({{ video.analysis_status }})
        </td>

        <td>
            {{ video.rating_operator }}
        </td>

        <td>
            {{ (video.depth) }}
            <img
                v-if="video.depth"
                v-bind:src=" '../unzipped/'+ video.patient_id +'/'+ video.analysis_id +'/raw/snapshot_'+ video.analysis_id +'_'+ video.file_area_code +'_D.png' "
            />
            
        </td>

        <td>
            {{ video.frequency }}
            <img
                v-if="video.frequency"
                v-bind:src=" '../unzipped/'+ video.patient_id +'/'+ video.analysis_id +'/raw/snapshot_'+ video.analysis_id +'_'+ video.file_area_code +'_F.png' "
            />

        </td>

        <td>
            {{ video.focal_point }}
            <img
                v-if="video.frequency"
                v-bind:src=" '../unzipped/'+ video.patient_id +'/'+ video.analysis_id +'/raw/snapshot_'+ video.analysis_id +'_'+ video.file_area_code +'_Fc.png' "
            />
            
        </td>

        <td>
            {{ video.pixel_density }}
        </td>

    </tr>

</tbody>

</table>
`
