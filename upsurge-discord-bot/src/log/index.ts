import {
  type LogFocus,
  type LogAction,
  type LogActionSource,
} from "@prisma/client";
import { db } from "../db";
import { v4 as uuidv4 } from "uuid";
import client from "../client";
import Embed from "../embed";

export interface LogData {
  guildId: string;

  focus: LogFocus;

  action: LogAction;
  actionSource: LogActionSource;

  content: string;
  data?: any;
}

const getTitleByFocus = (focus: LogFocus): string => {
  switch (focus) {
    case "automations":
      return "New Automation Log";
    case "points":
      return "New Point Log";
    case "redeemedRewards":
      return "New Redeemed Reward Log!";
    case "rewards":
      return "New Reward Log";
    case "users":
      return "New User Log";
    default:
      return "New Log";
  }
};

export async function log(data: LogData): Promise<void> {
  try {
    const service = await db.service.findUnique({
      where: {
        id_type: {
          id: data.guildId,
          type: "discord",
        },
      },
    });
    if (!service) {
      return;
    }

    try {
      if (service.logChannel.length) {
        const guild = await client.guilds.fetch(data.guildId);
        if (guild) {
          const channel = await guild.channels.fetch(service.logChannel);
          if (channel && channel.isTextBased()) {
            const embed = new Embed()
              .setTitle(getTitleByFocus(data.focus))
              .setFields([
                {
                  name: "Focus",
                  value: data.focus,
                  inline: true,
                },
                {
                  name: "Source",
                  value: "discord",
                  inline: true,
                },
                {
                  name: "Content",
                  value: data.content,
                },
                {
                  name: "Action",
                  value: data.action,
                  inline: true,
                },
                {
                  name: "Action Source",
                  value: data.actionSource,
                  inline: true,
                },
              ]);

            await channel.send({
              embeds: [embed],
            });
          }
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
        actionSource: data.actionSource,
        source: "discord",
        serviceId: data.guildId,
        serviceType: "discord",
        data: data.data,
      },
    });
  } catch (e) {
    console.log(e);
  }
}
