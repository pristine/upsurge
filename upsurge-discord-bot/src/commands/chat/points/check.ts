import { SlashCommand } from "slashasaurus";
import { db } from "../../../db";

export default new SlashCommand(
  {
    name: "check",
    description: "Check the amount of points you have",
    options: [],
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    run: async (interaction) => {
      try {
        const guild = interaction.guild;
        if (!guild) return;

        const member = interaction.member;
        if (!member) return;

        const guildId = guild.id;
        const userId = member.user.id;

        const service = await db.service.findUnique({
          where: {
            id_type: {
              id: guildId,
              type: "discord",
            },
            Company: {
              mainServiceId: guild.id,
              mainServiceType: "discord",
            },
          },
        });
        if (!service) return;

        const user = await db.user.findUnique({
          where: {
            id_serviceId_serviceType: {
              id: userId,
              serviceId: guildId,
              serviceType: "discord",
            },
          },
        });
        if (!user) return;

        const rank = await db.user.count({
          where: {
            AND: [
              {
                points: {
                  gte: user.points, // changed from 'gt' to 'gte'
                },
              },
              {
                serviceId: guildId,
                serviceType: "discord",
                roles: { hasSome: service.userRoles },
              },
            ],
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        interaction.reply({
          content:
            `You currently have ` +
            "`" +
            user.points +
            "`" +
            ` points, and an all-time total of ` +
            "`" +
            user.totalPoints +
            "`" +
            ` points. Your rank is ` +
            "`" +
            rank +
            "`" +
            ` based on points.`,
        });
      } catch (e) {
        console.log(e);
      }
    },
  },
);
