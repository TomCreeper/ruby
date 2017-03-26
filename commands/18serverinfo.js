// serverinfo command
const moment = require("moment");

exports.help = {
  name: "serverinfo",
  description: "Displays information about the server.",
  extendedhelp: "Displays information about the server."
};

exports.config = {
  enabled: true,
  guildOnly: true,
  aliases: ["server-info", "sinfo", "s-info"],
  permLevel: 0
};

exports.run = (client, msg) => {
  let guild = msg.guild;
  let embed = {
    color: 3447003,
    author: {
      name: `${guild.name} (ID: ${guild.id})`,
      icon_url: guild.iconURL
    },
    fields: [
      {
        name: "❯ Channels",
        value: client.util.commonTags.stripIndents`
        ⭑ ${guild.channels.filter(c => c.type === "text").size} Text, ${guild.channels.filter(c => c.type === "voice").size} Voice
        ⭑ Default: ${guild.defaultChannel}${guild.afkChannelID ? `\n⭑ AFK: ${guild.channels.get(guild.afkChannelID)}`: ""}`,
        inline: true
      },
      {
        name: "❯ Members",
        value: client.util.commonTags.stripIndents`
        ⭑ ${guild.memberCount} ${guild.memberCount === 1 ? "member" : "members"}
        ⭑ Owner: ${guild.owner.user.username}#${guild.owner.user.discriminator} (${guild.ownerID})`,
        inline: true
      },
      {
        name: "❯ Other",
        value: client.util.commonTags.stripIndents`
        ⭑ Roles: ${guild.roles.size}
        ⭑ Region: ${guild.region}
        ⭑ Created at: ${moment(guild.createdAt).format("dddd, MMMM Do YYYY [at] h:mm:ss a")}
        ⭑ Verification Level: ${guild.verificationLevel}${guild.emojis.size !== 0 ? `\n⭑ Emojis: ${guild.emojis.array().join(" ")}` : ""}
        \u200b`,
        inline: true
      }
    ],
    thumbnail: {
      url: guild.iconURL
    },
    footer: {
      text: "Server Info",
      icon_url: client.user.avatarURL
    }
  };

  msg.channel.sendEmbed(embed);
};
