import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

export class GQLAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override getRequest(context: ExecutionContext): any {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext()?.req;
  }
}
