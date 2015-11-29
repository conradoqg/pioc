var util = require('./util'),
    glob = require('glob'),
    path = require('path'),
    servicePropertyPrefix = util.servicePropertyPrefix;

var Module = {
    has: function(name) {
        return !!this[servicePropertyPrefix+name];
    },
    value: function(name, service) {
        if(arguments.length === 1) {
            var names = Object.getOwnPropertyNames(name);
            for(var i = 0, len = names.length; i < len; i++) {
                var serviceName = names[i];
                this.value(serviceName, name[serviceName]);
            }
        }
        this[servicePropertyPrefix+name] = {
            factory: function() { return service; },
            singleton: true,
            dependencies: {callInjection: [], propertyInjection: []}
        };
        return this;
    },
    bind: function(name, service) {
        if(arguments.length === 1) {
            var names = Object.getOwnPropertyNames(name);
            for(var i = 0, len = names.length; i < len; i++) {
                var serviceName = names[i];
                this.bind(serviceName, name[serviceName]);
            }
        }
        this[servicePropertyPrefix+name] = {
            factory: this.resolver.getFactory(service),
            singleton: true,
            dependencies: this.resolver.getDependencyList(service)
        };
        return this;
    },
    bindAll: function(prefix, services) {
        if(arguments.length === 1) {
            this.bind(prefix);
        } else {
            var names = Object.getOwnPropertyNames(services);
            for(var i = 0, len = names.length; i < len; i++) {
                var serviceName = names[i];
                this.bind(prefix+serviceName, services[serviceName]);
            }
        }
        this[servicePropertyPrefix+prefix] = {
            factory: this.resolver.getFactory(services),
            singleton: true,
            dependencies: this.resolver.getDependencyList(services)
        };
        return this;
    },
    bindFactory: function(name, service) {
        if(arguments.length === 1) {
            var names = Object.getOwnPropertyNames(name);
            for(var i = 0, len = names.length; i < len; i++) {
                var serviceName = names[i];
                this.bindFactory(serviceName, name[serviceName]);
            }
        }
        this[servicePropertyPrefix+name] = {
            factory: this.resolver.getFactory(service),
            singleton: false,
            dependencies: this.resolver.getDependencyList(service)
        };
        return this;
    },
    load: function(name, filename) {
        if(arguments.length === 1) {
            filename = name;
            name = null;
        }
        var servicePath = path.resolve(process.cwd(), filename),
            service = require(servicePath);
        this.bind(name || (service && (service.$serviceName || service.prototype.$serviceName)) || path.basename(filename, '.js'), service);
        return this;
    },
    loadPath: function(prefix, pathname) {
        var self = this;
        if(arguments.length === 1) {
            pathname = prefix;
            prefix = null;
        }

        var files = glob.sync(pathname);
        files.forEach(function (filename) {
            var servicePath = path.resolve(process.cwd(), filename);
            var service = require(servicePath);
            self.bind((prefix || '') + ((service && (service.$serviceName || service.prototype.$serviceName)) || path.basename(filename, '.js')), service);
        });
        return this;
    },
    loadValue: function(name, filename) {
        if(arguments.length === 1) {
            filename = name;
            name = null;
        }
        var servicePath = path.resolve(process.cwd(), filename),
            service = require(servicePath);
        this.value(name || (service && (service.$serviceName || service.prototype.$serviceName)) || path.basename(filename, '.js'), service);
        return this;
    },
    loadFactory: function(name, filename) {
        if(arguments.length === 1) {
            filename = name;
            name = null;
        }
        var servicePath = path.resolve(process.cwd(), filename),
            service = require(servicePath);
        this.bindFactory(name || (service && (service.$serviceName || service.prototype.$serviceName)) || path.basename(filename, '.js'), service);
        return this;
    },

    create: function() {
        return Object.create(this);
    }
};

module.exports = Module;
