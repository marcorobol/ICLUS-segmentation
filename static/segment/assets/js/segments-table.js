
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
            rate: null,
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
        create_seg: function () {
            let s = {
                'analysis_id': urlParams.analysis_id,
                'area_code': urlParams.area_code,
                'timestamp': $('#time')[0].value,
                'rate': this.rate,
                'points': this.$root.$refs.segmentation_tool.getPoints()
            }
            postSegmentation(s);
            this.segments.push(s)
        }
    },
    template: `
        <div>

            <v-simple-table>
            <template v-slot:default>
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
            </template>
            </v-simple-table>
            
            <select v-model="rate">
                <option disabled value="">Please select one</option>
                <option value="0">rate 0</option>
                <option value="1">rate 1</option>
                <option value="2">rate 2</option>
                <option value="3">rate 3</option>
            </select>
            
            <br/>

            <v-btn v-on:click="create_seg()">
                Add
            </v-btn>

        </div>
    `
})


