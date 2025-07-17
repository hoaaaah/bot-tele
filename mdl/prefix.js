const fs = require('fs');
const path = require('path');

const prefixFile = path.join(__dirname, 'prefixes.json');

// ⚙️ Hàm tải prefix từ file
function loadPrefixes() {
  try {
    if (fs.existsSync(prefixFile)) {
      return JSON.parse(fs.readFileSync(prefixFile, 'utf8'));
    }
  } catch (error) {
    console.error('Lỗi khi đọc prefixes.json:', error);
  }
  return { global: '/', groups: {} }; // Giá trị mặc định
}

// ⚙️ Hàm lưu prefix vào file
function savePrefixes(data) {
  fs.writeFile(prefixFile, JSON.stringify(data, null, 2), (err) => {
    if (err) console.error('Lỗi khi lưu prefixes.json:', err);
  });
}

module.exports = (bot) => {
  bot.on('message', async (msg) => {
    if (!msg.text) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text.trim();
    const isGroup = msg.chat.type.includes('group');

    let prefixes = loadPrefixes();
    let globalPrefix = prefixes.global;
    let groupPrefix = isGroup && prefixes.groups[chatId] ? prefixes.groups[chatId] : globalPrefix;

    // 🔹 Chỉ xử lý tin nhắn có dấu lệnh đúng
    if (!text.startsWith(globalPrefix) && !text.startsWith(groupPrefix)) return;

    // 📌 Lệnh xem dấu lệnh của bot
    if (text === `${globalPrefix}prefix` || text === `${groupPrefix}prefix`) {
      return bot.sendMessage(
        chatId,
        `🔹 Dấu lệnh nhóm: *${groupPrefix}*\n🔹 Dấu lệnh hệ thống: *${globalPrefix}*`,
        { parse_mode: 'Markdown' }
      );
    }

    // 📌 Lệnh thay đổi dấu lệnh của nhóm (chỉ admin nhóm)
    if (text.startsWith(`${globalPrefix}setprefix `) || text.startsWith(`${groupPrefix}setprefix `)) {
      if (!isGroup) return bot.sendMessage(chatId, '⚠️ Lệnh này chỉ sử dụng trong nhóm.');

      const admins = await bot.getChatAdministrators(chatId);
      const isAdmin = admins.some(admin => admin.user.id === userId && (admin.status === 'creator' || admin.can_change_info));

      if (!isAdmin) return bot.sendMessage(chatId, '⚠️ Bạn cần là admin để thay đổi dấu lệnh.');

      const newPrefix = text.split(' ').slice(1).join(' ').trim();
      if (!newPrefix) return bot.sendMessage(chatId, '⚠️ Vui lòng nhập dấu lệnh mới hợp lệ.');

      prefixes.groups[chatId] = newPrefix;
      savePrefixes(prefixes);

      return bot.sendMessage(chatId, `✅ Dấu lệnh trong nhóm đã được đổi thành: *${newPrefix}*`, { parse_mode: 'Markdown' });
    }

    // 📌 Lệnh thay đổi dấu lệnh hệ thống (chỉ admin bot)
    if (text.startsWith(`${globalPrefix}setprefixglobal `) || text.startsWith(`${groupPrefix}setprefixglobal `)) {
      const botAdmins = [6602753350]; // ⚠️ Thay bằng ID admin bot thật
      if (!botAdmins.includes(userId)) return bot.sendMessage(chatId, '⚠️ Bạn không có quyền thay đổi dấu lệnh hệ thống.');

      const newGlobalPrefix = text.split(' ').slice(1).join(' ').trim();
      if (!newGlobalPrefix) return bot.sendMessage(chatId, '⚠️ Vui lòng nhập dấu lệnh mới hợp lệ.');

      prefixes.global = newGlobalPrefix;
      savePrefixes(prefixes);

      return bot.sendMessage(chatId, `✅ Dấu lệnh hệ thống đã được đổi thành: *${newGlobalPrefix}*`, { parse_mode: 'Markdown' });
    }
  });
};