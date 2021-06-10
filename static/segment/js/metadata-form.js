

Vue.component('metadata-form', {
    data: () => {
        return {
            
        }
    },
    props: ['segmentation_id', 'analysis_id', 'area_code', 'metadata'],
    mounted () {
        // fetchMetadata().then(response => (this.metadata = response)) //get from prop metadata
    },
    methods: {
        confirm: async function () {
            await postApproval(this.metadata)
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
                        
        </form>
    `
})


