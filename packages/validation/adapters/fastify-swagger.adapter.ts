import { IApplication } from '@uzert/app';
import Validation from '../providers/validation';
import * as fp from 'fastify-plugin';
import * as fastifyStatic from 'fastify-static';
import { IPluginSchemaGeneratorOptions, ISwaggerOptions } from '../index';

export default fp(function(
  fastify: IApplication,
  opts: IPluginSchemaGeneratorOptions,
  done: any,
) {
  if (opts.exposeRoute) {
    let routePrefix = '/';

    if (opts.routePrefix) {
      routePrefix =
        opts.routePrefix[0] !== '/' ? `/${opts.routePrefix}` : opts.routePrefix;
    }

    fastify.register(fastifyStatic, {
      prefix: routePrefix,
      root: Validation.schemasGenerator.swaggerAbsoluteFSPath,
    });

    const swaggerOptions: ISwaggerOptions = opts.swaggerOptions || {
      openapi: '3.0.0',
      info: {
        description: 'OpenApi specification',
        version: '1.0.0',
        title: 'Seedium',
        contact: {
          email: 'developer@seedium.io',
        },
      },
      servers: [],
      tags: [],
    };

    Validation.schemasGenerator.setSwaggerOptions(swaggerOptions);
    Validation.schemasGenerator.setIndexPrefix(routePrefix);

    fastify.addHook('onRoute', (routeOptions) => {
      if (routeOptions.config && routeOptions.config.schemaRef) {
        Validation.schemasGenerator.addRouteSchema({
          url: routeOptions.url,
          method: routeOptions.method.toString(),
          schemaRef: routeOptions.config.schemaRef,
        });
      }
    });

    fastify.get(routePrefix, (request, reply) => {
      reply.sendFile('index.html');
    });
  }

  done();
});
