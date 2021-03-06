

Vue.component('segment-table', {
    data: () => {
        return {
            valid: false,
            rate: null,
            rateRules: [
              v => !!(v!=null) || 'Rate is required'
            ],
            segments: [],
            // patient_id: urlParams.patient_id,
            // analysis_id: urlParams.analysis_id,
            // area_code: urlParams.area_code,
            segmentId: '',
        }
    },
    props: ['patient_id', 'analysis_id', 'area_code', 'segmentationTool', 'player', 'videoCurrentTime'],
    mounted () {
        fetchSegments(this.analysis_id, this.area_code).then(response => {
            console.log('Segments:', response)
            this.segments = response
            
            // if(found = this.segments.find( e=>''+e.segmentation_id==pullFromQuery().segment_id) )
            //     this.load_seg( found )
        })
    },
    watch: {
        $route: {
            handler: async function(to, from) {
                // let urlParams = pullFromQuery()
                // this.load_seg( this.segments.find( e=>''+e.segmentation_id==urlParams.segmentId ) )
            },
            // cannot start fromRouteToModel here otherwise I don't know how to wait before start watching the model
            immediate: false
        }
    },
    methods: {
        load_seg: function (seg) {
            this.player.currentTime(seg.timestamp) //videojs('my-video').currentTime(seg.timestamp)
            this.player.pause()
            this.segmentationTool.clearPoints();
            this.segmentationTool.addPoints(seg.points);
            this.rate = seg.rate;
            this.segmentId = seg.segmentation_id
        },
        delete_seg: function (seg) {
            deleteSegmentation(seg.segmentation_id)
            for (i in this.segments) {
                if (this.segments[i].segmentation_id == seg.segmentation_id)
                this.segments.splice(i,1)
            }
        },
        clear_seg: function () {
            this.segmentationTool.clearPoints();
            this.$refs.form.reset()
        },
        create_seg: async function () {
            if (this.$refs.form.validate()) {
                let s = {
                    'analysis_id': this.analysis_id,
                    'area_code': this.area_code,
                    'timestamp': Math.round(this.videoCurrentTime*100)/100,//this.player.currentTime(), //this.current_video_time, //$('#time')[0].value,
                    'rate': this.rate,
                    'points': this.segmentationTool.getPoints() //this.$root.$refs.segmentation_tool
                }
                s = (await postSegmentation(s)).rows[0];
                this.segments.push(s);
                this.segmentationTool.clearPoints();
                this.$refs.form.reset();
            }
        }
    },
    template: `
        <v-container fluid>

            <query-binder
                query-field="segment_id"
                v-model="segmentId"
            ></query-binder>

            <v-row align="center">

                <v-col>
                    <v-simple-table dense>
                    <template v-slot:default>
                        <thead>
                            <tr>
                                <th>
                                    id
                                </th>
                                <th>
                                    timestamp
                                </th>
                                <th>
                                    rate
                                </th>
                                <th>
                                    points
                                </th>
                                <th>
                                    actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="seg in segments">
                                <td>
                                    {{ seg.segmentation_id }}
                                    <a :href="'/unzipped/'+patient_id+'/'+analysis_id+'/clipped/segmentation_'+seg.segmentation_id+'_rated_'+seg.rate+'_snapshot_'+analysis_id+'_'+area_code+'_'+seg.timestamp+'.png'">png</a>
                                </td>
                                <td>
                                    {{ seg.timestamp }}
                                </td>
                                <td>
                                    {{ seg.rate }}
                                </td>
                                <td>
                                    {{ seg.points.length }}
                                </td>
                                <td>
                                    <v-btn type='button' v-on:click="load_seg(seg)">
                                        <v-icon> mdi-eye </v-icon>
                                    </v-btn>
                                    <v-btn type='button' v-on:click="delete_seg(seg)">
                                        <v-icon> mdi-delete </v-icon>
                                    </v-btn>
                                </td>
                            </tr>
                        </tbody>
                    </template>
                    </v-simple-table>
                </v-col>

                <v-col>
                    <v-form
                        ref="form"
                        v-model="valid"
                        lazy-validation
                    >
                        <v-container>
                            <v-row>
                                <v-col
                                    cols="12"
                                    sm="6"
                                    md="8"
                                >
                                    <v-select
                                        :items="[
                                            {header:'Assign a rate'},
                                            {value:0, text:'0'},
                                            {value:1, text:'1'},
                                            {value:2, text:'2'},
                                            {value:3, text:'3'},
                                            {header:'Other segmentation labels'},
                                            {value:4, text:'Consolidation'},
                                            {value:5, text:'Pleural Line'},
                                            {value:6, text:'Pleural Effusion'},
                                            {value:7, text:'Vertical Artifact'},
                                            {value:8, text:'White Lung'},
                                            {value:9, text:'Horizontal Artifact'}
                                        ]"
                                        item-value="value"
                                        item-text="text"
                                        label="Give a rate"
                                        v-model="rate"
                                        :rules="rateRules"
                                        filled
                                        required
                                    >
                                    </v-select>
                                </v-col>
                                
                                <v-col
                                    cols="6"
                                    md="4"
                                >
                                    <v-btn
                                        class="mr-4"
                                        v-on:click="create_seg()"
                                    >
                                        <v-icon> mdi-content-save </v-icon> Save
                                    </v-btn>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-btn class="mr-4" v-on:click="clear_seg()">
                                    <v-icon> mdi-wiper </v-icon> Clear drawing
                                </v-btn>
                            </v-row>
                        </v-container>
                    </v-form>
                </v-col>

            </v-row>
        </v-container>
    `
})


