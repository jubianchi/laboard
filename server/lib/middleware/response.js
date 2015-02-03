var response = function (res) {
        return function (items, code) {
            code = code || 200;

            res.status(code).end(JSON.stringify(items || []));
        }
    },
    error = function (res) {
        return function (err, code) {
            code = code || 500;

            if (!err) {
                err = { code: code };
            }

            err.code = err.code || code;

            res.status(err.code).end(JSON.stringify(err));
        }
    };

module.exports = function (req, res, next) {
    res.response = response(res);
    res.error = error(res);

    res.response.ok = function (content) {
        res.response(content, 200);
    };

    res.response.created = function (content) {
        res.response(content, 201);
    };

    res.error.notFound = function (err) {
        res.error(err, 404);
    };

    res.error.conflict = function (err) {
        res.error(err, 409);
    };

    res.error.unauthorized = function (err) {
        res.error(err, 401);
    };

    res.error.forbidden = function (err) {
        res.error(err, 403);
    };

    res.error.notAcceptable = function (err) {
        res.error(err, 406);
    };

    next();
};
