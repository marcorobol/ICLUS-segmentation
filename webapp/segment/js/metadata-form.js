

Vue.component('metadata-form', {
    data: () => {
        return {
            video_trim: [0, 100]
        }
    },
    computed: {
        // video_trim: function () {
        //   return [0, this.video_duration]
        // }
    },
    watch: {
        video_trim: function (val) {
            console.log( val)
            this.$emit('update:video_trim', val)
        },
        video_duration: function (val) {
            this.video_trim = [0, val]
        }
    },
    props: ['segmentation_id', 'analysis_id', 'area_code', 'metadata', 'video_duration'],
    emits: [ 'update:video_trim' ],
    mounted () {
        // fetchMetadata().then(response => (this.metadata = response)) //get from prop metadata
    },
    methods: {
        confirm: async function () {
            await postApproval(this.metadata)
            //await postVideoTrim(this.video_trim)
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
                        
            <v-text-field
                label="video_duration"
                v-bind:value="video_duration"
            ></v-text-field>
            
            <v-range-slider
                hint="Cut video"
                v-bind:max="video_duration"
                :min="0"
                v-model="video_trim"
            >
                <template v-slot:prepend>
                    <v-text-field
                        v-bind:value="video_trim[0]"
                        class="mt-0 pt-0"
                        hide-details
                        single-line
                        type="number"
                        style="width: 60px"
                        @change="$set(video_trim, 0, $event)"
                    ></v-text-field>
                </template>
                <template v-slot:append>
                    <v-text-field
                        v-bind:value="video_trim[1]"
                        class="mt-0 pt-0"
                        hide-details
                        single-line
                        type="number"
                        style="width: 60px"
                        @change="$set(video_trim, 1, $event)"
                    ></v-text-field>
                </template>
            </v-range-slider>

        </form>
    `
})


