import { authorizedUserOn, hasAccess } from '@whop-apps/sdk';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/whop/api/company')) {
    const url = request.nextUrl.pathname;
    const pathParts = url.split('/');
    if (pathParts.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing rest of path',
        },
        {
          status: 400,
        }
      );
    }

    const companyId = pathParts[4];

    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing company id',
        },
        {
          status: 400,
        }
      );
    }

    const access = await hasAccess({
      to: authorizedUserOn(companyId),
      headers: request.headers,
    });

    if (!access) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        {
          status: 403,
        }
      );
    }
  } else if (request.nextUrl.pathname.startsWith('/web/api/company')) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
      },
      {
        status: 403,
      }
    );
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/(whop|web)/api/:path*',
};
