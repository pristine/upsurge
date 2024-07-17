import { PermissionFlagsBits, type GuildMember } from "discord.js";
import { SlashCommand } from "slashasaurus";
import { db } from "../../../db";

export default new SlashCommand(
  {
    name: "user",
    description: "Check the amount of points a user has",
    options: [
      {
        type: "USER",
        name: "user",
        description: "Which user would you like to check?",
        required: true,
      },
    ],
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    run: async (interaction, _client, options) => {
      try {
        if (
          !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
        )
          return;

        const userOpt = options.user;
        if (!userOpt) {
          await interaction.reply({
            content: `Invalid user!`,
            ephemeral: true,
          });
          return;
        }

        const resolvedUser = userOpt as GuildMember;

        const guild = interaction.guild;
        if (!guild) return;

        const service = await db.service.findUnique({
          where: {
            id_type: {
              id: guild.id,
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
              serviceId: guild.id,
              id: resolvedUser.id,
              serviceType: "discord",
            },
          },
        });
        if (!user) {
          await interaction.reply({
            content: `User does not exist in database! Try again in a few minutes.`,
            ephemeral: true,
          });
          return;
        }

        const rank = await db.user.count({
          where: {
            AND: [
              {
                points: {
                  gte: user.points, // changed from 'gt' to 'gte'
                },
              },
              {
                serviceId: service.id,
                serviceType: "discord",
                roles: { hasSome: service.userRoles },
              },
            ],
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        interaction.reply({
          content:
            `${resolvedUser.toString()} currently has ` +
            "`" +
            user.points +
            "`" +
            ` points, and an all-time total of ` +
            "`" +
            user.totalPoints +
            "`" +
            ` points. Their rank is ` +
            "`" +
            rank +
            "`" +
            ` based on points.`,
          ephemeral: true,
        });
      } catch (e) {
        console.log(e);
      }
    },
  },
);
