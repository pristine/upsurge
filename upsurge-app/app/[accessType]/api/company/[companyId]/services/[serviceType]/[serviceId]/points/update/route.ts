import { db } from '@/lib/prisma';
import { getCompanyWhereFromType } from '@/util/company';
import { getUserId, log } from '@/util/log';
import { toBlock } from '@/util/string';
import { type NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

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

  const { userId, points, mode } = body;

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

  if (mode === 'add') {
    await db.user.update({
      where: {
        id_serviceId_serviceType: {
          serviceId: params.serviceId,
          id: userId,
          serviceType: params.serviceType as 'discord',
        },
      },
      data: {
        points: { increment: points },
        totalPoints: { increment: points },
      },
    });

    await db.pointActivity.create({
      data: {
        id: uuidv4(),
        points,
        reason: 'admin',
        type: 'add',
        serviceId: params.serviceId,
        serviceType: params.serviceType as 'discord',
        userServiceType: params.serviceType as 'discord',
        userId,
        userServiceId: params.serviceId,
      },
    });

    void log({
      serviceId: params.serviceId,
      serviceType: params.serviceType as 'discord',
      action: 'pointsGive',
      focus: 'points',
      content: `${toBlock(await getUserId(req, 'whop'))} gave ${toBlock(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        userId
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      )} ${toBlock(points.toString())} points!`,
      data: {
        executeUserId: await getUserId(req, 'whop'),
        targetUserId: userId,
        points,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } else if (mode === 'subtract') {
    const user = await db.user.findUnique({
      where: {
        id_serviceId_serviceType: {
          serviceId: params.serviceId,
          id: userId,
          serviceType: params.serviceType as 'discord',
        },
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

    const pointsToSubtract = Math.min(user.points, points as number);
    const pointsPost = user.points - pointsToSubtract;

    const totalPointsToSubtract = Math.min(user.totalPoints, points as number);

    await db.user.update({
      where: {
        id_serviceId_serviceType: {
          serviceId: params.serviceId,
          id: userId,
          serviceType: params.serviceType as 'discord',
        },
      },
      data: {
        points: pointsPost,
        totalPoints: { decrement: totalPointsToSubtract }, // we do this because admin actions don't count
      },
    });

    await db.pointActivity.create({
      data: {
        id: uuidv4(),
        points: pointsToSubtract,
        reason: 'admin',
        type: 'subtract',
        serviceId: params.serviceId,
        serviceType: params.serviceType as 'discord',
        userServiceType: params.serviceType as 'discord',
        userId,
        userServiceId: params.serviceId,
      },
    });

    void log({
      serviceId: params.serviceId,
      serviceType: params.serviceType as 'discord',
      action: 'pointsRemove',
      focus: 'points',
      content: `${toBlock(await getUserId(req, 'whop'))} removed ${toBlock(
        pointsToSubtract.toString()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      )} points from ${toBlock(userId)}!`,
      data: {
        executeUserId: await getUserId(req, 'whop'),
        targetUserId: userId,
        points: pointsToSubtract,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Invalid mode.',
    },
    {
      status: 400,
    }
  );
}
