import { type GuildMember } from "discord.js";
import { type Event } from "../event";
import { db } from "../db";

const event: Event = {
  name: "guildMemberAdd",
  once: false,
  async execute(member: GuildMember) {
    try {
      const service = await db.service.findUnique({
        where: {
          id_type: {
            type: "discord",
            id: member.guild.id,
          },
        },
      });
      if (service === null) return;

      await db.user.upsert({
        where: {
          id_serviceId_serviceType: {
            id: member.user.id,
            serviceId: member.guild.id,
            serviceType: "discord",
          },
        },
        create: {
          id: member.user.id,
          username: member.user.username,
          nickname: member.user.displayName,
          profilePicUrl: member.user.avatarURL(),
          joinDate: member.joinedAt ?? new Date(),
          roles: member.roles.cache.map((role) => role.id),
          Service: {
            connect: {
              id_type: {
                type: "discord",
                id: member.guild.id,
              },
            },
          },
        },
        update: {
          username: member.user.username,
          nickname: member.user.displayName,
          profilePicUrl: member.user.avatarURL(),
          joinDate: member.joinedAt ?? new Date(),
          roles: member.roles.cache.map((role) => role.id),
        },
      });

      console.log(
        `guildMemberAdd: ${member.guild.name}: ${member.displayName}`,
      );
    } catch (e) {
      console.log(e);
    }
  },
};

export default event;
