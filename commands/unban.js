// Unban command

exports.help = {
  name: "unban",
  usage: "<user> <reason>",
  description: "Unbans the user and posts it in the log channel.",
  extendedhelp: "Unbans the user and posts it in the log channel. This should be used with a user id and a reason."
};

exports.config = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 5
};

exports.run = (bot, msg, suffix) => {
  let guild = msg.guild;

  let userQuery = suffix.split(" ")[0];
  let reason = suffix.substring(userQuery.length + 1);
  let userid = userQuery;

  if (userQuery.startsWith("<@!")) userid = userQuery.substring(3, userQuery.length - 1);
  else if (userQuery.startsWith("<@")) userid = userQuery.substring(2, userQuery.length - 1);

  let rubyLogCh = guild.channels.find(channel => channel.name === "ruby-log");

  if (!suffix) return msg.channel.sendMessage(`${msg.author}, please provide a user mention and a reason~`).then(m => m.delete(5000));
  else if (!userid) return msg.channel.sendMessage(`${msg.author}, please mention the user you are banning~`).then(m => m.delete(5000));
  else if (reason === "") return msg.channel.sendMessage(`${msg.author}, please include a reason in your report~`).then(m => m.delete(5000));

  guild.fetchBans().then(bans => {
    let user = bans.get(userid);
    if (!user) return msg.channel.sendMessage(`${msg.author}, cannot find a user with that id in the ban list!`);
    let caseNum;
    rubyLogCh.fetchMessages({limit: 1}).then(msgs => {
      let pastCase = msgs.array()[0];
      if (msgs.size === 0) caseNum = 1;
      else if (pastCase.embeds.length === 0) {
        let caseTxt = pastCase.content.split("\n")[0];
        caseNum = parseInt(caseTxt.substring(21, caseTxt.indexOf(" |")), 10) + 1;
      }
      else if (pastCase.embeds.length > 0) {
        let caseTxt = pastCase.embeds[0].footer.text;
        caseNum = parseInt(caseTxt.substring(5), 10) + 1;
      }
      if (isNaN(caseNum)) caseNum = 1;

      let logDetails = stripIndents`
      **Action:**          Unban
      **Channel:**       ${msg.channel.name}
      **User:**             ${member.user.username}#${member.user.discriminator} (${member.id})
      **Reason:**        ${reason}
      \u200b
      `;

      let logMsg = {
        color: 327462,
        author: {
          name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
          icon_url: msg.author.avatarURL
        },
        description: logDetails,
        footer: {
          icon_url: bot.user.avatarURL,
          text: `Case ${caseNum}`
        }
      };

      guild.unban(user).then(() => {
        rubyLogCh.sendMessage("", {embed: logMsg}).then(() => {
          msg.channel.sendMessage("^-^").then(m => m.delete(5000));
        });
      });
    });
  });
};
