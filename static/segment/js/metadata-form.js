

Vue.component('metadata-form', {
    data: () => {
        return {
            videoTrim: [0, 100],
            video_duration: 100
        }
    },
    props: ['segmentation_id', 'analysis_id', 'area_code', 'metadata', 'video_durationN'],
    mounted () {
        // fetchMetadata().then(response => (this.metadata = response)) //get from prop metadata
    },
    methods: {
        confirm: async function () {
            await postApproval(this.metadata)
            //await postVideoTrim(this.videoTrim)
        }
    },
    template: `
        <form>
            
            <v-text-field
                label="Depth"
                v-bind:value="metadata.depth"
            ></v-text-field>
                        
            <v-text-field
                label="Frequency"
                v-bind:value="metadata.frequency"
            ></v-text-field>
                                    
            <v-text-field
                label="Focal point"
                v-bind:value="metadata.focal_point"
            ></v-text-field>
                        
            <v-text-field
                label="Pixel density"
                v-bind:value="metadata.pixel_density"
            ></v-text-field>
            
            <v-range-slider
                hint="Cut video"
                :max="video_duration"
                min="0"
                v-model="videoTrim"
            >
                <template v-slot:prepend>
                    <v-text-field
                        :value="videoTrim[0]"
                        class="mt-0 pt-0"
                        hide-details
                        single-line
                        type="number"
                        style="width: 60px"
                        @change="$set(videoTrim, 0, $event)"
                    ></v-text-field>
                </template>
                <template v-slot:append>
                    <v-text-field
                        :value="videoTrim[1]"
                        class="mt-0 pt-0"
                        hide-details
                        single-line
                        type="number"
                        style="width: 60px"
                        @change="$set(videoTrim, 1, $event)"
                    ></v-text-field>
                </template>
            </v-range-slider>

        </form>
    `
})


