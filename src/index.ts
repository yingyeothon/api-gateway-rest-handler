import * as awsTypes from 'aws-lambda';

export interface IApiRequest<T> {
  body: T;
  headers: { [name: string]: string };
  pathParameters: { [name: string]: string };
  queryStringParameters: { [name: string]: string };

  header: (key: string) => string | undefined;
}

export type ApiHandler<T> = (request: IApiRequest<T>) => any | Promise<any>;

export class ApiError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
  }
}

export interface IApiOptions {
  contentType: string;
}

const defaultApiOptions: IApiOptions = {
  contentType: 'application/json',
};

export const api = <T>(
  handler: ApiHandler<T>,
  userOptions?: Partial<IApiOptions>,
) => (
  gatewayEvent: awsTypes.APIGatewayEvent,
  _: awsTypes.Context,
  callback: awsTypes.Callback,
) => {
  const options: IApiOptions = userOptions
    ? { ...defaultApiOptions, ...userOptions }
    : defaultApiOptions;
  const response = (value: any, statusCode: number, contentType: string) =>
    callback(null, {
      statusCode,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: options.contentType.includes('json')
        ? JSON.stringify(value)
        : value,
    });

  const ok = (value: any, statusCode: number = 200) =>
    response(value, statusCode, options.contentType);
  const error = (err: any, statusCode: number = 500) =>
    response(
      err.message || 'Server has encountered an error.',
      err.statusCode || statusCode,
      'application/json',
    );

  try {
    const request = {
      body: JSON.parse(gatewayEvent.body || '{}') as T,
      headers: gatewayEvent.headers,
      pathParameters: gatewayEvent.pathParameters || {},
      queryStringParameters: gatewayEvent.queryStringParameters || {},
      header: (key: string) =>
        gatewayEvent.headers[key] || gatewayEvent.headers[key.toLowerCase()],
    };
    const result = handler(request);
    if (result && result instanceof Promise) {
      return result.then(ok).catch(error);
    } else {
      return ok(result);
    }
  } catch (err) {
    return error(err);
  }
};
