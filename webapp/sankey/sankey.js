

globalThis.sankey = {

    data: () => {
        return {
            data: {},
            chart: {},
            options: { //chart options
                tooltip: {isHtml: true},
                width: '100%',
                sankey: {
                iterations: 200, // use 0 to keeps label ordered
                node: {
                    label: {
                    fontName: 'Times-Roman',
                    fontSize: 14,
                    color: 'black',
                    bold: true
                    }
                }
                }
            },

            valueOfOptions: [
                {value: "number_of_frames", text:'frames'},
                {value: "number_of_files", text:'files'},
                {value: "number_of_analyses", text:'analyses'},
                {value: "number_of_patients", text:'patients'},
                {value: "number_of_operators", text:'operators'}
            ],
            valueOf: 'number_of_files',

            fieldOptions: [
                {value: 'depth', text: 'Depth'},
                {value: 'frequency', text: 'Frequency'},
                {value: 'pixel_density', text: 'Pixel density'},
                {value: 'structure', text: 'Structure'},
                {value: 'rating', text: 'Rate by operator'},
                {value: 'status', text: 'Covid'},
                {value: 'profile_scanner_brand', text: 'Scanner brand'}
            ],
            fields: {
                fieldA: {label: 'field A', value: 'status'},
                fieldB: {label: 'field B', value: 'structure'},
                fieldC: {label: 'field C', value: 'profile_scanner_brand'},
                fieldD: {label: 'field D', value: 'frequency'},
                fieldE: {label: 'field E', value: 'depth'}
            },

            groupDepth: "[50)[60,80)[80,100](100,120](120,140)[140,180][220][305]",
            groupFrequency: "[2.5][3.5,4.5)[4.5,5.5)[5.5,6.5)[6.5,7.5)[10]",
            groupPixelDensity: "",

            roundDepth: "",
            roundFrequency: "",
            roundPixelDensity: "1"
        }
    },

    mounted: async function () {
        
        google.charts.load("current", {packages:["sankey"]});
        google.charts.setOnLoadCallback(this.initChart);
        
    },

    filters: {
        structureName: function(id) {
            const statusMap = {
                1001: 'Rome', //Smargiassi
                1011: 'Pavia', //Perrone
                1012: 'Brescia', //E. Torri
                1187: 'Rovereto', //F. Pugliese
                1228: 'Lodi' //Macioce
            }
            return statusMap[id]
        },
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
                2: 'COVID-19', //'Positive',
                3: 'Negative',
                4: 'post-COVID-19', //Post covid'
                null: 'undefined'
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

        initChart: function () {
            this.data = new google.visualization.DataTable();
            this.data.addColumn('string', 'From');
            this.data.addColumn('string', 'To');
            this.data.addColumn('number', 'Weight');
            // A column for custom tooltip content
            this.data.addColumn({type: 'string', role: 'tooltip'});
            // data.addRows([
            //     [ 'Brazil', 'Portugal', 5 ],
            //     [ 'Brazil', 'France', 1 ]
            // ]);
    
            // Set chart options
    
            // Instantiate and draw our chart, passing in some options.
            let chart_div = document.getElementById('sankey_multiple')
            this.chart = new google.visualization.Sankey(chart_div);
            
            // // Wait for the chart to finish drawing before calling the getImageURI() method.
            // google.visualization.events.addListener(chart, 'ready', function () {
            //   chart_div.innerHTML = '<img src="' + chart.getImageURI() + '">';
            //   console.log(chart_div.innerHTML);
            // });
    
            this.refresh();
        },
        
        /**
         * This function clear and repopulate the data table and replot the graph
         */
        refresh: async function () {
            
            this.data.removeRows(0, this.data.getNumberOfRows())
            
            let d1 = await this.getOneToOneData(this.fields.fieldA.value, this.fields.fieldB.value, this.valueOf);
            this.data.addRows(d1)
    
            let d2 = await this.getOneToOneData(this.fields.fieldB.value, this.fields.fieldC.value, this.valueOf);
            this.data.addRows(d2)
    
            let d3 = await this.getOneToOneData(this.fields.fieldC.value, this.fields.fieldD.value, this.valueOf);
            this.data.addRows(d3)
    
            let d4 = await this.getOneToOneData(this.fields.fieldD.value, this.fields.fieldE.value, this.valueOf);
            this.data.addRows(d4)
            
            this.chart.draw(this.data, this.options);
        },

        getLabel: function (field, value) {
            let label = field+':'+value
            if (field=='structure')
                label = this.$options.filters.structureName(value)
            else if (field=='profile_scanner_brand')
                label = value
            else if (field=='status')
                label = this.$options.filters.covidStatus(value)
            else if (field=='frequency') {
                label = value + ' MHz'
            }
            else if (field=='depth') {
                label = value + ' mm'
            }
            else if (field=='pixel_density') {
                label = value + ' px/cm'
            }
            return label
        },

        getOneToOneData: async function (xField, yField, number_of='number_of_frames') {

            let query_res_x = await this.callStats({groupBy: [xField]});
            
            let query_res_xy = await this.callStats({groupBy: [xField, yField]});
    
            let data = []
            
            for (let row of query_res_xy) {
                let xLabel = this.getLabel(xField, row[xField])
                let yLabel = this.getLabel(yField, row[yField])
                let weight = parseInt(row[number_of])
                let totalWeightOfxLabel = parseInt(query_res_x.filter( (_row,_index) => _row[xField]==row[xField] )[0][number_of])
                let tooltip = [
                weight+' '+number_of.substring(10)+' from \"'+xLabel+'\" to \"'+yLabel+'\"',
                '(out of '+totalWeightOfxLabel+' '+number_of.substring(10)+' in \"'+xLabel+'\")'
                ].map( (line) => '<tspan x="0" dy="1.2em">'+line+'</tspan>' ).join('<br/>')
                data.push( [ xLabel, yLabel, weight, tooltip ] );
            }
    
            return data
        },

        callStats: async function ({groupBy}) {
        
            // var query_res = [{"depth_grouped":320,"frequency_grouped":4,"number_of_frames":1400,"number_of_files":"14","number_of_analyses":"2","number_of_patients":"2","number_of_operator":"1","operators":[1001]},{"depth_grouped":240,"frequency_grouped":4,"number_of_frames":3900,"number_of_files":"39","number_of_analyses":"4","number_of_patients":"3","number_of_operator":"2","operators":[1001,1206]},{"depth_grouped":160,"frequency_grouped":6,"number_of_frames":35,"number_of_files":"1","number_of_analyses":"1","number_of_patients":"1","number_of_operator":"1","operators":[1001]},{"depth_grouped":160,"frequency_grouped":4,"number_of_frames":32959,"number_of_files":"324","number_of_analyses":"28","number_of_patients":"28","number_of_operator":"3","operators":[1001,1014,1206]},{"depth_grouped":120,"frequency_grouped":null,"number_of_frames":12194,"number_of_files":"76","number_of_analyses":"7","number_of_patients":"7","number_of_operator":"1","operators":[1001]},{"depth_grouped":120,"frequency_grouped":6,"number_of_frames":33336,"number_of_files":"148","number_of_analyses":"17","number_of_patients":"15","number_of_operator":"3","operators":[1001,1014,1255]},{"depth_grouped":120,"frequency_grouped":4,"number_of_frames":63303,"number_of_files":"354","number_of_analyses":"36","number_of_patients":"34","number_of_operator":"2","operators":[1014,1255]},{"depth_grouped":80,"frequency_grouped":null,"number_of_frames":10740,"number_of_files":"67","number_of_analyses":"6","number_of_patients":"5","number_of_operator":"1","operators":[1001]},{"depth_grouped":80,"frequency_grouped":6,"number_of_frames":192712,"number_of_files":"812","number_of_analyses":"65","number_of_patients":"49","number_of_operator":"3","operators":[1001,1014,1255]},{"depth_grouped":80,"frequency_grouped":4,"number_of_frames":85268,"number_of_files":"625","number_of_analyses":"58","number_of_patients":"58","number_of_operator":"4","operators":[1001,1014,1206,1255]},{"depth_grouped":80,"frequency_grouped":2,"number_of_frames":126,"number_of_files":"1","number_of_analyses":"1","number_of_patients":"1","number_of_operator":"1","operators":[1014]},{"depth_grouped":40,"frequency_grouped":10,"number_of_frames":552,"number_of_files":"3","number_of_analyses":"1","number_of_patients":"1","number_of_operator":"1","operators":[1255]},{"depth_grouped":40,"frequency_grouped":6,"number_of_frames":1040,"number_of_files":"5","number_of_analyses":"3","number_of_patients":"3","number_of_operator":"2","operators":[1001,1014]}];
            let queries = []
    
            for (field of groupBy) {
                if(field=="pixel_density" || field=="structure" || field=="rating" || field=="status" || field=="profile_scanner_brand")
                    queries.push('groupBy='+field)
                if(field=="depth")
                    queries.push('groupBy=depth'+this.groupDepth)
                // queries.push('groupBy=depth[50)[60,80)[80,100](100,120](120,140)[140,180][220][305]')//'groupBy=depth[20,60)[60,80)[80,100](100,120](120,140)[140,180][220,260][300,340]'
                if(field=="frequency")
                    queries.push('groupBy=frequency'+this.groupFrequency)
                // queries.push('groupBy=frequency[2.5][3.5,4.5)[4.5,5.5)[5.5,6.5)[6.5,7.5)[10]')
            }
                
            if (this.roundDepth!="") queries.push('roundDepthBy='+this.roundDepth)
            if (this.roundFrequency!="") queries.push('roundFrequencyBy='+this.roundFrequency)
            if (this.roundPixelDensity!="") queries.push('roundPixelDensityBy='+this.roundPixelDensity)
    
            return query_res = await fetch('../api/stats_federico?'+queries.join('&'))
                .then((resp) => resp.json()) // Transform the data into json
                .catch( error => console.error(error) ); // If there is any error you will catch them here
            }
            
    },

    template: `
        <v-container fluid>

            <v-row align="center">
                <v-col
                    class="d-flex"
                    cols="12"
                    sm="2"
                >
                    <v-select
                        v-model="valueOf"
                        label="Plot # of"
                        :items="valueOfOptions"
                        item-value="value"
                        item-text="text"
                        v-on:change="refresh"
                        outlined
                        hide-details
                    ></v-select>
                </v-col>
                <v-col
                    class="d-flex"
                    cols="12"
                    sm="2"
                    v-for="(field,key) in fields"
                    :key="key"
                >
                    <v-select
                        v-model="field.value"
                        :label="field.label"
                        :items="fieldOptions"
                        item-value="value"
                        item-text="text"
                        v-on:change="refresh"
                        hide-details
                    ></v-select>
                </v-col>
            </v-row>

            <v-row align="center">

                <v-col
                    class="d-flex"
                    cols="12"
                    sm="2"
                >
                    <v-text-field
                        v-model="roundDepth"
                        label="Depth rounding"
                        placeholder="Leave empty to not rounding"
                        outlined
                        hide-details
                    ></v-text-field>
                </v-col>
                <v-col
                    class="d-flex"
                    cols="12"
                    sm="4"
                >
                    <v-text-field
                        v-model="groupDepth"
                        label="Depth grouping"
                        placeholder="[50)[60,80)[80,100](100,120](120,140)[140,180][220][305]"
                        hint="Intervals with limits included [closed] or excluded (open) e.g. [3.1,5](1,4.5)[1,2)"
                        hide-details
                    ></v-text-field>
                </v-col>

                <v-col
                    class="d-flex"
                    cols="12"
                    sm="2"
                >
                    <v-text-field
                        v-model="roundFrequency"
                        label="Frequency rounding"
                        placeholder="Leave empty to not rounding"
                        outlined
                        hide-details
                    ></v-text-field>
                </v-col>
                <v-col
                    class="d-flex"
                    cols="12"
                    sm="4"
                >
                    <v-text-field
                        v-model="groupFrequency"
                        label="Frequency grouping"
                        placeholder="[50)[60,80)[80,100](100,120](120,140)[140,180][220][305]"
                        hide-details
                    ></v-text-field>
                </v-col>

                <v-col
                    class="d-flex"
                    cols="12"
                    sm="6"
                >
                    <v-btn
                        elevation="2"
                        @click="refresh()"
                        block
                    >Update</v-btn>
                </v-col>

                <v-col
                    class="d-flex"
                    cols="12"
                    sm="2"
                >
                    <v-text-field
                        v-model="roundPixelDensity"
                        label="Pixel density rounding"
                        placeholder="Leave empty to not rounding"
                        outlined
                        hide-details
                    ></v-text-field>
                </v-col>
                <v-col
                    class="d-flex"
                    cols="12"
                    sm="4"
                >
                    <v-text-field
                        v-model="groupPixelDensity"
                        label="Pixel density grouping"
                        placeholder=""
                        hide-details
                    ></v-text-field>
                </v-col>
            </v-row>
            
            <div id="sankey_multiple" style="width: 100%; height: 500px; overflow:visible"></div>

        </v-container>
    `
}
Vue.component('sankey', sankey)
