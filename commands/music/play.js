const config = require("../../config.json");
const YouTubeAPI = require("simple-youtube-api");
const YouTube = new YouTubeAPI(config.apiKeys.googleAPIKey);
const request = require("request");


exports.help = {
  name: "play",
  usage: "<URL|YouTube Video ID|search>",
  description: "Adds a song to the queue. Can be YouTube/SoundCloud URL, YouTube Video ID or search.",
  extendedhelp: "Adds a song to the music queue, and if nothing is already playing, starts playback. You may send either a YouTube/SoundCloud URL, YouTube Video Id or a search query which will search on YouTube. If you have sufficient permissions, you can also queue an external URL."
};

exports.config = {
  enabled: true,
  guildOnly: true,
  aliases: ["p"],
  permLevel: 0
};

exports.run = (bot, msg, suffix) => {
  let permLvl = bot.checkPerms(msg);
  if (!bot.musicHandler.checkDJ(bot, msg)) return;

  let url = suffix.replace(/<(.+)>/g, "$1");

  if (url.match(/^https?:\/\/(www.)?youtube.com\/playlist\?(.*)$/)) return msg.channel.sendMessage(`Use \`${config.settings.prefix}music playlist <playlist>\` to queue a YouTube playlist!`);
  if (url.match(/^https?:\/\/(www.)?(soundcloud.com|snd.sc)\/(.*)$/)) {
    // Soundcloud streaming
    request(`https://api.soundcloud.com/resolve?url=${suffix}&client_id=${config.apiKeys.soundcloudId}`, (error, response, body) => {
      if (error) return msg.channel.sendMessage(`Error occured on adding song: ${error}`);
      else if (!error && response.statusCode === 200) {
        let info = JSON.parse(body);
        let milliSec = parseInt(info["duration"], 10);
        let totalSec = ~~(milliSec / 1000);
        let min = ~~(totalSec / 60);
        let sec = totalSec % 60;
        if (sec < 10) sec = `0${sec}`;

        bot.musicHandler.addToQueue(bot, msg, info["title"], `${min}:${sec}`, info["artwork_url"], info["permalink_url"], `${info["stream_url"]}?client_id=${config.apiKeys.soundcloudId}`, "soundcloud");
      }
    });
  }

  else if (permLvl > 4 && url.match(/^https?:\/\/(.*)$/) && !url.match(/(youtube.com|youtu.be)/)) {
    bot.musicHandler.addToQueue(bot, msg, suffix, "unknown", null, suffix, suffix, "other");
  }

  else {
    YouTube.getVideo(url).then(video => {
      let min = ~~(video.durationSeconds / 60);
      let sec = video.durationSeconds % 60;
      if (sec < 10) sec = `0${sec}`;
      bot.musicHandler.addToQueue(bot, msg, video.title, `${min}:${sec}`, `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`, video.url, video.url, "youtube");
    }).catch(() => {
      // Search for one video
      YouTube.searchVideos(url, 1).then(videos => {
        YouTube.getVideoByID(videos[0].id).then(video => {
          let min = ~~(video.durationSeconds / 60);
          let sec = video.durationSeconds % 60;
          if (sec < 10) sec = `0${sec}`;
          bot.musicHandler.addToQueue(bot, msg, video.title, `${min}:${sec}`, `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`, video.url, video.url, "youtube");
        }).catch(err => msg.channel.sendMessage(`Error occured on adding song: ${err}`));
      }).catch(() => msg.channel.sendMessage("Error occured on adding song: Unable to obtain a search result."));
    });
  }
};
