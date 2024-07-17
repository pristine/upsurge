import { PermissionFlagsBits, type GuildMember } from "discord.js";
import { SlashCommand } from "slashasaurus";
import { db } from "../../../db";
import { v4 as uuidv4 } from "uuid";
import { log } from "../../../log";

export default new SlashCommand(
  {
    name: "give",
    description: "Give a user points",
    options: [
      {
        type: "USER",
        name: "user",
        description: "Which user would you like to give points to?",
        required: true,
      },
      {
        type: "NUMBER",
        name: "amount",
        description: "Amount of points to give.",
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
        const user = options.user;
        if (!user) {
          await interaction.reply({
            content: `Invalid user!`,
            ephemeral: true,
          });
          return;
        }

        const resolvedUser = user as GuildMember;

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

        await db.user.update({
          where: {
            id_serviceId_serviceType: {
              serviceId: guild.id,
              id: resolvedUser.id,
              serviceType: "discord",
            },
          },
          data: {
            points: { increment: amount },
            totalPoints: { increment: amount },
          },
        });

        await db.pointActivity.create({
          data: {
            id: uuidv4(),
            points: amount,
            reason: "admin",
            type: "add",
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
          action: "pointsGive",
          actionSource: "admin",
          content: `${resolvedUser.toString()} has been given ${amount} points by ${interaction.member?.toString()}.`,
          data: {
            targetUserId: resolvedUser.id,
            executeUserId: interaction.member?.user.id,
            points: amount,
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        interaction.reply({
          content:
            `Successfully gave ${resolvedUser.toString()} ` +
            "`" +
            amount +
            "`" +
            ` points!`,
          ephemeral: true,
        });
      } catch (e) {
        console.log(e);
      }
    },
  },
);
