var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
    urlParams[decode(match[1])] = decode(match[2]);
})();



globalThis.segment = {
    // props: ['patient_id', 'analysis_id', 'area_code'],
    data: () => {
        return {
            e1: 1,
            segments: 1,
            patient_id: urlParams.patient_id,
            analysis_id: urlParams.analysis_id,
            area_code: urlParams.area_code,
            metadata: [],
            approvals: [],
            video: {},
            FPS: null,
            cropping_bounds: {x:0},
            video_current_time: 0,
            video_duration: 0,
            video_trim: [0,0],
            segmentation_tool: null,
            player: null,
            tab: null
        }
    },
	
    watch: {
        video_duration: function (duration) {
            this.video_trim = [0, duration]
        },
        video_trim: function (val) {
            console.log("videoTrimed at " + val)
            this.player.play()
            this.player.pause()
        }
    },
    // created() {
    //     var scripts = [
    //         "/vendors/video.js/video.min.js",
    //         "/segment/js/fetch.js",
    //         "/segment/js/metadata-form.js",
    //         "/segment/js/segments-table.js",
    //         "/segment/js/cropping-tool.js",
    //         "/segment/js/segmentation-tool.js"
    //     ];
    //     scripts.forEach(script => {
    //         let tag = document.createElement("script");
    //         tag.setAttribute("src", script);
    //         document.head.appendChild(tag);
    //     });
    // },
    async mounted () {

        let vue_this = this;

        fetchRawMetadata().then( response => {
            console.log('Raw matadata:', response)
        })
        fetchMp4Metadata().then( response => {
            console.log('Mp4 matadata:', response)
            this.FPS = Function(`'use strict'; return (${response.r_frame_rate})`)()
        })

        // const statusMap = {
        //     1: 'Suspect',
        //     2: 'Positive',
        //     3: 'Negative',
        //     4: 'Post covid'
        // }
        fetchMetadata().then( response => {
            console.log('Matadata:', response)
            this.metadata = response
            // this.metadata.analysis_status_text = statusMap[this.metadata.analysis_status]
        })
        fetchApprovals().then( response => {
            console.log('Approvals:', response)
            this.approvals = response
        })
        
        // this.$refs.my_video.player.ready( () => {
        //     console.log("my_video", this.$refs.my_video)
        //     console.log("player", this.$refs.my_video.player)
        //     console.log("html5_player", this.$refs.my_video.html5_player)
        //     this.player = this.$refs.my_video.player
        // })

    },
    filters: {
        date: function(str) {
            if (!str) { return '(n/a)'; }
            str = new Date(str);
            return str.getFullYear() + '-' + ((str.getMonth() < 9) ? '0' : '') + (str.getMonth() + 1) + '-' +
            ((str.getDate() < 10) ? '0' : '') + str.getDate() + ' ' +
            str.getHours() + ':' + ((str.getMinutes() < 10) ? '0' : '') + str.getMinutes();
        }
    },
    methods: {
        changeStep: function (step) {
            console.log("step: " + step)
            if(step==3) {
                console.log(this.$refs)
                this.segmentation_tool = this.$refs["segmentation_tool"]
                console.log("segmentation_tool: " + this.segmentation_tool)
            }
        },
        // croppingToolMyEvent: function (bounds) {
        //     this.cropping_bounds = bounds
        //     // this.$refs.segmentation_tool.setCroppingBounds(bounds)
        // },
        confirmMetadata: async function () {
            console.log("confirmMetadata")
            // this.$refs.metadata_form.confirm()
            this.metadata.cut_beginning = this.video_trim[0]
            this.metadata.cut_end = this.video_trim[1]
            console.log(this.metadata)
            await postApproval(this.metadata)
            // postVideoTrim(this.video_trim)
            this.approvals = await fetchApprovals()
        },
        confirmCrop: function () {
            console.log("confirmCrop")
            postCrop({bounds: this.cropping_bounds})
        },
        deleteApproval: async function (approval_id) {
            await deleteApproval(approval_id)
            this.approvals = await fetchApprovals()
        }
    },
    template: `
        <div>

            
            <div>
                http://iclus-web.bluetensor.ai/
                <a v-bind:href="'http://iclus-web.bluetensor.ai/operators/details/' + metadata.operator_id">
                    operator {{ metadata.operator_id }} ( {{ metadata.operator_name }} )
                </a>
                /
                <a v-bind:href="'http://iclus-web.bluetensor.ai/patients/details/' + patient_id">
                    patient {{ patient_id }} ( {{ metadata.patient_key }} )
                </a>
                /
                <a v-bind:href="'http://iclus-web.bluetensor.ai/analisys/details/' + analysis_id">
                    analysis {{ analysis_id }} 
                </a>
                /area {{ area_code }}
                /
                status {{ metadata.analysis_status }} "{{ metadata.analysis_status_text }}"
                /
                rating {{ (metadata.rating_operator?metadata.rating_operator:"---") }}
                /
                frames {{ metadata.frames }}
            </div>

            <v-container fluid>

                <div style="display: flex">

                    <div class="left" style="position: relative; width: 500px; display: flex">
                        
                        <div style="width: 95%">




                                <v-stepper
                                v-model="e1"
                                vertical
                                @change="changeStep"
                                >

                                    <v-stepper-step
                                        :complete="e1 > 1"
                                        step="1"
                                        editable
                                        v-bind:editable="e1 > 1"
                                    >
                                        Metadata ( {{ (approvals.length>0?'Confirmed':'Still to be approved!') }} )
                                    </v-stepper-step>
                            
                                    <v-stepper-content step="1">
                                        <v-card
                                            class="mb-12"
                                        >
            
                                            <!-- metadata-form-mo
                                                ref="metadata_form"
                                                v-bind:metadata="metadata"
                                                v-bind:video_duration="video_duration"

                                                v-on:update:video_trim="video_trim = $event"
                                            >
                                            </metadata-form-mo-->

                                            <form>

                                                <v-row>
                                                    <v-col
                                                        cols="12"
                                                        md="6"
                                                    >
                                                        <v-text-field
                                                            label="Depth [mm]"
                                                            v-model="metadata.depth"
                                                        ></v-text-field>
                                                    </v-col>             
                                                    <v-col
                                                        cols="12"
                                                        md="6"
                                                    >  
                                                        <v-text-field
                                                            label="Frequency"
                                                            v-model="metadata.frequency"
                                                        ></v-text-field>
                                                                     
                                                    </v-col>
                                                </v-row>

                                                <v-row>
                                                    <v-col
                                                        cols="12"
                                                        md="6"
                                                    >
                                                        <v-text-field
                                                            label="Focal point [mm]"
                                                            v-model="metadata.focal_point"
                                                        ></v-text-field>   
                                                    </v-col>             
                                                    <v-col
                                                        cols="12"
                                                        md="6"
                                                    >  
                                                        <v-text-field
                                                            label="Pixel density [pixels/cm]"
                                                            v-model="metadata.pixel_density"
                                                        ></v-text-field>
                                                    
                                                    </v-col>
                                                </v-row>

                                                <v-subheader>
                                                    <v-icon>
                                                        mdi-box-cutter
                                                    </v-icon>
                                                    Cut video
                                                </v-subheader>

                                                <v-range-slider
                                                    v-bind:hint="'New video length is ' + Math.round( (video_trim[1]-video_trim[0])*1000 ) /1000 + ' secs' "
                                                    v-bind:max="video_duration"
                                                    :min="0"
                                                    step="0.01"
                                                    v-model="video_trim"
                                                >
                                                    <template v-slot:prepend>
                                                        <v-text-field
                                                            v-bind:value="video_trim[0]"
                                                            label="Start at"
                                                            class="mt-0 pt-0"
                                                            hide-details
                                                            type="number"
                                                            step="0.01"
                                                            style="width: 60px"
                                                            @change="$set(video_trim, 0, $event)"
                                                        ></v-text-field>

                                                        <v-tooltip bottom>
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-btn icon
                                                                    v-on:click="$set(video_trim, 0, video_current_time)"
                                                                    v-bind="attrs"
                                                                    v-on="on"
                                                                >
                                                                    <v-icon> mdi-timer </v-icon>
                                                                </v-btn>
                                                            </template>
                                                            <span>
                                                                Use current time.
                                                                Cut at {{video_current_time}} seconds
                                                            </span>
                                                        </v-tooltip>

                                                    </template>
                                                    <template v-slot:append>
                                                        <v-text-field
                                                            v-bind:value="video_trim[1]"
                                                            label="End at"
                                                            class="mt-0 pt-0"
                                                            hide-details
                                                            type="number"
                                                            step="0.01"
                                                            style="width: 60px"
                                                            @change="$set(video_trim, 1, $event)"
                                                        ></v-text-field>
                                                        
                                                        <v-tooltip bottom>
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-btn icon
                                                                    v-on:click="$set(video_trim, 1, video_current_time)"
                                                                    v-bind="attrs"
                                                                    v-on="on"
                                                                >
                                                                    <v-icon> mdi-timer </v-icon>
                                                                </v-btn>
                                                            </template>
                                                            <span>
                                                                Use current time.
                                                                Cut at {{video_current_time}} seconds
                                                            </span>
                                                        </v-tooltip>

                                                    </template>
                                                </v-range-slider>

                                                <v-divider></v-divider>

                                                <v-textarea
                                                    prepend-icon="mdi-comment"
                                                    label="Comment"
                                                    v-model="metadata.comment"
                                                ></v-textarea>

                                            </form>
                                        

                                            <v-timeline reverse dense>

                                                <template v-if="approvals.length<1">
                                                <v-timeline-item>
                                                <v-card class="elevation-2">
                                                <v-card-text>
                                                    Still to be approved!
                                                </v-card-text>
                                                </v-card>
                                                </v-timeline-item>
                                                </template>

                                                <v-timeline-item
                                                    v-for="item in approvals"
                                                    :key="item.approval_id"
                                                >
                                                    <v-card class="elevation-2">
                                                    <v-card-title class="text-h5">
                                                        User {{item.user_id}}
                                                    </v-card-title>
                                                    <v-card-text>
                                                        {{item.updated_at | date}}
                                                        <v-btn x-small :hint="item.approval_id" type='button' v-on:click="deleteApproval(item.approval_id)">
                                                            <v-icon> mdi-delete </v-icon>
                                                        </v-btn>
                                                        <br/>
                                                        Depth: {{item.depth}}
                                                        Frequency: {{item.frequency}}
                                                        <br/>
                                                        Focal_point: {{item.focal_point}}
                                                        Pixel_density: {{item.pixel_density}}
                                                        <br/>
                                                        Cut_beginning: {{item.cut_beginning}}
                                                        Cut_end: {{item.cut_end}}
                                                        <br/>
                                                        Comment: {{item.comment}}
                                                    </v-card-text>
                                                    </v-card>
                                                </v-timeline-item>
                                            </v-timeline>
                                    
                                        </v-card>
                                
                                        <v-btn
                                            color="primary"
                                            @click="e1 = 2; confirmMetadata()"
                                        >
                                            Submit
                                        </v-btn>
                                
                                        <v-btn text
                                        @click="e1 = 2"
                                        >
                                            Discard changes
                                        </v-btn>
                                        
                                    </v-stepper-content>
                            
                                    <v-stepper-step
                                        :complete="e1 > 2"
                                        step="2"
                                        v-bind:editable="e1 > 2"
                                    >
                                        Crop
                                    </v-stepper-step>
                            
                                    <v-stepper-content step="2">
                                        <v-card
                                            class="mb-12"
                                        >
                                            <span>x: {{ cropping_bounds.x }}</span>
                                            <br>
                                            <span>y: {{ cropping_bounds.y }}</span>
                                            <br>
                                            <span>w: {{ cropping_bounds.w }}</span>
                                            <br>
                                            <span>h: {{ cropping_bounds.h }}</span>
                                            <br>
                                            <span>th: {{ cropping_bounds.th }}</span>
                                            <br>
                                            <span>bh: {{ cropping_bounds.bh }}</span>
                                            <br>
                                            <span>ch: {{ cropping_bounds.ch }}</span>
                                        </v-card>
                                
                                        <v-btn
                                            color="primary"
                                            @click="e1 = 3; confirmCrop(); changeStep(3)"
                                        >
                                            Submit crop
                                        </v-btn>
                                
                                        <v-btn text
                                        @click="e1 = 3; changeStep(3)"
                                        >
                                            Discard changes
                                        </v-btn>
                                    </v-stepper-content>
                            
                                    <v-stepper-step
                                        step="3"
                                        v-bind:editable="e1 > 3"
                                    >
                                        Segment
                                    </v-stepper-step>
                                    
                                    <v-stepper-content step="3">
                                        <v-card
                                            class="mb-12"
                                        >
                                            <segment-table
                                                v-bind:segmentation-tool="segmentation_tool"
                                                v-bind:player="player"
                                            ></segment-table>
                                        </v-card>
                                        
                                    </v-stepper-content>

                                </v-stepper>





                        </div>

                    </div>

                    <div class="canvas-container" style="padding-bottom: 80px; display: grid; align-content: flex-start">

                        <div>
                            <div id="seekInfo"></div>

                            <v-btn @click="$refs.my_video.seekFrames(-1)"> <| -1 frame </v-btn>
                            <span id="currentTimeCode"></span>
                            <v-btn @click="$refs.my_video.seekFrames(1)"> |> +1 frame </v-btn>
                        </div>

                        <span class="wrapper" style="top: 80px; position: relative">

                            <img
                                v-if="e1 == 1"
                                class="image"
                                v-bind:src="'../unzipped/'+patient_id+'/'+analysis_id+'/raw/annotation_'+analysis_id+'_'+area_code+'.png'"
                                style="width: 880px; position: absolute; z-index: 1; max-height: none !important;"
                            />

                            <cropping-tool
                                v-show="e1 == 2"
                                v-on:bounds-update="cropping_bounds = $event"
                            ></cropping-tool>

                            <segmentation-tool
                                v-show="e1 == 3"
                                ref="segmentation_tool"
                                v-bind:cropping-bounds="cropping_bounds"
                            ></segmentation-tool>

                            <video-player
                                id="my-video-old"
                                ref="my_video"
                                v-bind:FPS="FPS"
                                v-bind:video_trim="video_trim"
                                v-on:ready="player = $event; video_duration = $event.duration()"
                                v-on:timeupdate="video_current_time = $event"
                            >
                                <source
                                    v-bind:src="'../mp4/'+patient_id+'/'+analysis_id+'/'+area_code+'/video'"
                                    type="video/mp4"
                                    preload autoplay
                                />
                            </video-player>

                            <!-- <div class="positioner" style="z-index: 2; position: absolute; top: 0px;"> -->
                            <!--    <div style="padding-top: 74.9%;"> --><!-- padding-top must match the aspect ratio of your image = height / width * 100% -->
                                    <!-- <canvas width="1068" height="800"></canvas> -->
                                <!-- </div> -->
                            <!-- </div> -->

                        </span>
                    </div>

                    <div class="right" style="top: 60px; position: relative; width: 50px">
                        <br>
                    </div>
                
                </div>


            </v-container>

        </div>
    `
}
Vue.component('segment', segment)



