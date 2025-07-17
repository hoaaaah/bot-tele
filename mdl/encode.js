/**
 * @command /encode
 * @category Tiện ích
 * @author tnt
 * @date 2025-03-01
 * @usage /encode
 * @description Mã hóa code.
 */
const fs = require('fs');
const axios = require('axios');

module.exports = (bot) => {
  const encodeFile = async (fileId, fileName, chatId, user) => {
    try {
      // 📥 Tải file từ Telegram
      const fileInfo = await bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot8161840769:AAFb1QNttDcjn_P3ZD12IT_Tto27jdsYRG4/${fileInfo.file_path}`;

      const tempFilePath = `temp_${fileName}`;
      const writer = fs.createWriteStream(tempFilePath);
      const response = await axios.get(fileUrl, { responseType: 'stream' });

      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // 📜 Đọc nội dung file
      const fileContent = fs.readFileSync(tempFilePath, 'utf-8');

      // 🔒 Mã hóa nhiều lớp
      const base64_1 = Buffer.from(fileContent, 'utf-8').toString('base64');
      const hex_2 = Buffer.from(base64_1, 'utf-8').toString('hex');
      const xor_3 = Buffer.from(hex_2.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ 69)).join('')).toString('hex');

      // 🎭 Chèn ký tự rác
      const junk = "#@&^*!$_+><";
      const fakeLinks = ["https://secure.com", "https://encrypted.net", "https://data-locked.org"];
      const junkStart = fakeLinks[Math.floor(Math.random() * fakeLinks.length)] + junk + [...Array(20)].map(() => Math.random().toString(36)[2]).join('');
      const junkEnd = [...Array(20)].map(() => Math.random().toString(36)[2]).join('') + junk + fakeLinks[Math.floor(Math.random() * fakeLinks.length)];
      const finalEncoded = `${junkStart}${xor_3}${junkEnd}`;

      // 📌 Mã hóa cả đoạn giải mã thành chuỗi rác
      const obfuscateString = (str) => {
        return str.split('').map(c => `x${c.charCodeAt(0).toString(16)}`).join(' ');
      };

      const decoderCode = `
def __MIXED_DECODER__(_E): 
    _1 = "".join([c for c in _E.split("#@&^*!$_+><")[1][20:-20] if c.isalnum()])
    _2 = binascii.unhexlify(_1).decode("utf-8")
    _3 = "".join(chr(ord(c) ^ 69) for c in _2)
    _4 = binascii.unhexlify(_3).decode("utf-8")
    _5 = base64.b64decode(_4).decode("utf-8")
    return _5
`;

      const encodedDecoder = obfuscateString(decoderCode);

      // 📝 File Python bị mã hóa toàn bộ, kể cả đoạn giải mã
      const signature = `# Ultra-Secured by ${user}\n`;
      const runnableScript = `
import base64, binascii, random, time
def __DECODE__(data):
    return "".join(chr(int(c[1:], 16)) for c in data.split())
__ENCODED_DECODER__ = "${encodedDecoder}"
def __WAIT__(): 
    for _ in range(random.randint(1, 3)): 
        time.sleep(random.uniform(0.1, 0.5))
exec(compile(__DECODE__(__ENCODED_DECODER__), "<decoded>", "exec"))
_DATA_ = "${finalEncoded}"
__WAIT__(); exec(compile(__MIXED_DECODER__(_DATA_), "<obfuscated>", "exec"))
`;

      // 📂 Lưu file mã hóa
      const encodedFilePath = `encoded_${fileName}`;
      fs.writeFileSync(encodedFilePath, signature + runnableScript, 'utf-8');

      // 📤 Gửi file đã mã hóa
      await bot.sendDocument(chatId, fs.createReadStream(encodedFilePath), {
        caption: `🔐 File đã mã hóa: ${fileName}\nChạy trực tiếp với Python!`,
      });

      // 🗑️ Xóa file tạm
      fs.unlinkSync(tempFilePath);
      fs.unlinkSync(encodedFilePath);
    } catch (error) {
      console.error('❌ Lỗi:', error.message);
      bot.sendMessage(chatId, '❌ Lỗi khi mã hóa file.');
    }
  };

  // 🔹 Xử lý lệnh /encode
  bot.onText(/\/encode/, async (msg) => {
    const chatId = msg.chat.id;
    try {
      if (!msg.reply_to_message || !msg.reply_to_message.document) {
        bot.sendMessage(chatId, 'Vui lòng reply một file Python để mã hóa.');
        return;
      }
      const fileId = msg.reply_to_message.document.file_id;
      const fileName = msg.reply_to_message.document.file_name;
      const user = msg.from.username || 'unknown';
      await encodeFile(fileId, fileName, chatId, user);
    } catch (error) {
      console.error('❌ Lỗi:', error.message);
      bot.sendMessage(chatId, '❌ Lỗi khi mã hóa file.');
    }
  });

  // 🔹 Xử lý khi người dùng gửi file trực tiếp
  bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    try {
      const fileId = msg.document.file_id;
      const fileName = msg.document.file_name;
      const user = msg.from.username || 'unknown';
      await encodeFile(fileId, fileName, chatId, user);
    } catch (error) {
      console.error('❌ Lỗi:', error.message);
      bot.sendMessage(chatId, '❌ Lỗi khi mã hóa file.');
    }
  });
};