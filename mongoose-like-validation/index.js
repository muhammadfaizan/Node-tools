/**
     *
     * @param schema
     * @param payload
     * @returns {Promise.<*>}
     */
    validatePayload: function(schema, payload) {
        if (!schema || schema.constructor != Object) {
            throw new Error("Invalid payload validator Schema. See utils.js");
        }

        return Promise.all(Object.keys(schema).map(k => {

            // check for required
            if (schema[k].required && !payload[k]){
                throw new Error(`'${k}' is missing in payloads`)
            }

            // check for "set" function
            if (payload[k] && schema[k].set && schema[k].set.constructor === Function) {
                payload[k] = schema[k].set(payload[k])
            }

            // check for Type
            if (schema[k].type && payload[k] && payload[k].constructor != schema[k].type) {
                throw new Error(`'${k}' should be of '${schema[k].type.name}' type`)
            }
            // if there is no Type || type is not any Constructor
            if (!schema[k].type ||
                (schema[k].type !== Boolean &&
                    schema[k].type !== Number &&
                    schema[k].type !== Array &&
                    schema[k].type !== String &&
                    schema[k].type !== Object)) {
                return this.validatePayload(schema[k], payload[k]);
            }
            if (schema[k].constructor === Array && schema[k].length > 0) {
                return Promise.all(payload[k].map(doc => {
                    return this.validatePayload(schema[k][0], doc)
                }))
            }
            if (!payload[k] && schema[k].default) {
                if (schema[k].default.constructor == Function) {
                    payload[k] = schema[k].default();
                } else {
                    payload[k] = schema[k].default;
                }
            }
            return Promise.resolve(payload[k])
        }))
        .then(data =>{
            return payload
        })
    }