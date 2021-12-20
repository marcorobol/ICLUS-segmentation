const showWhenCreate = true

globalThis.videoUpload = {

    data: () => {
        return {
            dialog: false,
            dialogDelete: false,

            headers: [
                { text: "Operator", value: "operator_id", options:[], select: 1001, filterName: "operatorName", showWhenCreate },
                { text: "Patient", value: "patient_id", options:[], select: 1020, showWhenCreate },
                { text: "Analysis", value: "analysis_id", options:[], select: 1080, showWhenCreate },
                { text: "Area", value: "file_area_code", options:[], select: null, showWhenCreate },
                { text: "Patient key", value: "patient_key", options:[], select: null, showWhenCreate },
                { text: "COVID status", value: "analysis_status", options:[], select: null, showWhenCreate, filterName: "covidStatus", hint:"1:Suspect 2:COVID-19 3:Negative 4post-COVID-19" },
                { text: "Rating operator", value: "rating_operator", options:[], select: null, showWhenCreate, filterName: "ratingLabel" },
                { text: "Depth", value: "depth", options:[], select: null },
                { text: "Frequency", value: "frequency", options:[], select: null },
                { text: "Focal point", value: "focal_point", options:[], select: null },
                { text: "Pixel density", value: "pixel_density", options:[], select: null, filterName: "pixelDensity" },
                { text: "Frames", value: "frames", options:[], select: null },
                { text: "Profile", value: "profile_label", options:[], select: null },
                { text: "Scanner", value: "profile_scanner_brand", options:[], select: null },
                // { text: 'Actions', value: 'actions', sortable: false }
            ],

            videos: [],

            editedIndex: -1,
            editedItem: {
                operator_id: 1,
                patient_id: 1,
                analysis_id: 1,
                file_area_code: 1,
                analysis_status: null,
                rating_operator: null,
                depth: null,
                frequency: null,
                focal_point: null,
                pixel_density: null,
                profile_scanner_brand: null,
            },
            defaultItem: {
                operator_id: 1,
                patient_id: 1,
                analysis_id: 1,
                file_area_code: 1,
                analysis_status: null,
                rating_operator: null,
                depth: null,
                frequency: null,
                focal_point: null,
                pixel_density: null,
                profile_scanner_brand: null,
            },
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
        
        
        // Pull from browser query into filters
        if(this.$route.query.operator_id)
            this.headers[0].select = this.$route.query.operator_id
        if(this.$route.query.patient_id)
            this.headers[1].select = this.$route.query.patient_id
        if(this.$route.query.analysis_id)
            this.headers[2].select = this.$route.query.analysis_id
        // if(this.headers[0].select!=this.$route.query.operator_id)
        //     this.headers[0].select = this.$route.query.operator_id
        // if(this.headers[1].select!=this.$route.query.patient_id)
        //     this.headers[1].select = this.$route.query.patient_id
        // if(this.headers[2].select!=this.$route.query.analysis_id)
        //     this.headers[2].select = this.$route.query.analysis_id

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
            if(statusMap[id])
                return statusMap[id]
            else
                return id
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
        pixelDensity: function(num) {
            return Math.round(num*100)/100
        }
    },
    
    methods: {
        
        textIntoSelect: async function (text, {options,select}=column) {

            // // clear current select
            // select.splice(0);
            
            // // loop over keys
            // if (text)
            //     for (string of text.replaceAll(' ','').split(',')) {
            //         let found = options.find( opt => ''+opt.id == ''+string )
            //         if ( found!=undefined && !select.includes(found.id) )
            //             select.push(found.id)
            //     }

            await options.push({id: text})
            select = text

            // refresh view
            this.refresh()
        },

        selectedWhereParams: function (headers) {
            const queryParams = []
            for ({text,value,options,select} of headers) {
                if(!select)
                    continue
                const whereOR = []
                // for (sel of select) {
                    if(select=="null" || select==null)
                        whereOR.push(value+"%20IS%20NULL");
                    else if(select!="any")
                        if(value=="file_area_code" || value=="profile_scanner_brand")
                            whereOR.push(value+"='"+select+"'");
                        else
                            whereOR.push(value+"="+select);
                // }
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
            if( this.headers[0].select!=this.$route.query.operator_id ||
                this.headers[1].select!=this.$route.query.patient_id ||
                this.headers[2].select!=this.$route.query.analysis_id ) {
                    var router_query = {
                        operator_id: this.headers[0].select,
                        patient_id: this.headers[1].select,
                        analysis_id: this.headers[2].select
                    }
                    this.$router.push( { query: router_query } );
                    // console.log(this.$route.query)
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

        getFilterOfHeader: function (header) {
            if ( filter = this.$options.filters[header.filterName] )
                return filter
            else // default filter
                return (id) => (id!=null?id:'null')
        },



        editItem (item) {
            this.editedIndex = this.videos.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },
        deleteItem (item) {
            this.editedIndex = this.videos.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },
        async deleteItemConfirm () {
            await fetch('../api/videos/'+this.editedItem.analysis_id+'_'+this.editedItem.file_area_code, {
                method: 'DELETE'
            })
            this.videos.splice(this.editedIndex, 1)
            this.closeDelete()
        },
        close () {
            this.dialog = false
            this.$nextTick(() => {
              this.editedItem = Object.assign({}, this.defaultItem)
              this.editedIndex = -1
            })
        },
        closeDelete () {
            this.dialogDelete = false
            this.$nextTick(() => {
              this.editedItem = Object.assign({}, this.defaultItem)
              this.editedIndex = -1
            })
        },
        async save () {
            if (this.editedIndex > -1) {                
                await fetch('../api/videos/'+this.editedItem.analysis_id+'_'+this.editedItem.file_area_code, {
                    method: 'PUT',
                    body: JSON.stringify(this.editedItem),
                    headers: { 'Content-Type': 'application/json' }
                })
                .catch( error => console.error(error) );// If there is any error you will catch them here
            } else {
                this.editedItem.operator_id = this.headers[0].select
                this.editedItem.patient_id = this.headers[1].select
                this.editedItem.analysis_id = this.headers[2].select

                let formData = new FormData()
                formData.append('operator_id', this.editedItem.operator_id)
                formData.append('patient_id', this.editedItem.patient_id)
                formData.append('analysis_id', this.editedItem.analysis_id)
                formData.append('file_area_code', this.editedItem.file_area_code)
                if(this.editedItem.analysis_status)
                    formData.append('analysis_status', this.editedItem.analysis_status)
                if(this.editedItem.rating_operator)
                    formData.append('rating_operator', this.editedItem.rating_operator)
                formData.append('depth', this.editedItem.depth)
                formData.append('frequency', this.editedItem.frequency)
                formData.append('focal_point', this.editedItem.focal_point)
                formData.append('pixel_density', this.editedItem.pixel_density)
                formData.append('profile_scanner_brand', this.editedItem.profile_scanner_brand)
                formData.append('file', this.editedItem.file)
                console.log(formData)

                await fetch('../api/videos/', {
                    method: 'POST',
                    body: formData//JSON.stringify(this.editedItem),
                    // headers: { 'Content-Type': 'application/json' }
                })
                .catch( error => console.error(error) );// If there is any error you will catch them here
            }
            this.refresh()
            this.close()
        },

    },
    
    computed: {
        formTitle () {
          return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
        },
    },
    
    template: `
        <div>
        <v-container fluid>

            
            <v-row align="center">
                            
                <v-col
                    class="d-flex"
                    cols="12"
                    sm="2"
                    v-for="column in headers.slice(0,3)"
                    v-bind:key="column.value"
                >
                    <v-text-field
                        v-model="column.select"
                        :label="column.text"
                        placeholder=""
                        hint=""
                        v-on:change="refresh"
                    ></v-text-field>

                </v-col>

            </v-row>


            


            
            <template>
            <v-data-table
                :headers="headers.concat({ text: 'Actions', value: 'actions', sortable: false })"
                :items="videos"
                :items-per-page="50"
                item-key="file_id"
                class="elevation-1"
                show-expand
                multi-sort
                :footer-props="{
                    showFirstLastPage: true,
                    firstIcon: 'mdi-arrow-collapse-left',
                    lastIcon: 'mdi-arrow-collapse-right',
                    prevIcon: 'mdi-minus',
                    nextIcon: 'mdi-plus',
                    'items-per-page-options': [5, 10, 50, 100, 500, -1]
                }"
            >
                
                <template v-slot:top>
                    <v-toolbar flat>
                    <v-toolbar-title>Modify/Upload Videos</v-toolbar-title>
                    <v-divider
                        class="mx-4"
                        inset
                        vertical
                    ></v-divider>
                    <v-spacer></v-spacer>
                    <v-dialog
                        v-model="dialog"
                        max-width="800px"
                    >
                        <template v-slot:activator="{ on, attrs }">
                        
                            <v-btn
                                type="button"
                                v-on:click="refresh()"
                                class="mb-2"
                            >
                                Refresh
                            </v-btn>
                            
                            <v-btn
                                color="primary" 
                                dark
                                class="mb-2"
                                v-bind="attrs"
                                v-on="on"
                            >
                                New Video
                            </v-btn>
                        </template>

                        <v-card>
                            <v-card-title>
                                <span class="text-h5">
                                    {{ editedIndex === -1 ? 'Upload a new video' : 'Edit existing video' }}
                                </span>
                            </v-card-title>

                            <v-card-text>
                                <v-container>
                                <v-row>
                                    <v-col
                                        v-for="column in headers"
                                        v-bind:key="column.value"
                                        cols="12"
                                        sm="6"
                                        md="3"
                                    >
                                        <v-text-field
                                            v-model="editedItem[column.value]"
                                            :label="column.text"
                                            :hint="column.hint"
                                            :disabled="( editedIndex<=-1 && ['depth','frequency','focal_point','pixel_density','frames','profile_label','profile_scanner_brand'].includes(column.value) )
                                                    || ( editedIndex>-1 && ['operator_id','patient_id','analysis_id','file_area_code'].includes(column.value) )"
                                        >
                                        </v-text-field>
                                    </v-col>
                                    <v-col
                                        v-if="editedIndex <= -1"
                                        class="d-flex"
                                        cols="12"
                                        sm="2"
                                    >
                                        <v-file-input
                                            v-model="editedItem.file"
                                            show-size
                                            truncate-length="15"
                                        >
                                        </v-file-input>
                                    </v-col>
                                    
                                </v-row>
                                </v-container>
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="close"
                                >
                                    Cancel
                                </v-btn>
                                <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="save"
                                >
                                    Save
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <v-dialog v-model="dialogDelete" max-width="500px">
                        <v-card>
                        <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                            <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                            <v-spacer></v-spacer>
                        </v-card-actions>
                        </v-card>
                    </v-dialog>

                    </v-toolbar>
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-icon
                        small
                        class="mr-2"
                        @click="editItem(item)"
                    >
                        mdi-pencil
                    </v-icon>
                    <v-icon
                        small
                        @click="deleteItem(item)"
                    >
                        mdi-delete
                    </v-icon>
                </template>

                <template v-slot:no-data>
                    No data
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
                <template v-slot:item.pixel_density="{ item }">
                    {{ item.pixel_density | pixelDensity }}
                </template>
                <template v-slot:item.profile_scanner_brand="{ item }">
                    {{ item.profile_scanner_brand }} - {{ item.profile_label }}
                </template>

                <template v-slot:expanded-item="{ headers, item }">
                    <td v-bind:colspan="headers.length-8">
                        More info about {{ item.analysis_id }}_{{ item.file_area_code }}
                        </br>
                        <a v-bind:target=" 'png_' + item.analysis_id + item.file_area_code"
                            v-bind:href=" '/unzipped/'+ item.patient_id +'/'+ item.analysis_id +'/raw/snapshot_'+ item.analysis_id +'_'+ item.file_area_code +'.png' ">
                            Snapshot
                        </a>
                        </br>
                        <router-link v-bind:to=" '/segment?patient_id='+ item.patient_id +'&analysis_id='+ item.analysis_id +'&area_code='+ item.file_area_code">
                            Segmentation tool
                        </router-link>
                        </br>
                        <a v-bind:target=" 'api_' + item.analysis_id + item.file_area_code"
                            v-bind:href=" '/api/videos/' + item.analysis_id + '_' + item.file_area_code ">
                            Api
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
                    <td v-bind:colspan="2">
                        <img v-if="item.focal_point | item.pixel_density"
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
Vue.component('video-upload', videoUpload)
