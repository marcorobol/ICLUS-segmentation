
Vue.component('segment-table-no', {
    data: () => {
        return {segments: []}
    },
    mounted () {
        fetchSegments().then(response => (this.segments = response))
    },
    template: `
        <table>
            <tr>
                <th> id </th>
                <th> timestamp </th>
                <th> actions </th>
            </tr>
            <tr v-for="seg in segments">
                <segment-row
                    v-bind:segmentation_id="seg.segmentation_id"
                    v-bind:analysis_id="seg.analysis_id"
                    v-bind:area_code="seg.area_code"
                    v-bind:timestamp="seg.timestamp"
                    v-bind:points="seg.points" >
                </segment-row>
            </tr>
        </table>
    `
})

Vue.component('segment-row', {
    props: ['segmentation_id', 'analysis_id', 'area_code', 'timestamp', 'points'],
    methods: {
        load_seg: function () {
            segmentationTool.clearPoints();
            segmentationTool.addPoints(this.points);
        },
        delete_seg: function () {
            deleteSegmentation(this.segmentation_id)
        }
    },
    template: `
        <td>
            {{ segmentation_id }}
        </td>
        <td>
            {{ timestamp }}
        </td>
        <td>
            <button type='button' v-on:click="load_seg">Load</button>
            <button type='button' v-on:click="delete_seg">Delete</button>
        </td>
    `
})



Vue.component('segment-table', {
    data: () => {
        return {
            valid: false,
            rate: null,
            rateRules: [
              v => !!(v!=null) || 'Rate is required'
            ],
            segments: []
        }
    },
    mounted () {
        fetchSegments().then(response => (this.segments = response))
    },
    methods: {
        load_seg: function (seg) {
            videojs('my-video').currentTime(seg.timestamp)
            console.log(this.$root.$refs)
            this.$root.$refs.segmentation_tool.clearPoints();
            this.$root.$refs.segmentation_tool.addPoints(seg.points);
            this.rate = seg.rate;
        },
        delete_seg: function (seg) {
            deleteSegmentation(seg.segmentation_id)
            for (i in this.segments) {
                if (this.segments[i].segmentation_id == seg.segmentation_id)
                this.segments.splice(i,1)
            }
        },
        clear_seg: function () {
            this.$root.$refs.segmentation_tool.clearPoints();
            this.$refs.form.reset()
        },
        create_seg: async function () {
            if (this.$refs.form.validate()) {
                let s = {
                    'analysis_id': urlParams.analysis_id,
                    'area_code': urlParams.area_code,
                    'timestamp': this.$root.current_video_time,//$('#time')[0].value,
                    'rate': this.rate,
                    'points': this.$root.$refs.segmentation_tool.getPoints()
                }
                s = (await postSegmentation(s)).rows[0];
                this.segments.push(s);
                this.$root.$refs.segmentation_tool.clearPoints();
                this.$refs.form.reset();
            }
        }
    },
    template: `
        <v-container fluid>
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
                                    actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="seg in segments">
                                <td>
                                    {{ seg.segmentation_id }}
                                </td>
                                <td>
                                    {{ seg.timestamp }}
                                </td>
                                <td>
                                    {{ seg.rate }}
                                </td>
                                <td>
                                    <v-btn type='button' v-on:click="load_seg(seg)">Load</v-btn>
                                    <v-btn type='button' v-on:click="delete_seg(seg)">Delete</v-btn>
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
                                        :items="[0,1,2,3]"
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
                                        Add
                                    </v-btn>

                                    <v-btn
                                        class="mr-4"
                                        v-on:click="clear_seg()"
                                    >
                                        Clear
                                    </v-btn>
                                    
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-form>
                </v-col>

            </v-row>
        </v-container>
    `
})


