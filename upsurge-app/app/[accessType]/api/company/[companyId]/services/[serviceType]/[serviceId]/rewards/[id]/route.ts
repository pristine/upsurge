import { db } from '@/lib/prisma';
import { type UpdateReward } from '@/types/rewards';
import { getCompanyWhereFromType } from '@/util/company';
import { getUserId, log } from '@/util/log';
import { toBlock, toJSONCode } from '@/util/string';
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
  const { description, nickname, pointsRequired, active }: UpdateReward =
    await req.json();

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

  const reward = await db.reward.findUnique({
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
  if (!reward)
    return NextResponse.json(
      {
        success: false,
        error: 'Reward does not exist.',
      },
      {
        status: 400,
      }
    );

  const updateData: Partial<UpdateReward> = {};
  if (description !== undefined) updateData.description = description;
  if (nickname !== undefined) updateData.nickname = nickname;
  if (pointsRequired !== undefined) updateData.pointsRequired = pointsRequired;
  if (active !== undefined) updateData.active = active;

  const updated = await db.reward.update({
    where: { id: params.id },
    data: updateData,
  });

  void log({
    serviceId: params.serviceId,
    serviceType: params.serviceType as 'discord',
    action: 'rewardUpdate',
    focus: 'rewards',
    content: `${toBlock(await getUserId(req, 'whop'))} edited reward ${toBlock(
      updated.nickname
    )}, with data: ${toJSONCode(JSON.stringify(updateData))}!`,
    data: {
      executeUserId: await getUserId(req, 'whop'),
      rewardId: reward.id,
      updateData,
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
      id: string;
    };
  }
) {
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

  const reward = await db.reward.findUnique({
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
    select: {
      id: true,
      description: true,
      nickname: true,
      pointsRequired: true,
      createdAt: true,
      active: true,
    },
  });

  return NextResponse.json({ success: true, data: reward }, { status: 200 });
}
