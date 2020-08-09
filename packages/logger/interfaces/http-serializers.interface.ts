import { IncomingHttpHeaders } from 'http';

export interface SerializedRequest {
  method: string;
  url: string;
  headers: IncomingHttpHeaders;
  remotePort: number;
}

export interface SerializedResponse {
  statusCode: number;
}
