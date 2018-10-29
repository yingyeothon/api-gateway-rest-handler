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

export const api = <T>(handler: ApiHandler<T>) => (
  gatewayEvent: awsTypes.APIGatewayEvent,
  _: awsTypes.Context,
  callback: awsTypes.Callback,
) => {
  const response = (value: any, statusCode: number = 200) =>
    callback(null, {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(value),
    });
  const error = (err: any, statusCode: number = 500) =>
    response(
      err.message || 'Server has encountered an error.',
      err.statusCode || statusCode,
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
      return result.then(response).catch(error);
    } else {
      return response(result);
    }
  } catch (err) {
    return error(err);
  }
};
