(function(undefined) {
    "use strict";

    var jimple = module.exports = function jimple() {
        this.values = {};
        this.tagged = {};
        this.shared = {};
    };

    jimple.prototype = {
        use: function(deps, module) {
            if (deps.constructor.name === "Array") {
                deps = deps || [];
                deps.forEach(
                    function(value, key) {
                        deps[key] = this.get(value);
                    },
                    this
                );
                deps.push(this);

                return module.apply(null, deps);
            }

            if (typeof deps === 'function') {
                return deps(this);
            } else {
                return module(this);
            }
        },

        define: function(name, value, tags) {
            if (typeof name !== "string") {
                throw new Error('Argument #1 passed to Jimple.define must be a string identifier')
            }

            if (this.values[name] !== undefined) {
                (this.values[name].tags || []).forEach(
                    function(tag) {
                        this.tagged[tag] = this.tagged[tag].filter(function(service) {
                            return service !== name;
                        });
                    },
                    this
                );

                delete this.values[name];
            }

            if (typeof value !== "function") {
                this.values[name] = function() {
                    return value;
                };
            } else {
                this.values[name] = value;
            }

            this.values[name].tags = tags || [];
            this.values[name].tags.forEach(
                function(tag) {
                    if (!this.tagged[tag]) {
                        this.tagged[tag] = [];
                    }

                    if (this.tagged[tag].indexOf(name) === -1) {
                        this.tagged[tag].push(name);
                    }
                },
                this
            );

            return this;
        },

        share: function(name, code, tags) {
            if (typeof name !== "string") {
                throw new Error('Argument #1 passed to Jimple.share must be a string identifier')
            }

            if (typeof code !== "function") {
                throw new Error('Argument #2 passed to Jimple.share must be a function')
            }

            if (this.shared[name] !== undefined) {
                delete this.shared[name];
            }

            return this.define(
                name,
                function(jimple) {
                    if (jimple.shared[name] === undefined) {
                        jimple.shared[name] = code(jimple);
                    }

                    return jimple.shared[name];
                },
                tags || []
            );
        },

        extend: function(name, code, tags) {
            if (typeof name !== "string") {
                throw new Error('Argument #1 passed to Jimple.extend must be a string identifier')
            }

            if (typeof code !== "function") {
                throw new Error('Argument #2 passed to Jimple.extend must be a function')
            }

            var service = this.get(name);
            return this.share(
                name,
                function(jimple) {
                    return code(service, jimple);
                },
                tags || this.values[name].tags
            );
        },

        exists: function(name) {
            if (typeof name !== "string") {
                throw new Error('Argument #1 passed to Jimple.exists must be a string identifier')
            }

            return (this.keys().indexOf(name) > -1);
        },

        get: function(name) {
            if (typeof name !== "string") {
                throw new Error('Argument #1 passed to Jimple.get must be a string identifier')
            }

            return this.raw(name)(this);
        },

        getTagged: function(tag) {
            if (typeof tag !== "string") {
                throw new Error('Argument #1 passed to Jimple.getTagged must be a string identifier')
            }

            return this.tagged[tag] || [];
        },

        keys: function() {
            return Object.keys(this.values);
        },

        protect: function(code) {
            if (typeof code !== "function") {
                throw new Error('Argument #1 passed to Jimple.protect must be a function')
            }

            return function() {
                return code;
            };
        },

        raw: function(name) {
            if (typeof name !== "string") {
                throw new Error('Argument #1 passed to Jimple.raw must be a string identifier')
            }

            if (this.exists(name) === false) {
                throw new Error("Identifier " + name + " is not defined");
            }

            return this.values[name];
        }
    };
})();
