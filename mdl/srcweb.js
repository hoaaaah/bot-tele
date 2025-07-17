/**
 * @command /scrape
 * @category Tiện ích
 * @author tnt
 * @date 2025-03-01
 * @usage /scrape [link]
 * @description Lấy Src web.
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const AdmZip = require('adm-zip');
const cheerio = require('cheerio');

const downloadFile = async (url, folder) => {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const parsedUrl = new URL(url);
    const filepath = path.join(folder, parsedUrl.hostname + parsedUrl.pathname);
    const dirname = path.dirname(filepath);

    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filepath));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Lỗi khi tải ${url}:`, error.message);
    return null;
  }
};

const scrapeWebsite = async (url, outputFolder) => {
  try {
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    const response = await axios.get(url);
    const htmlFile = path.join(outputFolder, 'index.html');
    fs.writeFileSync(htmlFile, response.data);
    console.log(`Đã lưu: ${htmlFile}`);

    const resources = [];
    const $ = cheerio.load(response.data);

    // Tìm tất cả các tài nguyên trong HTML
    $('link[href], script[src], img[src], audio[src], video[src], source[src]').each((_, element) => {
      let src = $(element).attr('href') || $(element).attr('src');
      if (src) {
        const fullUrl = new URL(src, url).href;
        resources.push(fullUrl);
      }
    });

    // Tải tất cả các tài nguyên
    for (const resourceUrl of resources) {
      await downloadFile(resourceUrl, outputFolder);
    }

    return outputFolder;
  } catch (error) {
    console.error('Lỗi khi tải website:', error.message);
    return null;
  }
};

const zipFolder = (folder, zipFilePath) => {
  const zip = new AdmZip();
  zip.addLocalFolder(folder);
  zip.writeZip(zipFilePath);
  console.log(`Đã tạo file ZIP: ${zipFilePath}`);
};

const deleteFolder = (folder) => {
  if (fs.existsSync(folder)) {
    fs.rmSync(folder, { recursive: true, force: true });
    console.log(`Đã xóa thư mục: ${folder}`);
  }
};

module.exports = (bot) => {
  bot.onText(/\/scrape (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1]; // Lấy URL từ lệnh

    try {
      // Tạo thư mục tạm
      const outputFolder = path.join(__dirname, 'website_backup');
      const zipFilePath = path.join(__dirname, 'website_backup.zip');

      // Tải website và tất cả tài nguyên của nó
      await scrapeWebsite(url, outputFolder);

      // Nén thư mục thành file ZIP
      zipFolder(outputFolder, zipFilePath);

      // Gửi file ZIP vào Telegram
      await bot.sendDocument(chatId, fs.createReadStream(zipFilePath));

      // Xóa thư mục và file ZIP sau khi gửi
      deleteFolder(outputFolder);
      fs.unlinkSync(zipFilePath);

      console.log('Hoàn thành!');
    } catch (error) {
      console.error('Lỗi:', error.message);
      bot.sendMessage(chatId, 'Đã xảy ra lỗi khi tải website. Vui lòng thử lại.');
    }
  });
};