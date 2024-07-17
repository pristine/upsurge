import { db } from '@/lib/prisma';
import { decrypt } from '@/util/encryption';
import { WhopAPI, getToken } from '@whop-apps/sdk';
import { type NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const userToken = getToken({ headers: req.headers });

  const currentUser = await WhopAPI.me({ token: userToken }).GET('/me', {});
  if (!currentUser.isOk) {
    return NextResponse.json(
      { success: false, error: 'failed to get current user' },
      { status: 403 }
    );
  }

  try {
    await db.whopDiscordAccess.delete({
      where: {
        userId: currentUser.data.id,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error }, { status: 401 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const userToken = getToken({ headers: req.headers });

  const currentUser = await WhopAPI.me({ token: userToken }).GET('/me', {});
  if (!currentUser.isOk) {
    return NextResponse.json(
      { success: false, error: 'failed to get current user' },
      { status: 403 }
    );
  }

  const date = new Date();
  date.setMinutes(date.getMinutes() - 15);

  const validToken = await db.whopDiscordAccess.findUnique({
    where: {
      userId: currentUser.data.id,
      expiresAt: { gte: date },
    },
  });

  const guilds: any[] = [];

  if (validToken) {
    try {
      const guildResults = await fetch(
        'https://discord.com/api/users/@me/guilds',
        {
          headers: {
            authorization: `${validToken.discordTokenType} ${decrypt(
              validToken.discordToken
            )}`,
          },
        }
      );

      const guildData = await guildResults.json();

      for (const guild of guildData) {
        if (guild.permissions) {
          const permissions = guild.permissions;

          if ((permissions & 0x0000000000000008) === 0x0000000000000008) {
            guilds.push({
              id: guild.id,
              name: guild.name,
              icon: guild.icon,
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json({ success: false, error }, { status: 401 });
    }
  }

  const data = {
    userId: currentUser.data.id,
    isValid: !!validToken,
    guilds,
    oauthUrl: process.env.NODE_ENV
      ? process.env.LOCAL_DISCORD_OAUTH_URL
      : process.env.DISCORD_OAUTH_URL,
  };

  return NextResponse.json({ success: true, data }, { status: 200 });
}
