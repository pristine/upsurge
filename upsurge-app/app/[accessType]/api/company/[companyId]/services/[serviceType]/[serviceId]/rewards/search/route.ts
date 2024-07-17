import { db } from '@/lib/prisma';
import { type Reward } from '@/types/rewards';
import { getCompanyWhereFromType } from '@/util/company';
import { type NextRequest, NextResponse } from 'next/server';

const PER_PAGE = 5;

interface OrderByType {
  points?: 'asc' | 'desc';
  RedeemedReward?: { _count: 'asc' | 'desc' };
}

const orderByMap: Record<string, OrderByType> = {
  none: {},
  pointsRequired: { points: 'desc' },
  amountRedeemed: { RedeemedReward: { _count: 'desc' } },
};

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
  const page = req.nextUrl.searchParams.get('page');
  const term = req.nextUrl.searchParams.get('term');
  const sortBy = req.nextUrl.searchParams.get('sortBy');
  const showInactiveOnly = req.nextUrl.searchParams.get('showInactiveOnly');

  if (!sortBy || !orderByMap[sortBy]) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid sort by.',
      },
      {
        status: 400,
      }
    );
  }

  if (!page) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing page.',
      },
      {
        status: 400,
      }
    );
  }

  if (!showInactiveOnly) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing showInactiveOnly.',
      },
      {
        status: 400,
      }
    );
  }

  if (term == null) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing search term.',
      },
      {
        status: 400,
      }
    );
  }

  const pageNumber = parseInt(page);
  if (pageNumber < 1) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid page number.',
      },
      {
        status: 400,
      }
    );
  }

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

  const result = await db.reward.findMany({
    where: {
      serviceId: params.serviceId,
      serviceType: params.serviceType as 'discord',
      active: showInactiveOnly === 'false',
      OR: [
        { nickname: { startsWith: term, mode: 'insensitive' } },
        { description: { startsWith: term, mode: 'insensitive' } },
      ],
    },
    include: {
      RedeemedReward: true,
    },
    orderBy: orderByMap[sortBy],
    skip: (pageNumber - 1) * PER_PAGE,
    take: PER_PAGE,
  });

  const total = await db.reward.count({
    where: {
      serviceId: params.serviceId,
      serviceType: params.serviceType as 'discord',
      active: showInactiveOnly === 'false',
      OR: [
        { nickname: { startsWith: term, mode: 'insensitive' } },
        { description: { startsWith: term, mode: 'insensitive' } },
      ],
    },
    orderBy: orderByMap[sortBy],
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        rewards: result.map((reward) => ({
          id: reward.id,
          nickname: reward.nickname,
          description: reward.description,
          createdAt: reward.createdAt,
          pointsRequired: reward.pointsRequired,
          amountRedeemed: reward.RedeemedReward.length,
          active: reward.active,
        })) as Reward[],
        totalPages: Math.ceil(total / PER_PAGE),
        totalRewards: total,
        perPage: PER_PAGE,
      },
    },
    { status: 200 }
  );
}
