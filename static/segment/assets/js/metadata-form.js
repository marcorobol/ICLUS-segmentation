

Vue.component('metadata-form', {
    data: () => {
        return {metadata: {}}
    },
    mounted () {
        fetchMetadata().then(response => (this.metadata = response))
    },
    methods: {
        confirm: async function () {
            await postApproval(this.metadata)
        }
    },
    props: ['segmentation_id', 'analysis_id', 'area_code', 'timestamp', 'points'],
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


