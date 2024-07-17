import { SlashCommand } from "slashasaurus";
import { db } from "../../../db";
import { type Reward } from "@prisma/client";
import Embed from "../../../embed";

const formatRewards = (rewards: Reward[], skipCount?: number): string => {
  const formatted = rewards.map((reward, index) => {
    return `${index + (skipCount ?? 0) + 1}) **${reward.nickname}** - ${
      reward.pointsRequired
    } points`;
  });

  return formatted.join("\n");
};

const takeAmount = 5;

const reactions = ["⬅️", "➡️"];

export default new SlashCommand(
  {
    name: "list",
    description: "List rewards available to redeem",
    options: [],
  },
  {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    run: async (interaction) => {
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

      try {
        const [baseRewards, count] = await db.$transaction([
          db.reward.findMany({
            where: {
              serviceId: guild.id,
              serviceType: "discord",
            },
            orderBy: {
              pointsRequired: "desc",
            },
            take: takeAmount,
          }),
          db.reward.count({
            where: {
              serviceId: guild.id,
              serviceType: "discord",
            },
          }),
        ]);

        const baseEmbed = new Embed()
          .setTitle(`Rewards (Page 1/${Math.ceil(count / takeAmount)})`)
          .setDescription(formatRewards(baseRewards));

        // await interaction.editReply("Leaderboard loaded!");

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        interaction
          .reply({ embeds: [baseEmbed], fetchReply: true })
          .then(async (msg): Promise<any> => {
            if (count > takeAmount) {
              for (const reaction of reactions) {
                await msg.react(reaction);
              }
              const filter = (reaction: any, user: any): any => {
                return (
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  reactions.includes(reaction.emoji.name) &&
                  user.id === member.user.id &&
                  !user.bot
                );
              };

              const collector = msg.createReactionCollector({
                filter,
                time: 60000,
              });
              let currentPage = 0;
              collector.on("collect", (reaction, user) => {
                // Remove the user's reaction
                void reaction.users
                  .remove(user.id)
                  .then(async () => {
                    // Change the page based on the reaction
                    if (reaction.emoji.name === "⬅️") {
                      if (currentPage > 0) currentPage--;
                    } else if (reaction.emoji.name === "➡️") {
                      if (currentPage < Math.ceil(count / takeAmount - 1))
                        currentPage++;
                    }
                    // Fetch the new page of users
                    const rewards = await db.reward.findMany({
                      where: {
                        serviceId: guild.id,
                        serviceType: "discord",
                      },
                      orderBy: {
                        pointsRequired: "desc",
                      },
                      take: takeAmount,
                      skip: takeAmount * currentPage,
                    });
                    // Update the embed with the new page
                    const embed = new Embed()
                      .setTitle(
                        `Rewards (Page ${currentPage + 1}/${Math.ceil(
                          count / takeAmount,
                        )})`,
                      )
                      .setDescription(
                        formatRewards(rewards, currentPage * takeAmount),
                      );
                    await msg.edit({ embeds: [embed] });
                  })
                  .catch((e) => {
                    console.log(e);
                    if (e.code && e.code === 50001) {
                      void interaction.editReply(
                        "Insufficient permissions to manage messages!",
                      );
                    } else {
                      void interaction.editReply(
                        `An unknown error occured. Error code: ${e.code}.`,
                      );
                    }
                  });
              });
            }
          })
          .catch((e) => {
            console.log(e);
            if (e.code && e.code === 50001) {
              void interaction.editReply(
                "Insufficient permissions to send/read messages or add reactions!",
              );
            } else {
              void interaction.editReply(
                `An unknown error occured. Error code: ${e.code}.`,
              );
            }
          });
      } catch (e) {
        console.log(e);
        try {
          await interaction.reply("An error occured.");
        } catch (e) {
          console.log(e);
        }
      }
    },
  },
);
