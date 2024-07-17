import { db } from '@/lib/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import { getCompanyWhereFromType } from '@/util/company';

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      companyId: string;
      serviceType: string;
      serviceId: string;
      type: string;
      accessType: 'whop';
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

  if (params.type === 'messageCount') {
    const messageCountAutomation = await db.messageCountAutomation.findUnique({
      where: {
        serviceId_serviceType: {
          serviceId: params.serviceId,
          serviceType: params.serviceType as 'discord',
        },
      },
      select: {
        id: true,
        enabled: true,
        lowerBounds: true,
        upperBounds: true,
        spamDelay: true,
      },
    });

    return NextResponse.json(
      { success: true, data: messageCountAutomation },
      { status: 200 }
    );
  } else if (params.type === 'messageDrop') {
    const messageDropAutomation = await db.messageDropAutomation.findUnique({
      where: {
        serviceId_serviceType: {
          serviceId: params.serviceId,
          serviceType: params.serviceType as 'discord',
        },
      },
      select: {
        id: true,
        enabled: true,
        lowerBounds: true,
        upperBounds: true,
        amountLowerBounds: true,
        amountUpperBounds: true,
        currentCount: true,
        goal: true,
      },
    });

    return NextResponse.json(
      { success: true, data: messageDropAutomation },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Invalid automation type.',
    },
    {
      status: 400,
    }
  );
}
