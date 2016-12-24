exports.help = {
  name: "resume",
  description: "Resumes music playback.",
  extendedhelp: "Resumes music playback. Cannot be used in stream mode."
};

exports.config = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0
};

exports.run = (bot, msg) => {
  let player = bot.musicHandler.getPlayer(bot, msg.guild);
  if (player) {
    if (!bot.musicHandler.checkDJ(bot, msg)) return;
    bot.musicHandler.resumePlayback(bot, msg);
  }
};
