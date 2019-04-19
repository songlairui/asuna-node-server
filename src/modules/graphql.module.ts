import { APP_INTERCEPTOR } from '@nestjs/core';
import { DynamicModule, Logger, Module, OnModuleInit } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import * as util from 'util';
import * as _ from 'lodash';
import * as GraphQLJSON from 'graphql-type-json';
import { join } from 'path';

import { KvModule } from './kv';
import { AppModule } from './app';
import { DataLoaderInterceptor } from './dataloader';
import { AbstractAuthUser, AsunaContext } from './core';

const logger = new Logger('GraphqlModule');

const typePaths = [
  '../**/*.graphql',
  // `${join(__dirname, '..')}/**/*.graphql`,
  // `${AsunaContext.instance.dirname}/**/*.graphql`,
];
logger.log(`init ${JSON.stringify({ typePaths })}`);

@Module({
  imports: [
    KvModule,
    AppModule,
    GraphQLModule.forRoot({
      // definitions: {
      //   path: join(process.cwd(), 'src/graphql.generated.ts'),
      //   outputAs: 'class',
      // },
      typePaths,
      resolvers: { JSON: GraphQLJSON },
      introspection: AsunaContext.isDebugMode,
      debug: AsunaContext.isDebugMode,
      playground: true,
      resolverValidationOptions: {
        requireResolversForResolveType: false,
      },
      context: context => ({
        ...context,
        getDataLoaders: () => _.get(context.req, 'dataLoaders'),
        getCurrentUser: (): AbstractAuthUser => _.get(context.req, 'user'),
      }),
      // tracing: true,
      /*      extensions: _.compact([
        configLoader.loadConfig(ConfigKeys.TRACING)
          ? () =>
              new OpenTracingExtension({
                server: tracer,
                local: graphqlTracer,
                shouldTraceRequest: info => true,
                shouldTraceFieldResolver: (source, args, context, info) => true,
              }) as any
          : undefined,
      ]),*/
      formatResponse: response => {
        if (response.errors) {
          logger.warn(`response: ${util.inspect(response.errors, { colors: true })}`);
        }
        logger.log(`response: ${util.inspect(response.data, { colors: true })}`);
        return response;
      },
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
    /*{
      provide: APP_INTERCEPTOR,
      useClass: AuthInterceptor,
    },*/
  ],
})
export class GraphqlModule implements OnModuleInit {
  /*
  static forRoot(modules = [], options?): DynamicModule {
    // const providers = createDatabaseProviders(options, entities);
    return {
      module: GraphqlModule,
      imports: [
        ...modules,
        KvModule,
        AppModule,
        GraphQLModule.forRoot({
          // definitions: {
          //   path: join(process.cwd(), 'src/graphql.generated.ts'),
          //   outputAs: 'class',
          // },
          typePaths: ['../!**!/!*.graphql'],
          resolvers: { JSON: GraphQLJSON },
          // introspection: true,
          // debug: true,
          playground: true,
          resolverValidationOptions: {
            requireResolversForResolveType: false,
          },
          context: context => {
            return {
              ...context,
              getDataLoaders: () => (context.req as any).dataLoaders,
            };
          },
          // tracing: true,
          /!*      extensions: _.compact([
            configLoader.loadConfig(ConfigKeys.TRACING)
              ? () =>
                  new OpenTracingExtension({
                    server: tracer,
                    local: graphqlTracer,
                    shouldTraceRequest: info => true,
                    shouldTraceFieldResolver: (source, args, context, info) => true,
                  }) as any
              : undefined,
          ]),*!/
          formatResponse: response => {
            if (response.errors) {
              logger.warn(`response: ${util.inspect(response.errors, { colors: true })}`);
            }
            logger.log(`response: ${util.inspect(response.data, { colors: true })}`);
            return response;
          },
        }),
      ],
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useClass: DataLoaderInterceptor,
        },
        // {
        //   provide: APP_INTERCEPTOR,
        //   useClass: AuthInterceptor,
        // },
      ],
    };
  }
*/

  onModuleInit() {
    logger.log('init...');
  }
}
