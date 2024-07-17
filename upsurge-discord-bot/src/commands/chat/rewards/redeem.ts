import { SlashCommand } from "slashasaurus";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { db } from "../../../db";
import { v4 as uuidv4 } from "uuid";
import { type Reward } from "@prisma/client";
import { log } from "../../../log";

export default new SlashCommand(
  {
    name: "redeem",
    description: "Redeem a reward",
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

        let user = await db.user.findUnique({
          where: {
            id_serviceId_serviceType: {
              serviceId: guild.id,
              id: member.user.id,
              serviceType: "discord",
            },
          },
        });
        if (!user) {
          await interaction.reply({
            content: `You do not exist in database! Try again in a few minutes.`,
            ephemeral: true,
          });
          return;
        }

        const availableRewards = await db.reward.findMany({
          where: {
            serviceId: guild.id,
            serviceType: "discord",
            pointsRequired: { lte: user.points },
          },
        });

        if (availableRewards.length === 0) {
          await interaction.reply({
            content: `No rewards available to redeem!`,
            ephemeral: true,
          });
          return;
        }

        const options: StringSelectMenuOptionBuilder[] = [];
        for (const reward of availableRewards) {
          options.push(
            new StringSelectMenuOptionBuilder()
              .setLabel(reward.nickname)
              .setDescription(reward.description.substring(0, 100))
              .setValue(reward.id),
          );
        }

        const select = new StringSelectMenuBuilder()
          .setCustomId("reward")
          .setPlaceholder("Make a selection among these available rewards!")
          .addOptions(options);

        const row =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

        const response = await interaction.reply({
          content: "Choose your reward!",
          components: [row],
          ephemeral: true,
        });

        const collector = response.createMessageComponentCollector({
          time: 3_600_000,
        });

        let reward: Reward | null = null;
        collector.on("collect", async (i) => {
          if (i.isStringSelectMenu()) {
            reward = await db.reward.findUnique({
              where: {
                id: i.values[0],
              },
            });
            if (!reward) {
              await interaction.editReply({
                content: "Invalid selection",
                components: [],
              });
              return;
            }

            const yes = new ButtonBuilder()
              .setCustomId("yes")
              .setLabel("Yes")
              .setStyle(ButtonStyle.Success);

            const no = new ButtonBuilder()
              .setCustomId("no")
              .setLabel("NO")
              .setStyle(ButtonStyle.Danger);

            const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
              no,
              yes,
            );

            await i.update({
              content: `Are you sure you want to redeem a **${reward.nickname}**?`,
              components: [row2],
            });
          } else if (reward && i.isButton()) {
            if (i.customId === "yes") {
              user = await db.user.findUnique({
                where: {
                  id_serviceId_serviceType: {
                    serviceId: guild.id,
                    id: member.user.id,
                    serviceType: "discord",
                  },
                },
              });
              if (!user) {
                await i.update({
                  content: `Failed to refetch user!`,
                  components: [],
                });
                return;
              }

              if (user.points < reward.pointsRequired) {
                await i.update({
                  content: `Not enough points!`,
                  components: [],
                });
                return;
              }

              const [, redeemedReward] = await db.$transaction([
                db.user.update({
                  where: {
                    id_serviceId_serviceType: {
                      id: member.user.id,
                      serviceId: guild.id,
                      serviceType: "discord",
                    },
                  },
                  data: {
                    points: { decrement: reward.pointsRequired },
                  },
                }),
                db.redeemedReward.create({
                  data: {
                    id: uuidv4(),
                    pointsUsed: reward.pointsRequired,
                    rewardId: reward.id,
                    userId: member.user.id,
                    serviceId: guild.id,
                    serviceType: "discord",
                    userServiceId: guild.id,
                    userServiceType: "discord",
                    PointActivity: {
                      create: {
                        id: uuidv4(),
                        points: reward.pointsRequired,
                        reason: "reward",
                        type: "subtract",
                        serviceId: guild.id,
                        serviceType: "discord",
                        userServiceType: "discord",
                        userId: member.user.id,
                        userServiceId: guild.id,
                      },
                    },
                  },
                }),
              ]);

              void log({
                guildId: guild.id,
                focus: "redeemedRewards",
                content:
                  `${i.user.toString()} has redeemed the ` +
                  "`" +
                  reward.nickname +
                  "`" +
                  ` reward!`,
                action: "redemeedRewardsCreate",
                actionSource: "user",
                data: {
                  executeUserId: user.id,
                  redeemedRewardId: redeemedReward.id,
                  rewardId: redeemedReward.rewardId,
                },
              });

              await i.update({
                content: `Successfully redeemed a **${reward.nickname}**!`,
                components: [],
              });
            } else if (i.customId === "no") {
              await i.update({
                content: "Reward redemption cancelled",
                components: [],
              });
            }
          }
        });

        collector.on("dispose", async () => {
          await interaction.editReply({
            content: "Selection not received within 1 minute, cancelling",
            components: [],
          });
        });
      } catch (e) {
        console.log(e);
      }
    },
  },
);
