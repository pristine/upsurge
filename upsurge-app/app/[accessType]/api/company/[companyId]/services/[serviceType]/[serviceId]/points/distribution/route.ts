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
      serviceId: string;
      serviceType: string;
    };
  }
) {
  const timeFrame = req.nextUrl.searchParams.get('timeframe');

  let gte = new Date(0);
  if (timeFrame) {
    const now = new Date();
    switch (timeFrame) {
      case 'one_year':
        gte = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'six_months':
        gte = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case 'three_months':
        gte = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'one_month':
        gte = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'two_weeks':
        gte = new Date(now.setDate(now.getDate() - 14));
        break;
      case 'one_week':
        gte = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'two_days':
        gte = new Date(now.setDate(now.getDate() - 2));
        break;
      case 'one_day':
        gte = new Date(now.setDate(now.getDate() - 1));
        break;
    }
  }

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

  const addCirculationAgg = await db.pointActivity.aggregate({
    where: {
      serviceId: params.serviceId,
      serviceType: params.serviceType as 'discord',
      reason: {
        not: 'reward',
      },
      type: 'add',
      createdAt: {
        gte,
      },
    },
    _sum: {
      points: true,
    },
  });

  const subtractCirculationAgg = await db.pointActivity.aggregate({
    where: {
      serviceId: params.serviceId,
      reason: {
        not: 'reward',
      },
      type: 'subtract',
      createdAt: {
        gte,
      },
    },
    _sum: {
      points: true,
    },
  });

  const totalCirculation =
    (addCirculationAgg._sum.points ?? 0) -
    (subtractCirculationAgg._sum.points ?? 0);

  const redeemedRewardsAgg = await db.pointActivity.aggregate({
    where: {
      serviceId: params.serviceId,
      serviceType: params.serviceType as 'discord',
      reason: 'reward',
      RedeemedReward: {
        processed: true,
      },
      createdAt: {
        gte,
      },
    },
    _sum: {
      points: true,
    },
  });

  const unprocessedRedeemedRewardsAgg = await db.pointActivity.aggregate({
    where: {
      serviceId: params.serviceId,
      serviceType: params.serviceType as 'discord',
      reason: 'reward',
      RedeemedReward: {
        processed: false,
      },
      createdAt: {
        gte,
      },
    },
    _sum: {
      points: true,
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        totalUsers: totalCirculation ?? 0,
        totalProcessed: redeemedRewardsAgg._sum.points ?? 0,
        totalUnprocessed: unprocessedRedeemedRewardsAgg._sum.points ?? 0,
      },
    },
    { status: 200 }
  );
}
