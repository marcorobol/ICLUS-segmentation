
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




Vue.component('segment-form', {
    props: ['segmentation_id', 'analysis_id', 'area_code', 'timestamp', 'points'],
    template: `
        <form style="display: flex;">

            <div style="width: 50%">
            
                <button>Skip</button>
                <br/>
                <button>Confirm crop</button>
                <br/>
                <button type='button' onclick="postSegmentation({
                        'analysis_id': urlParams.analysis_id,
                        'area_code': urlParams.area_code,
                        'timestamp': $('#time')[0].value,
                        'points': segmentationTool.getPoints()
                    })">Confirm segmentation
                </button>
                <br/>
                <button>Confirm and go to next</button>
                <br>
                <br>

                <label>time:</label><br>
                <input type="text" id="time" disabled><br>

            </div>
            <div style="width: 50%">
            
                <label for="PatientId">PatientId:</label>
                <span id="PatientId">1234</span><br><br>

                <label for="AnalysisId">AnalysisId:</label>
                <span id="AnalysisId">1234</span><br><br>

                <label for="AreaCode">AreaCode:</label>
                <span id="AreaCode">1234</span><br><br>

                <label for="depth">Depth:</label>
                <input type="text" id="depth" name="depth"><br><br>

                <label for="frequency">Frequency:</label>
                <input type="text" id="frequency" name="frequency"><br><br>

                <label for="focalPoint">FocalPoint:</label>
                <input type="text" id="focalPoint" name="focalPoint"><br><br>

                <input type="submit" value="Overwrite metadata">

            </div>
            
        </form>
    `
})


Vue.component('segment-table', {
    data: () => {
        return {segments: []}
    },
    mounted () {
        fetchSegments().then(response => (this.segments = response))
    },
    methods: {
        load_seg: function (seg) {
            segmentationTool.clearPoints();
            segmentationTool.addPoints(seg.points);
        },
        delete_seg: function (seg) {
            deleteSegmentation(seg.segmentation_id)
        }
    },
    template: `
        <table>
            <tr>
                <th>
                    id
                </th>
                <th>
                    timestamp
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
                    <button type='button' v-on:click="load_seg(seg)">Load</button>
                    <button type='button' v-on:click="delete_seg(seg)">Delete</button>
                </td>
            </tr>
        </table>
    `
})


