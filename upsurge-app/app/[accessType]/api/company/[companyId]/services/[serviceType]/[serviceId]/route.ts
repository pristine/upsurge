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
    select: {
      id: true,
      type: true,
      nickname: true,
      connected: true,
      setRoles: true,
      mainChannel: true,
      logChannel: true,
    },
  });
  if (!service)
    return NextResponse.json(
      { success: true, error: 'invalid input' },
      { status: 401 }
    );

  const setMainChannel = service.mainChannel.length > 0;
  const setLogChannel = service.logChannel.length > 0;

  // Create a new object excluding the mainChannel property
  const { mainChannel, logChannel, ...restOfService } = service;

  return NextResponse.json(
    {
      success: true,
      data: { ...restOfService, setMainChannel, setLogChannel },
    },
    { status: 200 }
  );
}
