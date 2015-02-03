var q = require('q'),
    columns = module.exports = function columns(websocket) {
        var emit = function(event, namespace, project, column, args) {
            var data = {
                namespace: namespace,
                project: project,
                column: column
            };

            Object.keys(args || {}).forEach(function(key) {
                data[key] = args[key];
            });

            websocket.emit(event, data);

            return column;
            };

        this.notifyEdit = function(namespace, project, column) {
            return emit('column.edit', namespace, project, column);
        };

        this.notifyNew = function(namespace, project, column) {
            return emit('column.new', namespace, project, column);
        };

        this.notifyMove = function(namespace, project, column, from, to) {
            return emit('column.move', namespace, project, column, { from: from, to: to });
        };

        this.notifyRemove = function(namespace, project, column) {
            return emit('column.remove', namespace, project, column);
        };
    };
