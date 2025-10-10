import {
  CanActivate,
  Injectable,
  OnModuleInit,
  Inject,
  ExecutionContext,
} from '@nestjs/common';
import {
  AUTH_PACKAGE_NAME,
  AUTH_SERICE_SERVICE_NAME,
  AuthSericeClient,
} from '@jobber/proto';
import { catchError, map, Observable, of } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class GqlAuthGuardService implements CanActivate, OnModuleInit {
  private authServiceClient!: AuthSericeClient;
  constructor(
    @Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc,
    @InjectPinoLogger(GqlAuthGuardService.name)
    private readonly logger: PinoLogger
  ) {}

  onModuleInit() {
    this.authServiceClient = this.client.getService<AuthSericeClient>(
      AUTH_SERICE_SERVICE_NAME
    );
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const token = this.getRequest(context).cookies?.Authentication;

    if (!token) {
      return false;
    }

    return this.authServiceClient.authenticate({ token }).pipe(
      map((res) => {
        this.getRequest(context).user = res;
        return true;
      }),
      catchError((err) => {
        this.logger.error(err);
        return of(false);
      })
    );
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
