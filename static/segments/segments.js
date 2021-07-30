

globalThis.segments = {

    // props: ['patient_id', 'analysis_id', 'area_code'],

    data: () => {
        return {
            headers: [
                { text: "Operator", value: "operator_id", values:[], select: [1001], filterName: "operatorName" },
                { text: "Patient", value: "patient_id", values:[], select: [] },
                { text: "Analysis", value: "analysis_id", values:[], select: [] },
                { text: "Status", value: "analysis_status", values:[], select: [], filterName: "covidStatus" },
                { text: "Rating", value: "rating_operator", values:[], select: [] },
                { text: "Depth", value: "depth", values:[], select: [] },
                { text: "Frequency", value: "frequency", values:[], select: [] },
                { text: "Focal point", value: "focal_point", values:[], select: [] },
                { text: "Pixel density", value: "pixel_density", values:[], select: [] }
            ],
            
            roundDepthBy: "null",
            roundFrequencyBy: "null",
            roundPixelDensityBy: "null",

            videos: []
        }
    },
    
    mounted: async function () {
        
        for ({text,value,values,filterName} of this.headers) {
            if(value=="file")
                continue;
            let stats = await this.callStats({groupBy: [value]})
            values.push.apply(
                values,
                stats.map( entry => {
                    let id = (entry[value]!=null?entry[value]:'null')
                    let filter = this.$options.filters[filterName]
                    let label = (filter?filter(id):id)
                    return {id, label}
                } )
            );
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
                2: 'Positive',
                3: 'Negative',
                4: 'Post covid'
            }
            return statusMap[id]
        }
    },

    methods: {
        
        /**
         * This function refresh the list
         */
        refresh: function () {
    
            var queryParams = []
            // queryParams.push("where=depth%20IS%20NOT%20NULL")
            queryParams.push("where=frames%20IS%20NOT%20NULL")
            
            for ({text,value,values,select} of this.headers) {
                if(!select)
                    continue
                var where = []
                for (sel of select) {
                    if(sel=="null")
                        where.push(value+"%20IS%20NULL");
                    else if(sel!="any")
                        where.push(value+"="+sel);
                }
                if(where.length>0)
                    queryParams.push("where=" + where.join(" OR "));
            }
            
            let query = '../api/videos?' + queryParams.join("&");
            
            // fetch('../api/videos?where=depth%20IS%20NOT%20NULL')
            fetch(query)
            .then((resp) => resp.json()) // Transform the data into json
            .then( (data) => { // Here you get the data to modify as you please
                
                this.videos.length = 0;
                this.videos.push.apply( this.videos, data.map( entry => entry ) );
                
            })
            .catch( error => console.error(error) );// If there is any error you will catch them here
            
        },


        callStats: async function ({groupBy}) {
  
            let queries = []
          
            for (field of groupBy) {
            //   if(field=="depth" || field=="frequency" || field=="pixel_density" || field=="structure" || field=="rating" || field=="structure")
                queries.push('groupBy='+field)
            }
            
            // let roundDepthBy = $('#roundDepthBy')[0].value
            // let roundFrequencyBy = $('#roundFrequencyBy')[0].value
            // let roundPixelDensityBy = $('#roundPixelDensityBy')[0].value
          
            // if (this.roundDepthBy!="null") queries.push('roundDepthBy='+this.roundDepthBy)
            // if (this.roundFrequencyBy!="null") queries.push('roundFrequencyBy='+this.roundFrequencyBy)
            // if (this.roundPixelDensityBy!="null") queries.push('roundPixelDensityBy='+this.roundPixelDensityBy)
          
            return query_res = await fetch('../api/stats?'+queries.join('&'))
              .then((resp) => resp.json()) // Transform the data into json
              .catch( error => console.error(error) ); // If there is any error you will catch them here
        },


        textIntoSelect: function (value, column) {
            let select = column.select
            select.length=0;
            select.push.apply( select, value.split(',') );
            this.refresh()
            //TODO force select component rerender
        }

    },
    template: `
        <div>
        <v-container fluid>

            <button type="button" v-on:click="refresh()">Update</button>

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
                                :items="column.values"
                                item-value="id"
                                item-text="label"
                                :label="column.text"
                                multiple
                                v-on:change="refresh"
                            >
                                <template v-slot:prepend-item>
                                    <v-list-item
                                    >
                                        <v-list-item-action>
                                            
                                        </v-list-item-action>
                                        <v-list-item-content>
                                            <v-textarea
                                                name="input-7-1"
                                                v-bind:value="column.select"
                                                v-on:change="textIntoSelect($event, column)"
                                                hint="Hint text"
                                            ></v-textarea>
                                        </v-list-item-content>
                                    </v-list-item>
                                    <v-divider class="mt-2"></v-divider>
                                </template>
                            </v-select>
                        </td>
                    </tr>
                </template>
                

                <template v-slot:item.patient_id="{ item }">
                    <a v-bind:href=" '../unzipped/'+ item.patient_id +'/' ">
                        {{ item.patient_id }}
                    </a>
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
                        :items="header.values"
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
                        :items="header.values"
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
                        :items="header.values"
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
                        :items="header.values"
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
                        :items="header.values"
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
                        :items="header.values"
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
                        :items="header.values"
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
                        :items="header.values"
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
                        :items="header.values"
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
                <option v-for="value in column.values" v-bind:value="value">{{ value }}</option>
            </select>

            <v-select
                v-if="column.value"
                v-model="column.select"
                :items="column.values"
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
