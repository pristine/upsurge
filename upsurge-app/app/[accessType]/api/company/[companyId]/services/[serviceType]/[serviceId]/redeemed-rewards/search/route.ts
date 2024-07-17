import { db } from '@/lib/prisma';
import { type RedeemedRewardSearch } from '@/types/rewards';
import { getCompanyWhereFromType } from '@/util/company';
import { type NextRequest, NextResponse } from 'next/server';

const PER_PAGE = 5;

// type OrderByType = {
//     createdAt?: 'asc' | 'desc';
// };

// const orderByMap: Record<string, OrderByType> = {
//     none: { createdAt: 'asc' },
// };

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

  const showProcessedOnly = req.nextUrl.searchParams.get('showProcessedOnly');

  // if (!sortBy || !orderByMap[sortBy]) {
  //     return NextResponse.json({
  //         success: false,
  //         error: "Invalid sort by."
  //     }, {
  //         status: 400,
  //     })
  // }

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

  if (!showProcessedOnly) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing showProcessedOnly.',
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

  const result = await db.redeemedReward.findMany({
    where: {
      serviceId: params.serviceId,
      serviceType: params.serviceType as 'discord',
      processed: showProcessedOnly === 'true',
      OR: [
        {
          Reward: {
            OR: [
              { nickname: { contains: term, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
            ],
          },
        },
        {
          User: {
            OR: [
              { nickname: { startsWith: term, mode: 'insensitive' } },
              { username: { startsWith: term, mode: 'insensitive' } },
              { id: { startsWith: term, mode: 'insensitive' } },
            ],
          },
        },
      ],
    },
    include: {
      Reward: true,
      User: true,
    },
    orderBy: {
      ...(showProcessedOnly === 'true'
        ? { processedAt: 'desc' }
        : { createdAt: 'asc' }),
    },
    skip: (pageNumber - 1) * PER_PAGE,
    take: PER_PAGE,
  });

  const total = await db.redeemedReward.count({
    where: {
      serviceId: params.serviceId,
      serviceType: params.serviceType as 'discord',
      processed: showProcessedOnly === 'true',
      OR: [
        {
          Reward: {
            OR: [
              { nickname: { contains: term, mode: 'insensitive' } },
              { description: { contains: term, mode: 'insensitive' } },
            ],
          },
        },
        {
          User: {
            OR: [
              { nickname: { startsWith: term, mode: 'insensitive' } },
              { username: { startsWith: term, mode: 'insensitive' } },
              { id: { startsWith: term, mode: 'insensitive' } },
            ],
          },
        },
      ],
    },
    orderBy: {
      ...(showProcessedOnly === 'true'
        ? { processedAt: 'desc' }
        : { createdAt: 'asc' }),
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        redeemedRewards: result.map((reward) => ({
          id: reward.id,
          processed: reward.processed,
          createdAt: reward.createdAt,
          processedAt: reward.processedAt,
          reward: {
            id: reward.id,
            nickname: reward.Reward.nickname,
            description: reward.Reward.description,
            createdAt: reward.Reward.createdAt,
            pointsRequired: reward.Reward.pointsRequired,
          },
          user: {
            id: reward.User.id,
            joinDate: reward.User.joinDate,
            points: reward.User.points,
            totalPoints: reward.User.totalPoints,
            username: reward.User.username,
            profilePicUrl: reward.User.profilePicUrl,
            nickname: reward.User.nickname,
          },
        })) as RedeemedRewardSearch[],
        totalPages: Math.ceil(total / PER_PAGE),
        totalRedeemedRewards: total,
        perPage: PER_PAGE,
      },
    },
    { status: 200 }
  );
}
