import { db } from '@/lib/prisma';
import { type Member, type RawChannel, type Role } from '@/types/discord';
import { getCompanyWhereFromType } from '@/util/company';
import { getUserId, log } from '@/util/log';
import { toBlock } from '@/util/string';
import { type NextRequest, NextResponse } from 'next/server';

function isChannelValid(permissions: number) {
  // admin
  if ((permissions & 0x0000000000000008) === 0x0000000000000008) return true;

  // send messages
  if ((permissions & 0x0000000000000800) !== 0x0000000000000800) return false;

  // manage messages
  if ((permissions & 0x0000000000002000) !== 0x0000000000002000) return false;

  // read nessage history
  if ((permissions & 0x0000000000010000) !== 0x0000000000010000) return false;

  // add reactions
  if ((permissions & 0x0000000000000040) !== 0x0000000000000040) return false;

  return true;
}

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
  const { channel, type } = await req.json();

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

  switch (type) {
    case 'mainChannel':
      await db.service.update({
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
          mainChannel: channel,
        },
      });

      void log({
        serviceId: params.serviceId,
        serviceType: params.serviceType as 'discord',
        action: 'mainChannelUpdate',
        focus: 'service',
        content: `${toBlock(
          await getUserId(req, 'whop')
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        )} changed the mainChannel to ${toBlock(channel)}!`,
        data: {
          executeUserId: await getUserId(req, 'whop'),
          channel,
        },
      });

      break;
    case 'logChannel':
      void log({
        serviceId: params.serviceId,
        serviceType: params.serviceType as 'discord',
        action: 'logChannelUpdate',
        focus: 'service',
        content: `${toBlock(
          await getUserId(req, 'whop')
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        )} changed the logChannel to ${toBlock(channel)}!`,
        data: {
          executeUserId: await getUserId(req, 'whop'),
          channel,
        },
      });

      await db.service.update({
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
          logChannel: channel,
        },
      });

      break;
    default:
      return NextResponse.json(
        { success: true, error: 'invalid type' },
        { status: 400 }
      );
  }

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

  const channelResult = await fetch(
    `https://discord.com/api/guilds/${service.id}/channels`,
    {
      headers: {
        authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }
  );

  const memberResult = await fetch(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    `https://discord.com/api//guilds/${service.id}/members/${process.env
      .DISCORD_CLIENT_ID!}`,
    {
      headers: {
        authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }
  );

  const rolesResult = await fetch(
    `https://discord.com/api/guilds/${service.id}/roles`,
    {
      headers: {
        authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }
  );

  const rolesData = (await rolesResult.json()) as Role[];

  const memberData = (await memberResult.json()) as Member;

  const channelData = (await channelResult.json()) as RawChannel[];

  const rolesThatBotHas = rolesData.filter((role) =>
    memberData.roles.includes(role.id)
  );

  const doesBotHaveAdmin = rolesThatBotHas.some(
    (role) =>
      (parseInt(role.permissions) & 0x0000000000000008) === 0x0000000000000008
  );

  const filteredChannels = channelData.filter((channel) => {
    // Check if the channel type is 0
    if (channel.type !== 0) return false;

    if (doesBotHaveAdmin) return true;
    // Check if permissionOverwrites includes roleId or process.env.id
    const validOverwrites = channel.permission_overwrites.filter(
      (overwrite) => {
        // Check if the overwrite is for a role and the role is in memberData.roles or the id is process.env.id
        return (
          overwrite.type === 'role' &&
          (memberData.roles.includes(overwrite.id) ||
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            overwrite.id === process.env.DISCORD_CLIENT_ID!)
        );
      }
    );

    const validChannel = validOverwrites.some((overwrite) =>
      isChannelValid(parseInt(overwrite.allow_new))
    );

    // Check if the allow_new passes isChannelValid for any of the validOverwrites
    return validChannel || isChannelValid(parseInt(channel.permissions ?? ''));
  });

  return NextResponse.json(
    { success: true, data: filteredChannels },
    { status: 200 }
  );
}
