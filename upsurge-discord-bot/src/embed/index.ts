import { EmbedBuilder } from "discord.js";

class Embed extends EmbedBuilder {
  constructor() {
    super();
    this.setColor("#8884d8"); // Set the color
    this.setTimestamp(); // Set the timestamp of the embed
    this.setFooter({
      text: "Upsurge",
      iconURL:
        "https://cdn.discordapp.com/attachments/715592184690376754/1187541146877034516/Group_37002.png?ex=65b2f260&is=65a07d60&hm=d343698a9e0eb880145e35bb2a72e9ea294a718839a27f2f8afe2a18cdd2a3a3&",
    }); // Set the footer of the embed
  }
}

export default Embed;
