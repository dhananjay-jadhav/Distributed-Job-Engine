import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsServiceModule } from '@jobber/jobs-service';
import { JobsApiModule } from '@jobber/jobs-api';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    LoggerModule.forRoot(),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        path: join(process.cwd(), 'apps/jobs/src/schema.gql'),
        federation: 2,
      },
      sortSchema: true,
      playground: false,
      context: ({ req, res }) => ({ req, res }),
      plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    }),
    JobsServiceModule,
    JobsApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
