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
      id: string;
    };
  }
) {
  const { processed } = await req.json();

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

  const redeemedReward = await db.redeemedReward.findUnique({
    where: {
      id: params.id,
      Service: {
        id: params.serviceId,
        type: params.serviceType as 'discord',
        Company: getCompanyWhereFromType(
          params.accessType,
          params.companyId,
          params.serviceId,
          params.serviceType
        ),
      },
    },
  });
  if (!redeemedReward) {
    return NextResponse.json(
      {
        success: false,
        error: 'Redeemed reward does not exist within database.',
      },
      {
        status: 400,
      }
    );
  }

  await db.redeemedReward.update({
    where: {
      id: redeemedReward.id,
    },
    data: {
      ...(processed !== null && {
        processed,
        processedAt: new Date(),
      }),
    },
  });

  void log({
    serviceId: params.serviceId,
    serviceType: params.serviceType as 'discord',
    action: 'redeemedRewardUpdate',
    focus: 'redeemedRewards',
    content: `${toBlock(
      await getUserId(req, 'whop')
    )} processed redeemed reward ${toBlock(redeemedReward.id)}!`,
    data: {
      executeUserId: await getUserId(req, 'whop'),
      redeemedRewardId: redeemedReward.id,
      rewardId: redeemedReward.rewardId,
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
