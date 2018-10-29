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
exports.api = function (handler) { return function (gatewayEvent, _, callback) {
    var response = function (value, statusCode) {
        if (statusCode === void 0) { statusCode = 200; }
        return callback(null, {
            statusCode: statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(value),
        });
    };
    var error = function (err, statusCode) {
        if (statusCode === void 0) { statusCode = 500; }
        return response(err.message || 'Server has encountered an error.', err.statusCode || statusCode);
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
            return result.then(response).catch(error);
        }
        else {
            return response(result);
        }
    }
    catch (err) {
        return error(err);
    }
}; };
//# sourceMappingURL=index.js.map