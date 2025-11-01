import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose } from '@apollo/gateway';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      server: {
        path: '/api/graphql',
      },
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            {
              name: 'auth',
              url: process.env.AUTH_SUBGRAPH_URL || 'http://localhost:3000/api/graphql',
            },
            {
              name: 'jobs',
              url: process.env.JOBS_SUBGRAPH_URL || 'http://localhost:3001/api/graphql',
            },
          ],
        }),
      },
    }),
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
