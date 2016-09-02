exports.emptySet = (query) => query.response([])
exports.noResults = (query) => query.response()
exports.reject = (query) => query.reject()
exports.response = (data, query) => query.response(data)
