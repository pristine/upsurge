import { db } from '@/lib/prisma';
import { encrypt } from '@/util/encryption';
import { WhopAPI, getToken } from '@whop-apps/sdk';
import { type NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  if (!process.env.ENCRYPTION_KEY || !process.env.ENCRYPTION_IV) {
    return NextResponse.json(
      { success: false, error: 'encryption key not initialized' },
      { status: 500 }
    );
  }

  const userToken = getToken({ headers: req.headers });

  const currentUser = await WhopAPI.me({ token: userToken }).GET('/me', {});
  if (!currentUser.isOk) {
    return NextResponse.json(
      { success: false, error: 'failed to get current user' },
      { status: 403 }
    );
  }

  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json(
      { success: false, error: 'missing code' },
      { status: 400 }
    );
  }

  const userId = req.nextUrl.searchParams.get('state');
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'missing state' },
      { status: 400 }
    );
  }

  if (userId !== currentUser.data.id) {
    return NextResponse.json(
      { success: false, error: 'state does not match whop user' },
      { status: 400 }
    );
  }

  try {
    const tokenResponseData = await fetch(
      'https://discord.com/api/oauth2/token',
      {
        method: 'POST',
        body: new URLSearchParams({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          client_id: process.env.DISCORD_CLIENT_ID!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          client_secret: process.env.DISCORD_CLIENT_SECRET!,
          code,
          grant_type: 'authorization_code',
          redirect_uri:
            process.env.NODE_ENV === 'development'
              ? 'http://localhost:3000/api/discord/oauth'
              : 'https://www.upsurge.bot/api/discord/oauth',
        }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const oauthData = await tokenResponseData.json();

    if (oauthData.error) {
      return NextResponse.json(
        { success: false, error: oauthData.error },
        { status: 401 }
      );
    }

    const expiryDate = new Date();
    expiryDate.setSeconds(
      (expiryDate.getSeconds() + oauthData.expires_in) as number
    );

    await db.whopDiscordAccess.upsert({
      where: {
        userId,
      },
      create: {
        discordToken: encrypt(oauthData.access_token as string),
        discordTokenType: oauthData.token_type,
        userId,
        expiresAt: expiryDate,
        id: uuidv4(),
      },
      update: {
        discordToken: oauthData.access_token,
        discordTokenType: oauthData.token_type,
        expiresAt: expiryDate,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error }, { status: 401 });
  }

  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Upsurge</title>
    </head>
    <body>
        <h1>Successfuly authenticated your Discord! You may now close this page.</h1>
    </body>
    </html>
    `,
    { headers: { 'content-type': 'text/html' } }
  );
}
