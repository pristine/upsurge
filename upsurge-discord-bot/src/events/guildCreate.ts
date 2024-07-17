import { type PermissionResolvable, type Guild, ChannelType } from "discord.js";
import { type Event } from "../event";
import { db } from "../db";
import { queueUpdateChannelMessages } from "../jobs";

const requiredPermissions: PermissionResolvable[] = [
  "ViewChannel",
  "ViewGuildInsights",
  "SendMessages",
  "SendMessagesInThreads",
  "EmbedLinks",
  "AttachFiles",
  "ReadMessageHistory",
  "UseExternalEmojis",
  "UseExternalStickers",
  "AddReactions",
  "ManageMessages",
];

const event: Event = {
  name: "guildCreate",
  once: false,
  async execute(guild: Guild) {
    try {
      const service = await db.service.findUnique({
        where: {
          id_type: {
            type: "discord",
            id: guild.id,
          },
        },
      });
      if (service === null) {
        await guild.leave();
        return;
      }

      if (
        requiredPermissions.some(
          (permission) => !guild.members.me?.permissions.has(permission),
        )
      ) {
        await guild.leave();
        return;
      }

      const updatedService = await db.service.update({
        where: {
          id_type: {
            type: "discord",
            id: guild.id,
          },
        },
        data: {
          connected: true,
        },
      });

      const members = await guild.members.fetch();

      await db.user.createMany({
        data: members.map((member) => ({
          id: member.id,
          serviceId: updatedService.id,
          serviceType: "discord",
          username: member.user.username,
          nickname: member.user.displayName,
          profilePicUrl: member.user.avatarURL(),
          roles: member.roles.cache.map((role) => role.id),
          joinDate: member.joinedAt ?? new Date(),
        })),
        skipDuplicates: true,
      });

      const channels = await guild.channels.fetch();

      const filteredChannels = channels.filter(
        (channel) =>
          channel &&
          channel.isTextBased() &&
          channel.type === ChannelType.GuildText &&
          guild.members.me?.permissionsIn(channel).has("ReadMessageHistory") &&
          guild.members.me?.permissionsIn(channel).has("ViewChannel"),
      );

      for (const channel of filteredChannels.values()) {
        await queueUpdateChannelMessages({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          channelId: channel!.id,
          guildId: guild.id,
        });
      }

      console.log(`guildCreate: ${guild.name}`);
    } catch (e) {
      console.log(e);
    }
  },
};

export default event;
