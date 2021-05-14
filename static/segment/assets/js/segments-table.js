
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
    data: () => {
        return {metadata: []}
    },
    mounted () {
        fetchMetadata().then(response => (this.metadata = response))
    },
    props: ['segmentation_id', 'analysis_id', 'area_code', 'timestamp', 'points'],
    template: `
        <form style="display: flex;">

            <div style="width: 50%">
            
                <label>time:</label><br>
                <input type="text" id="time" disabled><br>

            </div>
            <div style="width: 50%">
                
                <a href="http://iclus-web.bluetensor.ai/patients/details/${urlParams.patient_id}">Patient on ICLUS-WEB</a>
                <br>
                <a href="http://iclus-web.bluetensor.ai/analisys/details/${urlParams.analysis_id}">Analysis on ICLUS-WEB</a>
                <br>
                <br>

                <label for="OperatorId">OperatorId:</label>
                <span> {{ metadata.operator_id }} </span><br>
                <label>operator_name:</label>
                <span> {{ metadata.operator_name }} </span><br><br>

                <label for="PatientId">PatientId:</label>
                <span id="PatientId">${urlParams.patient_id}</span><br>
                <label for="Patient_key">Patient_key:</label>
                <span id="PatientId"> {{ metadata.patient_key }} </span><br><br>

                <label for="AnalysisId">AnalysisId:</label>
                <span id="AnalysisId">${urlParams.analysis_id}</span><br><br>

                <label for="AreaCode">AreaCode:</label>
                <span id="AreaCode">${urlParams.area_code}</span><br><br>

                <label>analysis_status:</label>
                <span> {{ metadata.analysis_status }} </span><br>
                <label>rating_operator:</label>
                <span> {{ metadata.rating_operator }} </span><br><br>

                <label for="depth">depth:</label>
                <input type="text" id="depth" name="depth" v-bind:value="metadata.depth"><br><br>

                <label for="frequency">frequency:</label>
                <input type="text" id="frequency" name="frequency" v-bind:value="metadata.frequency"><br><br>

                <label for="focalPoint">focal_point:</label>
                <input type="text" id="focalPoint" name="focalPoint" v-bind:value="metadata.focal_point"><br><br>

                <label for="focalPoint">pixel_density:</label>
                <input type="text" id="pixel_density" name="pixel_density" v-bind:value="metadata.pixel_density"><br><br>

                <label for="focalPoint">frames:</label>
                <input type="text" id="frames" name="frames" v-bind:value="metadata.frames"><br><br>

                <input type="submit" value="Overwrite metadata">

            </div>
            
        </form>
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
            segmentationTool.clearPoints();
            segmentationTool.addPoints(seg.points);
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
                'points': segmentationTool.getPoints()
            }
            postSegmentation(s);
            this.segments.push(s)
        }
    },
    template: `
        <div>

            <table>
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
                        <button type='button' v-on:click="load_seg(seg)">Load</button>
                        <button type='button' v-on:click="delete_seg(seg)">Delete</button>
                    </td>
                </tr>
            </table>
            
            <select v-model="rate">
                <option disabled value="">Please select one</option>
                <option value="0">rate 0</option>
                <option value="1">rate 1</option>
                <option value="2">rate 2</option>
                <option value="3">rate 3</option>
            </select>
            
            <button type='button' v-on:click="create_seg()">Add
            </button>

        </div>
    `
})


