

Vue.component('my-footer', {
    data: () => ({
        links: [
            'Home',
            'About Us',
            'Team',
            'Services',
            'Blog',
            'Contact Us',
        ],
        segmentations_stats: {0:0, 1:0, 2:0, 3:0, "null":0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0},
    }),
    async mounted () {

        query_res = await fetch(`../api/segmentations/stats?groupBy=rate`)
            .then((resp) => resp.json()) // Transform the data into json
            .catch( error => console.error(error) ); // If there is any error you will catch them here
        for (r of query_res) {
            this.segmentations_stats[r.rate] = r.number_of_segmentations
        }
        
    },
    template: `
        <v-footer
            color="primary lighten-1"
            padless
        >
            <v-row
                justify="center"
                no-gutters
            >
                <v-col
                    class="primary py-4 text-center white--text"
                    cols="12"
                >
                    Segmentation progress:

                    <v-chip
                        class="ma-2"
                        color="green"
                    >
                        <v-avatar
                            left
                            class="green darken-2"
                        >
                            {{ segmentations_stats[0] }}
                        </v-avatar>
                        Rated zero
                    </v-chip>
                    <v-chip
                        class="ma-2"
                        color="yellow"
                    >
                        <v-avatar
                            left
                            class="yellow darken-2"
                        >
                            {{ segmentations_stats[1] }}
                        </v-avatar>
                        Rated one
                    </v-chip>
                    <v-chip
                        class="ma-2"
                        color="orange"
                    >
                        <v-avatar
                            left
                            class="orange darken-2"
                        >
                            {{ segmentations_stats[2] }}
                        </v-avatar>
                        Rated two
                    </v-chip>
                    <v-chip
                        class="ma-2"
                        color="red"
                    >
                        <v-avatar
                            left
                            class="red darken-2"
                        >
                            {{ segmentations_stats[3] }}
                        </v-avatar>
                        Rated three
                    </v-chip>

                </v-col>

                <v-col
                    class="primary py-4 text-center white--text"
                    cols="12"
                >
                    <v-chip
                        class="ma-2"
                        color="grey"
                    >
                        <v-avatar
                            left
                            class="grey darken-2"
                        >
                            {{ segmentations_stats["null"] }}
                        </v-avatar>
                        Unlabelled
                    </v-chip>
                    <v-chip
                        class="ma-2"
                        color="grey"
                    >
                        <v-avatar
                            left
                            class="grey darken-2"
                        >
                            {{ segmentations_stats["4"] }}
                        </v-avatar>
                        Consolidation
                    </v-chip>
                    <v-chip
                        class="ma-2"
                        color="grey"
                    >
                        <v-avatar
                            left
                            class="grey darken-2"
                        >
                            {{ segmentations_stats["5"] }}
                        </v-avatar>
                        Pleural Line
                    </v-chip>
                    <v-chip
                        class="ma-2"
                        color="grey"
                    >
                        <v-avatar
                            left
                            class="grey darken-2"
                        >
                            {{ segmentations_stats["6"] }}
                        </v-avatar>
                        Pleural Effusion
                    </v-chip>
                    <v-chip
                        class="ma-2"
                        color="grey"
                    >
                        <v-avatar
                            left
                            class="grey darken-2"
                        >
                            {{ segmentations_stats["7"] }}
                        </v-avatar>
                        Vertical Artifact
                    </v-chip>
                    <v-chip
                        class="ma-2"
                        color="grey"
                    >
                        <v-avatar
                            left
                            class="grey darken-2"
                        >
                            {{ segmentations_stats["8"] }}
                        </v-avatar>
                        White Lung
                    </v-chip>
                    <v-chip
                        class="ma-2"
                        color="grey"
                    >
                        <v-avatar
                            left
                            class="grey darken-2"
                        >
                            {{ segmentations_stats["9"] }}
                        </v-avatar>
                        Horizontal Artifact
                    </v-chip>
                </v-col>

                <v-col
                    class="primary lighten-2 py-4 text-center white--text"
                    cols="12"
                >
                    {{ new Date().getFullYear() }} — <strong>ULTRa Lab — University of Trento</strong>
                </v-col>

            </v-row>
        </v-footer>
    `
})


