import { db } from '@/lib/prisma';
import { getCompanyWhereFromType } from '@/util/company';
import { type NextRequest, NextResponse } from 'next/server';

// return the top 10 points holders
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

  const top10PointHolders = await db.user.findMany({
    where: {
      serviceId: params.serviceId,
      serviceType: params.serviceType as 'discord',
      active: true,
      ...(params.serviceType === 'discord' &&
        dbService.userRoles.length > 0 && {
          roles: {
            hasSome: dbService.userRoles,
          },
        }),
    },
    orderBy: {
      points: 'desc',
    },
    select: {
      id: true,
      joinDate: true,
      username: true,
      points: true,
      profilePicUrl: true,
    },
    take: 10,
  });

  return NextResponse.json(
    { success: true, data: top10PointHolders },
    { status: 200 }
  );
}
