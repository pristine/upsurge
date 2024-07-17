import { SlashCommand } from "slashasaurus";
import { db } from "../../../db";
import Embed from "../../../embed";
import { type User } from "@prisma/client";

const formatLeaderboard = (
  users: User[],
  top?: boolean,
  skipCount?: number,
): string => {
  const formatted = users.map((user, index) => {
    if (top) {
      switch (index) {
        case 0:
          return `:first_place: <@${user.id}> - ${user.points} points`;
        case 1:
          return `:second_place: <@${user.id}> - ${user.points} points`;
        case 2:
          return `:third_place: <@${user.id}> - ${user.points} points`;
        default:
          return `${index + 1}) <@${user.id}> - ${user.points} points`;
      }
    } else {
      return `${index + (skipCount ?? 0) + 1}) <@${user.id}> - ${
        user.points
      } points`;
    }
  });

  return formatted.join("\n");
};

const reactions = ["⬅️", "➡️"];

const takeAmount = 10;

export default new SlashCommand(
  {
    name: "leaderboard",
    description: "View the points leaderboard",
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

        // await interaction.reply({
        //   content: "Loading leaderboard...",
        //   ephemeral: true,
        //   fetchReply: true,
        // });

        try {
          const [baseUsers, count] = await db.$transaction([
            db.user.findMany({
              where: {
                serviceId: guildId,
                serviceType: "discord",
                roles: { hasSome: service.userRoles },
              },
              orderBy: {
                points: "desc",
              },
              take: takeAmount,
              include: {
                _count: true,
              },
            }),
            db.user.count({
              where: {
                serviceId: guildId,
                serviceType: "discord",
                roles: { hasSome: service.userRoles },
              },
            }),
          ]);

          const baseEmbed = new Embed()
            .setTitle(
              `Points Leaderboard (Page 1/${Math.ceil(count / takeAmount)})`,
            )
            .setDescription(formatLeaderboard(baseUsers, true));

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
                      const users = await db.user.findMany({
                        where: {
                          serviceId: guildId,
                          serviceType: "discord",
                          roles: { hasSome: service.userRoles },
                        },
                        orderBy: {
                          points: "desc",
                        },
                        skip: currentPage * takeAmount,
                        take: takeAmount,
                        include: {
                          _count: true,
                        },
                      });
                      // Update the embed with the new page
                      const embed = new Embed()
                        .setTitle(
                          `Points Leaderboard (Page ${
                            currentPage + 1
                          }/${Math.ceil(count / takeAmount)})`,
                        )
                        .setDescription(
                          formatLeaderboard(
                            users,
                            false,
                            currentPage * takeAmount,
                          ),
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
          await interaction.reply("An error occured.");
        }
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
