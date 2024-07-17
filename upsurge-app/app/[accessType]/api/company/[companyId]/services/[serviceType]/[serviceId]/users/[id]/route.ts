import { db } from '@/lib/prisma';
import { type User } from '@/types/users';
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
      id: string;
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

  const user = await db.user.findUnique({
    where: {
      id_serviceId_serviceType: {
        id: params.id,
        serviceId: service.id,
        serviceType: service.type,
      },
      serviceType: params.serviceType as 'discord',
    },
  });
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: 'User does not exist within database.',
      },
      {
        status: 400,
      }
    );
  }

  return NextResponse.json(
    {
      success: true,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      data: {
        id: user.id,
        joinDate: user.joinDate,
        points: user.points,
        totalPoints: user.totalPoints,
        username: user.username,
        profilePicUrl: user.profilePicUrl,
        nickname: user.nickname,
      } as User,
    },
    { status: 200 }
  );
}
