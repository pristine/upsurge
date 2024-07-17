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

  const userCount = await db.user.count({
    where: {
      serviceId: params.serviceId,
      serviceType: params.serviceType as 'discord',
      active: true,
      ...(params.serviceType === 'discord' &&
        service.userRoles.length > 0 && {
          roles: {
            hasSome: service.userRoles,
          },
        }),
    },
  });

  const newUsersPromises = Array(7)
    .fill(null)
    .map(async (_, i) => {
      const startOfDay = new Date();
      startOfDay.setDate(startOfDay.getDate() - i);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await db.user.count({
        where: {
          joinDate: {
            gte: startOfDay,
            lt: endOfDay,
          },
          active: true,
          serviceId: params.serviceId,
          serviceType: params.serviceType as 'discord',
          ...(params.serviceType === 'discord' &&
            service.userRoles.length > 0 && {
              roles: {
                hasSome: service.userRoles,
              },
            }),
        },
      });

      return { day: startOfDay, count };
    });

  const newUsers = await Promise.all(newUsersPromises);

  return NextResponse.json(
    { success: true, data: { totalUsers: userCount, newUsers } },
    { status: 200 }
  );
}
