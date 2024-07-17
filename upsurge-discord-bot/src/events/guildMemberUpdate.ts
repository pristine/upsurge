import { type GuildMember } from "discord.js";
import { type Event } from "../event";
import { db } from "../db";

const event: Event = {
  name: "guildMemberUpdate",
  once: false,
  async execute(oldMember: GuildMember, newMember: GuildMember) {
    try {
      const service = await db.service.findUnique({
        where: {
          id_type: {
            type: "discord",
            id: newMember.guild.id,
          },
        },
      });
      if (service === null) return;

      try {
        await db.user.upsert({
          where: {
            id_serviceId_serviceType: {
              id: oldMember.user.id,
              serviceId: oldMember.guild.id,
              serviceType: "discord",
            },
          },
          create: {
            id: newMember.user.id,
            username: newMember.user.username,
            nickname: newMember.user.displayName,
            profilePicUrl: newMember.user.avatarURL(),
            joinDate: newMember.joinedAt ?? new Date(),
            roles: newMember.roles.cache.map((role) => role.id),
            Service: {
              connect: {
                id_type: {
                  type: "discord",
                  id: newMember.guild.id,
                },
              },
            },
          },
          update: {
            roles: newMember.roles.cache.map((role) => role.id),
            username: newMember.user.username,
            nickname: newMember.user.displayName,
            profilePicUrl: newMember.user.avatarURL(),
          },
        });
      } catch (e) {
        console.log(`User: ${oldMember.id}\n${e}`);
      }

      console.log(
        `guildMemberUpdate: ${oldMember.guild.name}: ${oldMember.displayName}`,
      );
    } catch (e) {
      console.log(e);
    }
  },
};

export default event;
