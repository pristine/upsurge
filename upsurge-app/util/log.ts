import { db } from '@/lib/prisma';
import {
  type LogFocus,
  type LogAction,
  type ServiceType,
  type Service,
} from '@prisma/client';
import { validateToken } from '@whop-apps/sdk';
import { type NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import EmbedBuilder from '@discord-additions/embed-builder';

export interface LogData {
  serviceId: string;
  serviceType: ServiceType;

  focus: LogFocus;

  action: LogAction;

  content: string;
  data?: any;
}

const getTitleByFocus = (focus: LogFocus): string => {
  switch (focus) {
    case 'automations':
      return 'New Automation Log';
    case 'points':
      return 'New Point Log';
    case 'redeemedRewards':
      return 'New Redeemed Reward Log!';
    case 'rewards':
      return 'New Reward Log';
    case 'users':
      return 'New User Log';
    default:
      return 'New Log';
  }
};

async function sendDiscordLog(service: Service, data: LogData) {
  try {
    const embed = new EmbedBuilder()
      .setTitle(getTitleByFocus(data.focus))
      .setColor(8946904)
      .setTimestamp(new Date())
      .setFooter(
        'Upsurge',
        'https://cdn.discordapp.com/attachments/715592184690376754/1187541146877034516/Group_37002.png?ex=65b2f260&is=65a07d60&hm=d343698a9e0eb880145e35bb2a72e9ea294a718839a27f2f8afe2a18cdd2a3a3&'
      )
      .addField('Focus', data.focus, true)
      .addField('Source', 'web', true)
      .addField('Content', data.content)
      .addField('Action', data.action, true)
      .addField('Action Source', 'admin', true);

    await fetch(
      `https://discord.com/api/channels/${service.logChannel}/messages`,
      {
        method: 'POST',
        headers: {
          authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed.toJSON()],
        }),
      }
    );
  } catch (e) {
    console.log(e);
  }
}

export async function log(data: LogData): Promise<void> {
  try {
    const service = await db.service.findUnique({
      where: {
        id_type: {
          id: data.serviceId,
          type: data.serviceType,
        },
      },
    });
    if (service == null) {
      return;
    }

    try {
      if (service.logChannel.length) {
        switch (data.serviceType) {
          case 'discord':
            void sendDiscordLog(service, data);
        }
      }
    } catch (e) {
      console.log(e);
    }

    await db.log.create({
      data: {
        id: uuidv4(),
        content: data.content,
        focus: data.focus,
        action: data.action,
        actionSource: 'admin',
        source: 'web',
        serviceId: data.serviceId,
        serviceType: data.serviceType,
        data: data.data,
      },
    });
  } catch (e) {
    console.log(e);
  }
}

export async function getUserId(req: NextRequest, from: 'whop') {
  switch (from) {
    case 'whop':
      // eslint-disable-next-line no-case-declarations
      const { userId } = await validateToken({ headers: req.headers });
      return userId;
  }
}
