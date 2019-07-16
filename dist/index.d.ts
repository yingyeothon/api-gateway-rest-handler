import * as awsTypes from 'aws-lambda';
export interface IApiRequest<T> {
    body: T;
    headers: {
        [name: string]: string;
    };
    pathParameters: {
        [name: string]: string;
    };
    queryStringParameters: {
        [name: string]: string;
    };
    header: (key: string) => string | undefined;
}
export declare type ApiHandler<T> = (request: IApiRequest<T>) => any | Promise<any>;
export declare class ApiError extends Error {
    message: string;
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
export interface IApiOptions {
    contentType: string;
}
export declare const api: <T = any>(handler: ApiHandler<T>, userOptions?: Partial<IApiOptions> | undefined) => (gatewayEvent: awsTypes.APIGatewayProxyEvent, _: awsTypes.Context, callback: awsTypes.Callback<any>) => void;
