import { db } from '@/lib/prisma';
import { type User } from '@/types/users';
import { getCompanyWhereFromType } from '@/util/company';
import { type NextRequest, NextResponse } from 'next/server';

const PER_PAGE = 10;

interface OrderByType {
  points?: 'asc' | 'desc';
  totalPoints?: 'asc' | 'desc';
  RedeemedReward?: { _count: 'asc' | 'desc' };
}

const orderByMap: Record<string, OrderByType> = {
  none: {},
  points: { points: 'desc' },
  totalPoints: { totalPoints: 'desc' },
  rewardsRedeemed: { RedeemedReward: { _count: 'desc' } },
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

  const result = await db.user.findMany({
    where: {
      serviceId: params.serviceId,
      serviceType: params.serviceType as 'discord',
      ...(params.serviceType === 'discord' &&
        dbService.userRoles.length > 0 && {
          roles: {
            hasSome: dbService.userRoles,
          },
        }),
      active: true,
      OR: [
        { username: { startsWith: term, mode: 'insensitive' } },
        { nickname: { startsWith: term, mode: 'insensitive' } },
        { id: { startsWith: term, mode: 'insensitive' } },
      ],
    },
    include: {
      RedeemedReward: true,
    },
    orderBy: orderByMap[sortBy],
    skip: (pageNumber - 1) * PER_PAGE,
    take: PER_PAGE,
  });

  const total = await db.user.count({
    where: {
      serviceId: params.serviceId,
      serviceType: params.serviceType as 'discord',
      ...(params.serviceType === 'discord' &&
        dbService.userRoles.length > 0 && {
          roles: {
            hasSome: dbService.userRoles,
          },
        }),
      active: true,
      OR: [
        { username: { startsWith: term, mode: 'insensitive' } },
        { nickname: { startsWith: term, mode: 'insensitive' } },
        { id: { startsWith: term, mode: 'insensitive' } },
      ],
    },
    orderBy: orderByMap[sortBy],
  });

  return NextResponse.json(
    {
      success: true,
      data: {
        users: result.map((user) => ({
          id: user.id,
          joinDate: user.joinDate,
          points: user.points,
          rewardsRedeemed: user.RedeemedReward.length,
          totalPoints: user.totalPoints,
          username: user.username,
          profilePicUrl: user.profilePicUrl,
          nickname: user.nickname,
        })) as User[],
        totalPages: Math.ceil(total / PER_PAGE),
        totalUsers: total,
        perPage: PER_PAGE,
      },
    },
    { status: 200 }
  );
}
