import { db } from '@/lib/prisma';
import { type User } from '@/types/users';
import { getCompanyWhereFromType } from '@/util/company';
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

  const { term } = body;

  if (!term) {
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

  const searchTerm = term as string;

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
        { username: { startsWith: searchTerm, mode: 'insensitive' } },
        { id: { startsWith: searchTerm, mode: 'insensitive' } },
      ],
    },
    include: {
      RedeemedReward: true,
    },
  });

  return NextResponse.json(
    {
      success: true,
      data: result.map((user) => ({
        id: user.id,
        joinDate: user.joinDate,
        points: user.points,
        rewardsRedeemed: user.RedeemedReward.length,
        totalPoints: user.totalPoints,
        username: user.username,
        profilePicUrl: user.profilePicUrl,
        nickname: user.nickname,
      })) as User[],
    },
    { status: 200 }
  );
}
