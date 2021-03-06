// Ban command

exports.help = {
  name: "ban",
  usage: "<user> <reason>",
  description: "Bans the user and posts it in the log channel.",
  extendedhelp: "Bans the user and posts it in the log channel. They are PM'd with the reason and a link to the appeal form. This should be used in the channel where the offense occurred with a mention and a reason."
};

exports.config = {
  enabled: true,
  guildOnly: true,
  alternateInvoke: true,
  aliases: [],
  permLevel: 5
};

exports.run = (client, msg, suffix) => {
  let guild = msg.guild;

  let userQuery = suffix.split(" ")[0];
  let reason = suffix.substring(userQuery.length + 1);
  let userid = userQuery.startsWith("<@!") ? userQuery.slice(3, -1) : userQuery.startsWith("<@") ? userQuery.slice(2, -1) : "";

  let rubyLogCh = guild.channels.find(channel => channel.name === "ruby-log");

  if (!suffix) return msg.channel.sendMessage(`${msg.author}, please provide a user mention and a reason~`).then(m => m.delete(5000));
  else if (!userid) return msg.channel.sendMessage(`${msg.author}, please mention the user you are banning~`).then(m => m.delete(5000));
  else if (reason === "") return msg.channel.sendMessage(`${msg.author}, please include a reason in your report~`).then(m => m.delete(5000));

  let member = guild.members.get(userid);

  if (!member) return msg.channel.sendMessage(`${msg.author}, that user cannot be found!`).then(m => m.delete(5000));
  if (!member.bannable) return msg.channel.sendMessage(`${msg.author}, I cannot ban that user!`).then(m => m.delete(5000));

  let caseNum;
  rubyLogCh.fetchMessages({limit: 1}).then(msgs => {
    let pastCase = msgs.first();
    if (!pastCase) caseNum = 1;
    else if (pastCase.embeds.length === 0) {
      let caseTxt = pastCase.content.split("\n")[0];
      caseNum = parseInt(caseTxt.substring(21, caseTxt.indexOf(" |")), 10) + 1;
    }
    else if (pastCase.embeds.length > 0) {
      let caseTxt = pastCase.embeds[0].footer.text;
      caseNum = parseInt(caseTxt.substring(5), 10) + 1;
    }
    if (isNaN(caseNum)) caseNum = 1;

    let logDetails = client.util.commonTags.stripIndents`
    **Action:**          Ban
    **Channel:**       ${msg.channel.name}
    **User:**             ${member} || ${member.user.username}#${member.user.discriminator} (${member.id})
    **Reason:**        ${reason}
    \u200b
    `;

    let logMsg = {
      color: 16723762,
      author: {
        name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
        icon_url: msg.author.avatarURL
      },
      description: logDetails,
      footer: {
        icon_url: client.user.avatarURL,
        text: `Case ${caseNum}`
      }
    };

    let msgPM = client.util.commonTags.stripIndents`
    Oh no! It appears that you have been banned by ${msg.author.username}#${msg.author.discriminator}.
    **Reason:** ${reason}

    If you feel that this was unjust, feel free to appeal your ban using the form linked below~ :heart:
    ${config.resources.banForm}
    `;

    member.sendMessage(msgPM).then(() => {
      member.ban(1).then(() => {
        rubyLogCh.sendEmbed(logMsg).then(() => {
          msg.channel.sendMessage("^-^").then(m => m.delete(5000));
        });
      });
    });
  });
};
