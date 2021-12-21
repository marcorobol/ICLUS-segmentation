

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
                {value: 'focal_point', text: 'Focal point'},
                {value: 'pixel_density', text: 'Pixel density'},
                // {value: 'frames', text: 'Number of frames'},
                {value: 'structure', text: 'Structure'},
                {value: 'rating_operator', text: 'Rate by operator'},
                {value: 'analysis_status', text: 'Covid'},
                {value: 'profile_label', text: 'Video format'},
                {value: 'profile_scanner_brand', text: 'Scanner brand'}
            ],
            fields: {
                fieldA: {label: 'field A', value: 'analysis_status'},
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
            roundPixelDensity: "1",

            headers: [
                { text: "Operator", value: "operator_id", options:[], select: [], filterName: "operatorName" },
                { text: "Patient", value: "patient_id", options:[], select: [] },
                { text: "Analysis", value: "analysis_id", options:[], select: [], subselect_federico: [1080, 1083, 1141, 1140, 1139, 1142, 1143, 1144, 1537, 1538, 1539, 1540, 1541, 1543, 1546, 1545, 1547, 1548, 1639, 
                    1365, 1366, 1368, 1375, 1378, 1380, 1384, 1524, 1521, 1720, 1721, 1722, 1727, 1728, 1730, 1731, 1802, 1804, 1805, 1806, 
                    1047, 1048, 1119, 1120, 1122, 1124, 1126, 1127, 1128, 1129, 1133, 1149, 1150, 1151, 1152, 1153, 1155, 1156, 1157, 1158, 1159, 1160, 1161, 1162, 1163, 1212, 1213, 1222, 1223, 1224, 1247, 1252, 1265, 1266, 1267, 1268, 1269, 1270, 1305, 1306, 1309, 1310, 1311, 1312, 1313, 1314, 1315, 1317, 1323, 1330, 1331, 1332, 1381, 1382, 1388, 1389, 1390, 1391, 1392, 1393, 1394, 1395, 1396, 1397, 1398, 1405, 1406, 1407, 1408, 1409, 1410, 1411, 1412, 1413, 1414, 1415, 1416, 1417, 1418, 1419, 1420, 1552, 1553, 1564, 1565, 1566, 1567, 1570, 1571, 1574, 1576, 1580, 1581, 1582,
                    
                    1808, 1809, 1812, 1920, 1814, 1914, 1915, 1916, 1917, 1919, 1939,
                    1821, 1824, 1826, 1832, 1833, 1834, 1835, 1836, 1837, 1838, 1839, 1840, 1841, 1843, 1844, 1817, 1818, 1819, 1820, 1823, 1825, 1828, 1829, 1830, 1831, 1842, 1845, 1846, 1847, 1848, 1849, 1850, 1851, 1852, 1853, 1854, 1855, 1856, 1857, 1858, 1859, 1860, 1861, 1862, 1863, 1865, 1866, 1867, 1868, 1869, 1864, 1880, 1881, 1882, 1883, 1884, 1885, 1886, 1887, 1888, 1870, 1871, 1872, 1873, 1874, 1875, 1876, 1877, 1878, 1879, 1889, 1890, 1891, 1892, 1893, 1894, 1895, 1896, 1897, 1898, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1911, 1912, 1899, 1901, 1902, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1932, 1933, 1934, 1935, 1936, 1937
                ] },
                { text: "Area", value: "file_area_code", options:[], select: [] },
                { text: "Status", value: "analysis_status", options:[], select: [], filterName: "covidStatus" },
                { text: "Rating", value: "rating_operator", options:[], select: [], filterName: "ratingLabel" },
                { text: "Depth", value: "depth", options:[], select: [] },
                { text: "Frequency", value: "frequency", options:[], select: [] },
                { text: "Focal point", value: "focal_point", options:[], select: [] },
                { text: "Pixel density", value: "pixel_density", options:[], select: [], filterName: "pixelDensity" },
                { text: "Scanner", value: "profile_scanner_brand", options:[], select: [] }
            ]
        }
    },

    mounted: async function () {
        
        google.charts.load("current", {packages:["sankey"]});
        google.charts.setOnLoadCallback(this.initChart);

        // for (let {text,value,options,select,filterName} of this.headers) {
        //     this.callStats( {groupBy: [value]} )
        //     .then( (stats) => {
        //         for (entry of stats) {
        //             entry.id = entry[value]
        //             options.push(entry)
        //         }
        //     })
        // }
        
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
            const operatorMap = {
                1001: 'Andrea Smargiassi',
                1014: 'Tiziano Perrone',
                1015: 'Elena Torri',
                1206: 'Fabiola Pugliese',
                1255: 'Veronica Narvena Macioce'
            }
            return (id in operatorMap?operatorMap[id]:id)
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
            return {
                0: 'Rated 0',
                1: 'Rated 1',
                2: 'Rated 2',
                3: 'Rated 3',
                4: 'Consolidation',
                5: 'Pleural Line',
                6: 'Pleural Effusion',
                7: 'Vertical Artifact',
                null: 'Not labelled'
            }[id]
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
         * This function refresh stats for filter selection
         */
        refreshstats: async function () {
            console.log('refreshstats')

            /**
             * Refresh headers statistics!
             */
            for (let {text,value,options,select,filterName} of this.headers) {
                this.callStats({ groupBy: [value], where: this.selectedWhereParams( this.headers.filter(h => h.value!=value) ) })
                .then( (stats) => {
                    for (opt of options) {
                        let s = stats.find( s => s[value] == opt.id )
                        if ( s ) {
                            opt.number_of_operators = s.number_of_operators
                            opt.number_of_patients = s.number_of_patients
                            opt.number_of_analyses = s.number_of_analyses
                            opt.number_of_files = s.number_of_files
                            opt.number_of_frames = s.number_of_frames
                        }
                        else {
                            opt.number_of_operators = 0
                            opt.number_of_patients = 0
                            opt.number_of_analyses = 0
                            opt.number_of_files = 0
                            opt.number_of_frames = 0
                        }
                    }
                    // options.splice(0)
                    // for (entry of stats) {
                    //     entry.id = entry[value]
                    //     options.push(entry)
                    // }
                })
            }
        },



        /**
         * This function clear and repopulate the data table and replot the graph
         */
        refresh: async function () {
            
            /**
             * Regenerate all filters headers
             */
             for (let {text,value,options,select,filterName} of this.headers) {
                this.callStats({ groupBy: [value] })
                .then( (stats) => {
                    options.splice(0)
                    for (entry of stats) {
                        entry.id = entry[value]
                        options.push(entry)
                    }
                })
            }
            this.refreshstats()

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
            if(value==null)
                label = field+':null'
            else if(value==undefined || value== 'undefined')
                label = field+':undefined'
            else if (field=='structure')
                label = this.$options.filters.structureName(value)
            else if (field=='profile_scanner_brand')
                label = value
            else if (field=='profile_label')
                label = value
            else if (field=='analysis_status')
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

            let query_res_x = await this.callStats({ groupBy: [xField], where: this.selectedWhereParams(this.headers) });
            
            let query_res_xy = await this.callStats({ groupBy: [xField, yField], where: this.selectedWhereParams(this.headers) });
    
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

        callStats: async function ({groupBy=[], where=[]}) {
        
            // var query_res = [{"depth_grouped":320,"frequency_grouped":4,"number_of_frames":1400,"number_of_files":"14","number_of_analyses":"2","number_of_patients":"2","number_of_operator":"1","operators":[1001]},{"depth_grouped":240,"frequency_grouped":4,"number_of_frames":3900,"number_of_files":"39","number_of_analyses":"4","number_of_patients":"3","number_of_operator":"2","operators":[1001,1206]},{"depth_grouped":160,"frequency_grouped":6,"number_of_frames":35,"number_of_files":"1","number_of_analyses":"1","number_of_patients":"1","number_of_operator":"1","operators":[1001]},{"depth_grouped":160,"frequency_grouped":4,"number_of_frames":32959,"number_of_files":"324","number_of_analyses":"28","number_of_patients":"28","number_of_operator":"3","operators":[1001,1014,1206]},{"depth_grouped":120,"frequency_grouped":null,"number_of_frames":12194,"number_of_files":"76","number_of_analyses":"7","number_of_patients":"7","number_of_operator":"1","operators":[1001]},{"depth_grouped":120,"frequency_grouped":6,"number_of_frames":33336,"number_of_files":"148","number_of_analyses":"17","number_of_patients":"15","number_of_operator":"3","operators":[1001,1014,1255]},{"depth_grouped":120,"frequency_grouped":4,"number_of_frames":63303,"number_of_files":"354","number_of_analyses":"36","number_of_patients":"34","number_of_operator":"2","operators":[1014,1255]},{"depth_grouped":80,"frequency_grouped":null,"number_of_frames":10740,"number_of_files":"67","number_of_analyses":"6","number_of_patients":"5","number_of_operator":"1","operators":[1001]},{"depth_grouped":80,"frequency_grouped":6,"number_of_frames":192712,"number_of_files":"812","number_of_analyses":"65","number_of_patients":"49","number_of_operator":"3","operators":[1001,1014,1255]},{"depth_grouped":80,"frequency_grouped":4,"number_of_frames":85268,"number_of_files":"625","number_of_analyses":"58","number_of_patients":"58","number_of_operator":"4","operators":[1001,1014,1206,1255]},{"depth_grouped":80,"frequency_grouped":2,"number_of_frames":126,"number_of_files":"1","number_of_analyses":"1","number_of_patients":"1","number_of_operator":"1","operators":[1014]},{"depth_grouped":40,"frequency_grouped":10,"number_of_frames":552,"number_of_files":"3","number_of_analyses":"1","number_of_patients":"1","number_of_operator":"1","operators":[1255]},{"depth_grouped":40,"frequency_grouped":6,"number_of_frames":1040,"number_of_files":"5","number_of_analyses":"3","number_of_patients":"3","number_of_operator":"2","operators":[1001,1014]}];
            let queries = []
    
            for (field of groupBy) {
                if(field=="depth")
                    queries.push('groupBy=depth'+this.groupDepth)
                // queries.push('groupBy=depth[50)[60,80)[80,100](100,120](120,140)[140,180][220][305]')//'groupBy=depth[20,60)[60,80)[80,100](100,120](120,140)[140,180][220,260][300,340]'
                else if(field=="frequency")
                    queries.push('groupBy=frequency'+this.groupFrequency)
                // queries.push('groupBy=frequency[2.5][3.5,4.5)[4.5,5.5)[5.5,6.5)[6.5,7.5)[10]')
                else if(field=="pixel_density" || field=="structure" || field=="rating_operator" || field=="analysis_status" || field=="profile_scanner_brand")
                    queries.push('groupBy='+field)
                else
                    queries.push('groupBy='+field)
            }
            for (field of where) {
                queries.push('where='+field)
            }
                
            if (this.roundDepth!="") queries.push('roundDepthBy='+this.roundDepth)
            if (this.roundFrequency!="") queries.push('roundFrequencyBy='+this.roundFrequency)
            if (this.roundPixelDensity!="") queries.push('roundPixelDensityBy='+this.roundPixelDensity)
            
            return query_res = await fetch('../api/stats?'+queries.join('&'))
                .then((resp) => resp.json()) // Transform the data into json
                .catch( error => console.error(error) ); // If there is any error you will catch them here
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
                        if(value=="file_area_code" || value=="profile_scanner_brand")
                            whereOR.push(value+"='"+sel+"'");
                        else
                            whereOR.push(value+"="+sel);
                }
                if(whereOR.length>0)
                queryParams.push(whereOR.join(" OR "));
            }
            return queryParams;
        },

        getFilterOfHeader: function (header) {
            let filter = this.$options.filters[header.filterName]
            if ( filter != undefined )
                return filter
            else // default filter
                return (id) => (id!=null?id:'null')
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
                    <query-binder
                        query-field="number_of"
                        v-model="valueOf"
                        :options="valueOfOptions"
                        options-value-field="value"
                    ></query-binder>
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
                    <query-binder
                        :query-field="key"
                        v-model="field.value"
                        :options="fieldOptions"
                        options-value-field="value"
                    ></query-binder>
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
                    <query-binder
                        query-field="roundDepth"
                        v-model="roundDepth"
                    ></query-binder>
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
                    <query-binder
                        query-field="groupDepth"
                        v-model="groupDepth"
                    ></query-binder>
                    <v-text-field
                        v-model="groupDepth"
                        label="Depth grouping"
                        placeholder="[50)[60,80)[80,100](100,120](120,140)[140,180][220][305]"
                        hint="Intervals with limits included [closed] or excluded (open) e.g. [3.1,5](1,4.5)[1,2)"
                    ></v-text-field>
                </v-col>

                <v-col
                    class="d-flex"
                    cols="12"
                    sm="2"
                >
                    <query-binder
                        query-field="roundFrequency"
                        v-model="roundFrequency"
                    ></query-binder>
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
                    <query-binder
                        query-field="groupFrequency"
                        v-model="groupFrequency"
                    ></query-binder>
                    <v-text-field
                        v-model="groupFrequency"
                        label="Frequency grouping"
                        placeholder="[50)[60,80)[80,100](100,120](120,140)[140,180][220][305]"
                        hint="Intervals with limits included [closed] or excluded (open) e.g. [3.1,5](1,4.5)[1,2)"
                    ></v-text-field>
                </v-col>

                <v-col
                    class="d-flex"
                    cols="12"
                    sm="2"
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
                    sm="4"
                >
                    <div id="v-text-field"
                        _:value="analysisIds"
                        _v-on:change="analysisIds = $event.replaceAll(' ','').split(',').filter(id => id!='' && id!=undefined && id!=null)"
                        _label="Analysis ids"
                        _placeholder="1081"
                        _hint="Coma separated ids"
                    ></div>
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
                        hint="Intervals with limits included [closed] or excluded (open) e.g. [3.1,5](1,4.5)[1,2)"
                    ></v-text-field>
                </v-col>
            </v-row>










            
            <v-row align="center">
                <v-col
                    class="d-flex"
                    cols="12"
                    sm="3"
                    v-for="column in headers"
                >
                    <editable-select
                        v-if="column.text"
                        v-model="column.select"
                        :options="column.options"
                        options-value="id"
                        :options-text="opt => getFilterOfHeader(column)(opt.id) + ' - ' + opt[valueOf] + ' ' + valueOf.split('_').splice(-1)"
                        :label="column.text"
                        :optionsHide="o => o.number_of_files!=0"
                        v-on:input="refreshstats"
                    ></editable-select>

                </v-col>
            </v-row>



            
            <div id="sankey_multiple" style="width: 100%; height: 500px; overflow:visible"></div>

        </v-container>
    `
}
Vue.component('sankey', sankey)
