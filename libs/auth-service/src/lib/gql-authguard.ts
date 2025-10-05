import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

export class GQLAuthGuard extends AuthGuard('jwt') {
  override getRequest(context: ExecutionContext) {
    console.log('getRequest', context);
    const ctx = GqlExecutionContext.create(context);

    console.log('context req', ctx.getContext()?.req);
    return ctx.getContext()?.req;
  }
}
