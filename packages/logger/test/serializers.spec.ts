import { expect } from 'chai';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { request, response } from '../serializers';

describe('Serializers', () => {
  describe('http', () => {
    it('should serialize incoming message', () => {
      const socket = new Socket();
      const incomingMessage = new IncomingMessage(socket);
      const serializedMessage = request(incomingMessage);
      expect(serializedMessage).to.have.all.keys(
        'method',
        'url',
        'headers',
        'remotePort',
      );
    });
    it('should serialize server response', () => {
      const socket = new Socket();
      const incomingMessage = new IncomingMessage(socket);
      const serverResponse = new ServerResponse(incomingMessage);
      const serializedMessage = response(serverResponse);
      expect(serializedMessage).to.have.key('statusCode');
    });
  });
});
