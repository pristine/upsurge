import { db } from '@/lib/prisma';
import { type Role } from '@/types/discord';
import { getCompanyWhereFromType } from '@/util/company';
import { getUserId, log } from '@/util/log';
import { toBlock, toCode } from '@/util/string';
import { type NextRequest, NextResponse } from 'next/server';

// FOR DISCORD
export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      accessType: 'whop';
      companyId: string;
      serviceType: string;
      serviceId: string;
    };
  }
) {
  const { roles } = await req.json();

  const service = await db.service.findUnique({
    where: {
      id_type: {
        id: params.serviceId,
        type: params.serviceType as 'discord',
      },
      Company: getCompanyWhereFromType(
        params.accessType,
        params.companyId,
        params.serviceId,
        params.serviceType
      ),
    },
  });
  if (!service) {
    return NextResponse.json(
      {
        success: false,
        error: 'Service does not exist within database.',
      },
      {
        status: 400,
      }
    );
  }

  const updated = await db.service.update({
    where: {
      id_type: {
        id: params.serviceId,
        type: params.serviceType as 'discord',
      },
      Company: getCompanyWhereFromType(
        params.accessType,
        params.companyId,
        params.serviceId,
        params.serviceType
      ),
    },
    data: {
      userRoles: roles,
      setRoles: true,
    },
  });

  void log({
    serviceId: params.serviceId,
    serviceType: params.serviceType as 'discord',
    action: 'rolesUpdate',
    focus: 'service',
    content: `${toBlock(
      await getUserId(req, 'whop')
    )} updated roles to ${toCode(updated.userRoles.join(', '))}!`,
    data: {
      executeUserId: await getUserId(req, 'whop'),
      roles: updated.userRoles,
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      accessType: 'whop';
      companyId: string;
      serviceType: string;
      serviceId: string;
    };
  }
) {
  const service = await db.service.findUnique({
    where: {
      id_type: {
        id: params.serviceId,
        type: params.serviceType as 'discord',
      },
      Company: getCompanyWhereFromType(
        params.accessType,
        params.companyId,
        params.serviceId,
        params.serviceType
      ),
    },
  });
  if (!service) {
    return NextResponse.json(
      {
        success: false,
        error: 'Service does not exist within database.',
      },
      {
        status: 400,
      }
    );
  }

  const guildResult = await fetch(
    `https://discord.com/api/guilds/${service.id}`,
    {
      headers: {
        authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }
  );

  const guildData = await guildResult.json();

  return NextResponse.json(
    {
      success: true,
      data: {
        roles: guildData.roles as Role[],
        currentRoles: service.userRoles,
      },
    },
    { status: 200 }
  );
}
