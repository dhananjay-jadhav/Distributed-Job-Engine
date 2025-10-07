import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsServiceModule } from '@jobber/jobs-service';
import { JobsResolver } from './jobs.resolver';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
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
  ],
  controllers: [],
  providers: [JobsResolver],
})
export class AppModule {}
