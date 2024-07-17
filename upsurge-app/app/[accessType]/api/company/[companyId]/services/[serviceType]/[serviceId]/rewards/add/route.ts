import { db } from '@/lib/prisma';
import { getCompanyWhereFromType } from '@/util/company';
import { getUserId, log } from '@/util/log';
import { toBlock } from '@/util/string';
import { type NextRequest, NextResponse } from 'next/server';

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
  const body = await req.json();

  const { nickname, description, pointsRequired } = body;

  const dbService = await db.service.findUnique({
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
  if (!dbService) {
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

  const reward = await db.reward.create({
    data: {
      description,
      pointsRequired,
      nickname,
      Service: {
        connect: {
          id_type: {
            type: params.serviceType as 'discord',
            id: params.serviceId,
          },
        },
      },
    },
  });

  void log({
    serviceId: params.serviceId,
    serviceType: params.serviceType as 'discord',
    action: 'rewardCreate',
    focus: 'rewards',
    content: `${toBlock(
      await getUserId(req, 'whop')
    )} created a new reward ${toBlock(reward.nickname)}!`,
    data: {
      executeUserId: await getUserId(req, 'whop'),
      rewardId: reward.id,
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
