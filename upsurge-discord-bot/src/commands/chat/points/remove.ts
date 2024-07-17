import { PermissionFlagsBits, type GuildMember } from "discord.js";
import { SlashCommand } from "slashasaurus";
import { db } from "../../../db";
import { v4 as uuidv4 } from "uuid";
import { log } from "../../../log";

export default new SlashCommand(
  {
    name: "remove",
    description: "Remove a user's points",
    options: [
      {
        type: "USER",
        name: "user",
        description: "Which user would you like to remove points from?",
        required: true,
      },
      {
        type: "NUMBER",
        name: "amount",
        description: "Amount of points to remove.",
        required: true,
        minValue: 1,
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

        const amount = options.amount;
        const userOpts = options.user;
        if (!userOpts) {
          await interaction.reply({
            content: `Invalid user!`,
            ephemeral: true,
          });
          return;
        }

        const resolvedUser = userOpts as GuildMember;

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

        const totalPointsToSubtract = Math.min(user.totalPoints, amount);
        const pointsToSubtract = Math.min(user.points, amount);

        await db.user.update({
          where: {
            id_serviceId_serviceType: {
              serviceId: guild.id,
              id: resolvedUser.id,
              serviceType: "discord",
            },
          },
          data: {
            points: { decrement: pointsToSubtract },
            totalPoints: { decrement: totalPointsToSubtract },
          },
        });

        await db.pointActivity.create({
          data: {
            id: uuidv4(),
            points: pointsToSubtract,
            reason: "admin",
            type: "subtract",
            serviceId: guild.id,
            serviceType: "discord",
            userServiceType: "discord",
            userId: resolvedUser.id,
            userServiceId: guild.id,
          },
        });

        void log({
          guildId: guild.id,
          focus: "points",
          action: "pointsRemove",
          actionSource: "admin",
          content: `${resolvedUser.toString()} has had ${amount} points removed by ${interaction.member?.toString()}.`,
          data: {
            targetUserId: resolvedUser.id,
            executeUserId: interaction.member?.user.id,
            points: pointsToSubtract,
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        interaction.reply({
          content:
            `Successfully removed ` +
            "`" +
            pointsToSubtract +
            "`" +
            ` points from ${resolvedUser.toString()}!`,
          ephemeral: true,
        });
      } catch (e) {
        console.log(e);
      }
    },
  },
);
