globalThis.query = {}
globalThis.toBeRerouted = false

globalThis.queryBinder = {

    // v-model prop can be used to pass bind to "value" and watch "input"
    props: [
        'queryField',       // Field name to be used in the query
        'value',            // Receiving binded value OR list of values
        'options',          // Array of valid options
        'optionsValueField' // Field name of options to lookup value
    ],

    watch: {
        $route: {
            handler: async function(to, from) {

                // console.log('route changed for', this.queryField, to)

                // to handle url changed by a link !!!
                await this.fromRouteToModel()

                // to handle refresh url when coming from a link without query params !!!
                this.fromModelToRoute(this.value,this.value)

            },
            // cannot start fromRouteToModel here otherwise I don't know how to wait before start watching the model
            immediate: false
        }
    },

    created: async function () {
        
        // just once and before all !!!
        await this.fromRouteToModel()

        // then start monitor: at every change in the model
        this.$watch( 'value', this.fromModelToRoute, {immediate: true} )

    },

    methods: {
        fromRouteToModel: async function () {

            // console.log('binding', this.queryField, 'fromRoute', this.$router.currentRoute.query[this.queryField], 'toModel', this.value)

            let returned = []
            
            // For all query values under the key specified by this.queryField
            let queryValues = this.$router.currentRoute.query[this.queryField]
            for (string of ( queryValues ? ( Array.isArray(queryValues) ? queryValues : [queryValues] ) : [] ) ) {

                // if no options are provided use the value
                let matching = (string=='null'?null:string)

                // find a match in the options comparing the field this.optionsValueField
                if (this.options) {
                    matching = this.options.find( opt => ''+opt[this.optionsValueField] == ''+string )
                
                    // if no match skip
                    if ( matching==undefined )
                        continue
                    
                    // extract value in field this.optionsValueField from matching option
                    matching = matching [this.optionsValueField]
                }
                
                // if returning model is an array push otherwise assign current value
                if ( Array.isArray(this.value) && !returned.includes(matching) )
                    returned.push(matching)
                else
                    returned = matching
            }
            
            // only if returned has been modified
            if ( !Array.isArray(returned) || returned.length > 0 )
                // Emitting default "input" event used by v-model
                await this.$emit('input', returned)

        },

        fromModelToRoute: function (newValue, oldValue) {

            // console.log('binding', this.queryField, 'fromModel', this.value, 'ToRoute', this.$router.currentRoute.query[this.queryField])
            
            // only on init (or at least until no binder has set toBeRerouted)
            if (toBeRerouted==false) {
                query = {}
                // Copy all current query params
                if (this.$router.currentRoute.query)
                    for (let key of Object.keys( this.$router.currentRoute.query ) )
                        query[key] = this.$router.currentRoute.query[key]
            }
            
            // Case: model has a single value
            if ( !Array.isArray(this.value) ) {
                let value = (this.value==null?'null':this.value)
                if ( query[this.queryField] != value ) {
                    toBeRerouted = true
                    query[this.queryField] = value
                }
            }
            // Case: model has multiple values
            else {
                // query[this.queryField] = this.value
                if ( !Array.isArray(query[this.queryField]) )
                    if ( query[this.queryField] )
                        query[this.queryField] = [query[this.queryField]]
                    else
                        query[this.queryField] = []
                        
                for ( item of this.value ) {
                    item = (item==null?'null':item)
                    if ( !query[this.queryField].includes(item) ) {
                        toBeRerouted = true
                        query[this.queryField].push(item)
                    }
                }
            }

            this.$nextTick( () => {
                if ( toBeRerouted ) {
                    toBeRerouted = false
                    // console.log('rerouting from binder', this.queryField, this.value, 'to ', query)
                    this.$router.push( { query: query } )
                }
            } )

        },
    },

    template: `<span/>`

}

Vue.component('query-binder', queryBinder)
