import { IncomingMessage, ServerResponse } from 'http';

export const request = (req: IncomingMessage) => {
  return {
    method: req.method,
    url: req.url,
    headers: req.headers,
    remotePort: req.connection.remotePort,
  };
};

export const response = (res: ServerResponse) => {
  return {
    statusCode: res.statusCode,
  };
};
