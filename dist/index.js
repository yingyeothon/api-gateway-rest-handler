"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ApiError = /** @class */ (function (_super) {
    __extends(ApiError, _super);
    function ApiError(message, statusCode) {
        if (statusCode === void 0) { statusCode = 400; }
        var _this = _super.call(this, message) || this;
        _this.message = message;
        _this.statusCode = statusCode;
        return _this;
    }
    return ApiError;
}(Error));
exports.ApiError = ApiError;
var defaultApiOptions = {
    contentType: 'application/json',
};
exports.api = function (handler, userOptions) { return function (gatewayEvent, _, callback) {
    var options = userOptions
        ? __assign({}, defaultApiOptions, userOptions) : defaultApiOptions;
    var response = function (value, statusCode, contentType) {
        return callback(null, {
            statusCode: statusCode,
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: options.contentType.includes('json')
                ? JSON.stringify(value)
                : value,
        });
    };
    var ok = function (value, statusCode) {
        if (statusCode === void 0) { statusCode = 200; }
        return response(value, statusCode, options.contentType);
    };
    var error = function (err, statusCode) {
        if (statusCode === void 0) { statusCode = 500; }
        return response(err.message || 'Server has encountered an error.', err.statusCode || statusCode, 'application/json');
    };
    try {
        var request = {
            body: JSON.parse(gatewayEvent.body || '{}'),
            headers: gatewayEvent.headers,
            pathParameters: gatewayEvent.pathParameters || {},
            queryStringParameters: gatewayEvent.queryStringParameters || {},
            header: function (key) {
                return gatewayEvent.headers[key] || gatewayEvent.headers[key.toLowerCase()];
            },
        };
        var result = handler(request);
        if (result && result instanceof Promise) {
            result.then(ok).catch(error);
        }
        else {
            ok(result);
        }
    }
    catch (err) {
        console.error(err);
        error(err);
    }
}; };
//# sourceMappingURL=index.js.map