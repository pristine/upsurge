import { db } from '@/lib/prisma';
import { type AutomationsBody } from '@/types/automations';
import { getCompanyWhereFromType } from '@/util/company';
import { getUserId, log } from '@/util/log';
import { toBlock } from '@/util/string';
import { type NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

function generateRandomBetweenInclusive(
  lowerBound: number,
  upperBound: number
) {
  return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
}

async function handleMessageCount(
  req: NextRequest,
  body: AutomationsBody,
  companyId: string,
  serviceType: string,
  serviceId: string
) {
  if (body.enabled !== undefined) {
    await db.messageCountAutomation.upsert({
      where: {
        serviceId_serviceType: {
          serviceId,
          serviceType: serviceType as 'discord',
        },
      },
      create: {
        id: uuidv4(),
        lowerBounds: 0,
        upperBounds: 100,
        Service: {
          connect: {
            id_type: {
              id: serviceId,
              type: serviceType as 'discord',
            },
          },
        },
        enabled: body.enabled,
      },
      update: {
        enabled: body.enabled,
      },
    });

    void log({
      serviceId,
      serviceType: serviceType as 'discord',
      action: 'messageCountAutomationUpdate',
      focus: 'automations',
      content: `${toBlock(
        await getUserId(req, 'whop')
      )} updated messageCountAutomation ${toBlock('enabled')} to ${toBlock(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        body.enabled.toString()
      )}!`,
      data: {
        type: 'enable',
        executeUserId: await getUserId(req, 'whop'),
        enabled: body.enabled,
      },
    });
  }

  if (body.spamDelay !== undefined) {
    await db.messageCountAutomation.upsert({
      where: {
        serviceId_serviceType: {
          serviceId,
          serviceType: serviceType as 'discord',
        },
      },
      create: {
        id: uuidv4(),
        lowerBounds: 0,
        upperBounds: 100,
        Service: {
          connect: {
            id_type: {
              id: serviceId,
              type: serviceType as 'discord',
            },
          },
        },
        enabled: false,
        spamDelay: body.spamDelay,
      },
      update: {
        spamDelay: body.spamDelay,
      },
    });

    void log({
      serviceId,
      serviceType: serviceType as 'discord',
      action: 'messageCountAutomationUpdate',
      focus: 'automations',
      content: `${toBlock(
        await getUserId(req, 'whop')
      )} updated messageCountAutomation ${toBlock('spamDelay')} to ${toBlock(
        body.spamDelay?.toString()
      )}!`,
      data: {
        type: 'spamDelay',
        executeUserId: await getUserId(req, 'whop'),
        spamDelay: body.spamDelay,
      },
    });
  }

  if (body.lowerBounds !== undefined && body.upperBounds !== undefined) {
    await db.messageCountAutomation.upsert({
      where: {
        serviceId_serviceType: {
          serviceId,
          serviceType: serviceType as 'discord',
        },
      },
      create: {
        id: uuidv4(),
        lowerBounds: body.lowerBounds,
        upperBounds: body.upperBounds,
        Service: {
          connect: {
            id_type: {
              id: serviceId,
              type: serviceType as 'discord',
            },
          },
        },
        enabled: false,
      },
      update: {
        lowerBounds: body.lowerBounds,
        upperBounds: body.upperBounds,
      },
    });

    await db.user.updateMany({
      where: {
        serviceId,
        serviceType: serviceType as 'discord',
      },
      data: {
        messageCountGoal: -1,
      },
    });

    void log({
      serviceId,
      serviceType: serviceType as 'discord',
      action: 'messageCountAutomationUpdate',
      focus: 'automations',
      content: `${toBlock(
        await getUserId(req, 'whop')
      )} updated messageCountAutomation ${toBlock('lower bounds')} to ${toBlock(
        body.lowerBounds.toString()
      )} and ${toBlock('upper bounds')} to ${toBlock(
        body.upperBounds.toString()
      )}!`,
      data: {
        type: 'bounds',
        executeUserId: await getUserId(req, 'whop'),
        lowerBounds: body.lowerBounds,
        upperBounds: body.upperBounds,
      },
    });
  }
}

async function handleMessageDrop(
  req: NextRequest,
  body: AutomationsBody,
  companyId: string,
  serviceType: string,
  serviceId: string
) {
  if (body.enabled !== undefined) {
    await db.messageDropAutomation.upsert({
      where: {
        serviceId_serviceType: {
          serviceId,
          serviceType: serviceType as 'discord',
        },
      },
      create: {
        id: uuidv4(),
        lowerBounds: 0,
        upperBounds: 100,
        amountLowerBounds: 0,
        amountUpperBounds: 100,
        currentCount: 0,
        goal: -1,
        Service: {
          connect: {
            id_type: {
              id: serviceId,
              type: serviceType as 'discord',
            },
          },
        },
        enabled: body.enabled,
      },
      update: {
        enabled: body.enabled,
      },
    });

    void log({
      serviceId,
      serviceType: serviceType as 'discord',
      action: 'messageDropAutomationUpdate',
      focus: 'automations',
      content: `${toBlock(
        await getUserId(req, 'whop')
      )} updated messageDropAutomation ${toBlock('enabled')} to ${toBlock(
        body.enabled.toString()
      )}!`,
      data: {
        type: 'enable',
        executeUserId: await getUserId(req, 'whop'),
        enabled: body.enabled,
      },
    });
  }

  if (body.lowerBounds !== undefined && body.upperBounds !== undefined) {
    await db.messageDropAutomation.upsert({
      where: {
        serviceId_serviceType: {
          serviceId,
          serviceType: serviceType as 'discord',
        },
      },
      create: {
        id: uuidv4(),
        lowerBounds: body.lowerBounds,
        upperBounds: body.upperBounds,
        amountLowerBounds: 0,
        amountUpperBounds: 100,
        currentCount: 0,
        goal: -1,
        Service: {
          connect: {
            id_type: {
              id: serviceId,
              type: serviceType as 'discord',
            },
          },
        },
        enabled: false,
      },
      update: {
        lowerBounds: body.lowerBounds,
        upperBounds: body.upperBounds,
      },
    });

    void log({
      serviceId,
      serviceType: serviceType as 'discord',
      action: 'messageDropAutomationUpdate',
      focus: 'automations',
      content: `${toBlock(
        await getUserId(req, 'whop')
      )} updated messageDropAutomationUpdate ${toBlock(
        'lower bounds'
      )} to ${toBlock(body.lowerBounds.toString())} and ${toBlock(
        'upper bounds'
      )} to ${toBlock(body.upperBounds.toString())}!`,
      data: {
        type: 'bounds',
        executeUserId: await getUserId(req, 'whop'),
        lowerBounds: body.lowerBounds,
        upperBounds: body.upperBounds,
      },
    });
  }

  if (
    body.amountLowerBounds !== undefined &&
    body.amountUpperBounds !== undefined
  ) {
    await db.messageDropAutomation.upsert({
      where: {
        serviceId_serviceType: {
          serviceId,
          serviceType: serviceType as 'discord',
        },
      },
      create: {
        id: uuidv4(),
        lowerBounds: 0,
        upperBounds: 100,
        amountLowerBounds: body.amountLowerBounds,
        amountUpperBounds: body.amountUpperBounds,
        currentCount: 0,
        goal: -1,
        Service: {
          connect: {
            id_type: {
              id: serviceId,
              type: serviceType as 'discord',
            },
          },
        },
        enabled: false,
      },
      update: {
        amountLowerBounds: body.amountLowerBounds,
        amountUpperBounds: body.amountUpperBounds,
      },
    });

    void log({
      serviceId,
      serviceType: serviceType as 'discord',
      action: 'messageDropAutomationUpdate',
      focus: 'automations',
      content: `${toBlock(
        await getUserId(req, 'whop')
      )} updated messageDropAutomationUpdate ${toBlock(
        'amount lower bounds'
      )} to ${toBlock(body.amountLowerBounds.toString())} and ${toBlock(
        'amount upper bounds'
      )} to ${toBlock(body.amountUpperBounds.toString())}!`,
      data: {
        type: 'amountBounds',
        executeUserId: await getUserId(req, 'whop'),
        amountLowerBounds: body.amountLowerBounds,
        amountUpperBounds: body.amountLowerBounds,
      },
    });
  }

  if (body.reset) {
    const automation = await db.messageDropAutomation.findUnique({
      where: {
        serviceId_serviceType: {
          serviceId,
          serviceType: serviceType as 'discord',
        },
      },
    });

    if (automation) {
      const goal = generateRandomBetweenInclusive(
        automation.lowerBounds,
        automation.upperBounds
      );

      await db.messageDropAutomation.update({
        where: {
          serviceId_serviceType: {
            serviceId,
            serviceType: serviceType as 'discord',
          },
        },
        data: {
          currentCount: 0,
          goal,
        },
      });

      void log({
        serviceId,
        serviceType: serviceType as 'discord',
        action: 'messageDropAutomationUpdate',
        focus: 'automations',
        content: `${toBlock(await getUserId(req, 'whop'))} ${toBlock(
          'reset'
        )} messageDropAutomationUpdate!`,
        data: {
          type: 'reset',
          executeUserId: await getUserId(req, 'whop'),
          goal,
        },
      });
    }
  }
}

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

  const { type }: AutomationsBody = body;

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

  if (type === 'messageCount') {
    await handleMessageCount(
      req,
      body as AutomationsBody,
      params.companyId,
      params.serviceType,
      params.serviceId
    );
  } else if (type === 'messageDrop') {
    await handleMessageDrop(
      req,
      body as AutomationsBody,
      params.companyId,
      params.serviceType,
      params.serviceId
    );
  } else {
    return NextResponse.json(
      { success: false, error: 'unsupported type' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
