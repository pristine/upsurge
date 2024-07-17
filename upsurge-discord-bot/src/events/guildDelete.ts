import { type Guild } from "discord.js";
import { type Event } from "../event";
import { db } from "../db";

const event: Event = {
  name: "guildDelete",
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
      if (service === null) return;

      await db.service.update({
        where: {
          id_type: {
            type: "discord",
            id: guild.id,
          },
        },
        data: {
          connected: false,
        },
      });

      console.log(`guildDelete: ${guild.name}`);
    } catch (e) {
      console.log(e);
    }
  },
};

export default event;
