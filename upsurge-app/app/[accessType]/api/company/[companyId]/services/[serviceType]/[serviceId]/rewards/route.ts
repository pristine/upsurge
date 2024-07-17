import { db } from '@/lib/prisma';
import { getCompanyWhereFromType } from '@/util/company';
import { type NextRequest, NextResponse } from 'next/server';

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

  const rewardsCount = await db.reward.count({
    where: {
      serviceId: params.serviceId,
      active: true,
    },
  });

  const pendingRewardsCount = await db.redeemedReward.count({
    where: {
      serviceId: params.serviceId,
      processed: false,
    },
  });

  const pastSevenDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - (6 - i));
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000;
  });

  const groupedPendingRewards = await Promise.all(
    pastSevenDays.map(async (day) => {
      const count = await db.redeemedReward.count({
        where: {
          serviceId: params.serviceId,
          processed: false,
          createdAt: {
            gte: new Date(day * 1000),
            lt: new Date((day + 24 * 60 * 60) * 1000), // next day
          },
        },
      });
      return { date: day * 1000, amount: count };
    })
  );

  return NextResponse.json(
    {
      success: true,
      data: {
        rewardsCount,
        pendingRewardsCount,
        groupedPendingRewards,
      },
    },
    { status: 200 }
  );
}
