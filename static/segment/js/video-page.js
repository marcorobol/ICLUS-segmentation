
Vue.component('video-page', {
    data: () => {
        return {metadata: []}
    },
    mounted () {
        fetchMetadata().then(response => (this.metadata = response))
    },
    props: ['patient_id', 'analysis_id', 'area_code'],
    template: `
        <div style="display: flex">

            <div class="left" style="position: relative; width: 400px; display: flex">
                
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

                                    <metadata-form></metadata-form>
                            
                                </v-card>
                        
                                <v-btn
                                    color="primary"
                                    @click="e1 = 2"
                                >
                                    Confirm metadata
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
                                    height="200px"
                                ></v-card>
                        
                                <v-btn
                                    color="primary"
                                    @click="e1 = 3"
                                >
                                    Confirm crop
                                </v-btn>
                        
                                <v-btn text
                                @click="e1 = 1"
                                >
                                    Review metadata
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
                                    height="200px"
                                >
                                    <segment-table></segment-table>
                                </v-card>
                        
                                <v-btn
                                    color="primary"
                                    @click="e1 = 1"
                                >
                                    Confirm segmentation
                                </v-btn>
                        
                                <v-btn text
                                    @click="e1 = 2"
                                >
                                    Redo crop
                                </v-btn>
                            </v-stepper-content>

                        </v-stepper>





                </div>

            </div>

            <div class="canvas-container">
                <span class="wrapper" style="top: 60px; position: relative">

                    <img class="image" src="<%= annotationPngUrl %>" style="width: 880px; position: absolute; z-index: 1; max-height: none !important;"/>

                    <video
                        id="my-video"
                        class="video-js vjs-theme-fantasy"
                        controls
                        preload="auto"
                        width="880"
                        data-setup="{}"
                        muted
                        preload
                        autoplay
                    >
                        <source src="<%= rawVideoUrl %>" type="video/mp4" preload autoplay/>
                        <p class="vjs-no-js">
                            To view this video please enable JavaScript, and consider upgrading to a
                            web browser that
                            <a href="https://videojs.com/html5-video-support/" target="_blank">
                                supports HTML5 video
                            </a>
                        </p>
                    </video>

                    <cropping-tool v-if="e1 == 2" ref="cropping_tool"></cropping-tool>

                    <segmentation-tool v-if="e1 == 3" ref="segmentation_tool"></segmentation-tool>

                    <!-- <div class="positioner" style="z-index: 2; position: absolute; top: 0px;"> -->
                    <!--    <div style="padding-top: 74.9%;"> --><!-- padding-top must match the aspect ratio of your image = height / width * 100% -->
                            <!-- <canvas width="1068" height="800"></canvas> -->
                        <!-- </div> -->
                    <!-- </div> -->

                </span>
            </div>

            <div class="right" style="top: 60px; position: relative; width: 200px">
                
                <a href="http://iclus-web.bluetensor.ai/patients/details/${urlParams.patient_id}">Patient on ICLUS-WEB</a>
                <br>
                <a href="http://iclus-web.bluetensor.ai/analisys/details/${urlParams.analysis_id}">Analysis on ICLUS-WEB</a>
                <br>
                <br>

                <label>time:</label><br>
                <input type="text" id="time" disabled><br>

            </div>

        </div>
    `
});
