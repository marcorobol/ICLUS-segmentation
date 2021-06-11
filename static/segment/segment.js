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
            FPS: null,
            cropping_bounds: {x:0},
            current_video_time: 0,
            video_duration: 0,
            segmentation_tool: null,
            player: null
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

        const statusMap = {
            1: 'Suspect',
            2: 'Positive',
            3: 'Negative',
            4: 'Post covid'
        }
        fetchMetadata().then( response => {
            console.log('Matadata:', response)
            this.metadata = response
            this.metadata.analysis_status_text = statusMap[this.metadata.analysis_status]
        })
        
        this.$refs.my_video.player.offset({
            start: 0,
            end: 10,
            restart_beginning: false //Should the video go to the beginning when it ends
        });

        // this.$refs.my_video.player.ready( () => {
        //     console.log("my_video", this.$refs.my_video)
        //     console.log("player", this.$refs.my_video.player)
        //     console.log("html5_player", this.$refs.my_video.html5_player)
        //     this.player = this.$refs.my_video.player
        // })

    },
    methods: {
        changeStep: function (step) {
            if(step==3) {
                console.log(this.$refs)
                console.log(this.$refs["segmentation_tool"])
                this.segmentation_tool = this.$refs["segmentation_tool"]
            }
        },
        // croppingToolMyEvent: function (bounds) {
        //     this.cropping_bounds = bounds
        //     // this.$refs.segmentation_tool.setCroppingBounds(bounds)
        // },
        confirmMetadata: function () {
            console.log("confirmMetadata")
            this.$refs.metadata_form.confirm()
        },
        confirmCrop: function () {
            console.log("confirmCrop")
            postCrop({bounds: this.cropping_bounds})
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
                                    >
                                        Metadata
                                    </v-stepper-step>
                            
                                    <v-stepper-content step="1">
                                        <v-card
                                            class="mb-12"
                                        >
            
                                            <metadata-form
                                                ref="metadata_form"
                                                v-bind:metadata="metadata"
                                                v-bind:video_duration="video_duration"
                                            >
                                            </metadata-form>
                                    
                                        </v-card>
                                
                                        <v-btn
                                            color="primary"
                                            @click="e1 = 2; confirmMetadata()"
                                        >
                                            Confirm metadata
                                        </v-btn>
                                
                                        <v-btn text
                                            @click="e1 = 2"
                                        >
                                            Skip
                                        </v-btn>
                                        
                                    </v-stepper-content>
                            
                                    <v-stepper-step
                                        :complete="e1 > 2"
                                        step="2"
                                        editable
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
                                            @click="e1 = 3; confirmCrop()"
                                        >
                                            Confirm crop
                                        </v-btn>
                                
                                        <v-btn text
                                        @click="e1 = 3"
                                        >
                                            Skip
                                        </v-btn>
                                    </v-stepper-content>
                            
                                    <v-stepper-step
                                        step="3"
                                        editable
                                    >
                                        Segment
                                    </v-stepper-step>
                                    
                                    <v-stepper-content step="3">
                                        <v-card
                                            class="mb-12"
                                        >
                                            <segment-table
                                                v-bind:current_video_time="current_video_time"
                                                v-bind:segmentation-tool="segmentation_tool"
                                                v-bind:player="player"
                                            ></segment-table>
                                        </v-card>
                                        
                                    </v-stepper-content>

                                </v-stepper>





                        </div>

                    </div>

                    <div class="canvas-container" style="padding-bottom: 80px; display: grid">

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
                                v-on:ready="player = $event"
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



