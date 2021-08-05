

globalThis.editableSelect = {

    props: [
        'value',
        'options',
        'optionsValue',
        'optionsText',
        'optionsHide',
        'label'
    ],

    data: () => {
        return {
            select: [],
            hideEmptyOptions: false
        }
    },

    mounted: async function () {
        
    },

    watch: {

        value: {
            handler: async function(to, from) {
                this.select = to
            },
            immediate: true
        }

    },

    filters: {
        listOfIds: function(list) {
            return (list?list.map( e => (e==null?'null':e) ).join(', '):'')
        }
    },

    methods: {
        textIntoSelect: function (text) {
            let options = this.options
                select = this.select
            
            // clear current select
            select.splice(0);
            
            // loop over keys
            if (text)
                for (string of text.replaceAll(' ','').split(',')) {
                    let found = options.find( opt => ''+opt.id == ''+string )
                    if ( found!=undefined && !select.includes(found.id) )
                        select.push(found.id)
                }
            
            this.$emit('input', select)
        }
    },

    template: `
        <v-select
            v-model="select"
            :items="hideEmptyOptions ? options.filter( o => optionsHide(o) || select.includes(o.id) ) : options"
            :item-value="optionsValue"
            :item-text="optionsText"
            :label="label"
            multiple
            chips
            v-on:change="$emit('input', select)"
        >
            <template v-slot:item_not_used_template="{ parent, item, on, attrs }">
                <v-list-item
                    ripple
                    @click="on.click"
                >
                    <v-list-item-action>
                        <v-icon v-if="attrs.inputValue">mdi-checkbox-marked</v-icon>
                        <v-icon v-else>mdi-checkbox-blank-outline</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ item.label }} {{ parent.props }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </template>

            <template v-slot:prepend-item>
                <v-list-item
                >
                    <v-list-item-action>
                        Filters:
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-textarea
                            name="input-7-1"
                            v-bind:value="select | listOfIds"
                            v-on:change="textIntoSelect($event)"
                            hint="Coma separated ids"
                            clearable
                            clear-icon="mdi-close-circle"
                            rows="1"
                            auto-grow
                        ></v-textarea>
                    </v-list-item-content>
                </v-list-item>
                <v-divider class="mt-2"></v-divider>

                <v-list-item>
                    <v-list-item-action>
                        <v-switch
                            v-model="hideEmptyOptions"
                        ></v-switch>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>
                            Hide empty options
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-divider class="mt-2"></v-divider>
            </template>
        </v-select>
    `
}

Vue.component('editable-select', editableSelect)
