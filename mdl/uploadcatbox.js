/**
 * @command /uploadcatbox
 * @category Tiện ích
 * @author tnt
 * @date 2025-03-01
 * @usage /uploadcatbox [user]
 * @description Tải video từ id tiktok và tự up lên catbox.
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const videosDir = path.join(__dirname, 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir);
}

const uploadToCatbox = async (filePath) => {
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('userhash', '');
    form.append('fileToUpload', fs.createReadStream(filePath), path.basename(filePath));

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: {
        ...form.getHeaders(),
        'accept': 'application/json',
        'user-agent': 'Mozilla/5.0'
      },
    });

    return response.data;
  } catch (error) {
    console.error('Lỗi khi upload file lên Catbox:', error.message);
    throw error;
  }
};

const fetchAndDownloadVideos = async (user) => {
  const url = `https://www.tikwm.com/api/user/posts?unique_id=@${user}&count=30`;

  try {
    const response = await axios.get(url);
    const videos = response.data.data.videos;
    if (!videos || videos.length === 0) {
      console.log(`No videos found for user @${user}`);
      return [];
    }

    const videoPaths = [];
    for (let video of videos) {
      const videoId = video.video_id;
      const videoUrl = video.play;
      const videoPath = path.join(videosDir, `${user}_${videoId}.mp4`);

      const writer = fs.createWriteStream(videoPath);
      const videoData = await axios.get(videoUrl, { responseType: 'stream' });
      videoData.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      videoPaths.push(videoPath);
    }
    return videoPaths;
  } catch (error) {
    console.error('Lỗi khi tải video:', error.message);
    return [];
  }
};

module.exports = (bot) => {
  bot.onText(/\/uploadcatbox (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1];

    bot.sendMessage(chatId, `Đang tải video từ @${username}, vui lòng chờ...`);
    
    try {
      const videoPaths = await fetchAndDownloadVideos(username);
      if (videoPaths.length === 0) {
        bot.sendMessage(chatId, `Không tìm thấy video nào từ @${username}`);
        return;
      }

      const uploadedLinks = [];
      for (const videoPath of videoPaths) {
        const catboxLink = await uploadToCatbox(videoPath);
        uploadedLinks.push(catboxLink);
        fs.unlinkSync(videoPath);
      }

      bot.sendMessage(chatId, `📄 Các video đã được upload lên Catbox:\n${uploadedLinks.join('\n')}`);
    } catch (error) {
      console.error('Lỗi:', error.message);
      bot.sendMessage(chatId, 'Đã xảy ra lỗi khi upload video. Vui lòng thử lại.');
    }
  });
};