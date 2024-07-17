import { db } from '@/lib/prisma';
import { getCompanyWhereFromType } from '@/util/company';
import { decrypt } from '@/util/encryption';
import { WhopAPI, getToken } from '@whop-apps/sdk';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { accessType: 'whop'; companyId: string } }
) {
  const { id, type } = await req.json();

  const company = await db.company.findUnique({
    where: getCompanyWhereFromType(params.accessType, params.companyId),
    include: {
      Service: true,
    },
  });
  if (!company) {
    return NextResponse.json(
      {
        success: false,
        error: 'Company does not exist within database.',
      },
      {
        status: 400,
      }
    );
  }

  // if (company.Service.length + 1 > company.limit) {
  //   return NextResponse.json(
  //     {
  //       success: false,
  //       error: 'Service limit reached.',
  //     },
  //     {
  //       status: 401,
  //     }
  //   );
  // }

  if (type === 'discord') {
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
    if (!validToken)
      return NextResponse.json(
        { success: true, error: 'invalid discord token' },
        { status: 401 }
      );

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

    const guild = guildData.find((guildData: any) => guildData.id === id);

    const permissions = guild.permissions;

    if (!permissions)
      return NextResponse.json(
        { success: true, error: 'user is does not have permissions to guild' },
        { status: 401 }
      );

    if ((permissions & 0x0000000000000008) !== 0x0000000000000008)
      return NextResponse.json(
        {
          success: true,
          error: 'user is does not have admin permissions to guild',
        },
        { status: 401 }
      );

    await db.$transaction([
      db.service.upsert({
        where: {
          id_type: {
            id,
            type: 'discord',
          },
        },
        create: {
          id,
          type: 'discord',
          nickname: guild.name,
          Company: {
            connect: getCompanyWhereFromType(
              params.accessType,
              params.companyId
            ),
          },
        },
        update: {},
      }),
      db.company.update({
        where: getCompanyWhereFromType(params.accessType, params.companyId),
        data: {
          mainServiceId: id,
          mainServiceType: 'discord',
        },
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  }

  return NextResponse.json(
    { success: false, error: 'invalid type' },
    { status: 400 }
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { accessType: 'whop'; companyId: string } }
) {
  const services = await db.service.findMany({
    where: {
      Company: getCompanyWhereFromType(params.accessType, params.companyId),
    },
    select: {
      id: true,
      type: true,
      nickname: true,
    },
  });

  return NextResponse.json({ success: true, data: services }, { status: 200 });
}
