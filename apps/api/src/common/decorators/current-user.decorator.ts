import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    let user = request.user;

    // If route was marked @Public() but client sent a Bearer token, extract identity
    if (!user && request.headers?.authorization?.startsWith('Bearer ')) {
      try {
        const token = request.headers.authorization.split(' ')[1];
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(tokenParts[1], 'base64').toString('utf8')
          );
          user = { id: payload.sub, ...payload };
          request.user = user;
        }
      } catch {
        // invalid token format, ignore
      }
    }

    return data && user ? user[data] : user;
  },
);
