import { IncomingMessage, ServerResponse } from 'http';
import { SerializedRequest, SerializedResponse } from '../interfaces';

export const request = (req: IncomingMessage): SerializedRequest => {
  return {
    method: req.method,
    url: req.url,
    headers: req.headers,
    remotePort: req.connection.remotePort,
  };
};

export const response = (res: ServerResponse): SerializedResponse => {
  return {
    statusCode: res.statusCode,
  };
};
