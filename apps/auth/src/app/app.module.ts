import { Module } from '@nestjs/common';
import { AuthDbModule } from '@jobber/auth-db';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { UsersApiModule } from '@jobber/users-api';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    AuthDbModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        path: join(process.cwd(), 'apps/auth/src/schema.gql'),
        federation: 2,
      },
      sortSchema: true,
      playground: false,

      plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    }),
    UsersApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
