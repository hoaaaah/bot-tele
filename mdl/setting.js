/**
 * @command /restrictsave
 * @category Tiện ích
 * @author tnt
 * @date 2025-03-01
 * @usage /restrictsave(on|off), promote, demote
 * @description Cấm gửi ảnh, video| cấp quyền admin, gỡ quyền admin.
 */
const fs = require('fs');
const path = require('path');

const RESTRICT_SAVE_FILE = path.join(__dirname, 'restrictsave.json');

// Hàm đọc trạng thái restrict từ file
const readRestrictStatus = () => {
  if (fs.existsSync(RESTRICT_SAVE_FILE)) {
    return JSON.parse(fs.readFileSync(RESTRICT_SAVE_FILE, 'utf8'));
  }
  return {};
};

// Hàm ghi trạng thái restrict vào file
const writeRestrictStatus = (data) => {
  fs.writeFileSync(RESTRICT_SAVE_FILE, JSON.stringify(data, null, 2));
};

module.exports = (bot, config) => {
  let restrictSave = readRestrictStatus(); // Đọc trạng thái từ file

  // 🔧 Bật/Tắt cấm lưu nội dung
  bot.onText(/\/restrictsave (on|off)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId.toString() !== config.adminId) {
      bot.sendMessage(chatId, '❌ Bạn không có quyền sử dụng lệnh này.');
      return;
    }

    const status = match[1]; // Lấy trạng thái (on/off)
    restrictSave[chatId] = status === 'on'; // Cập nhật trạng thái
    writeRestrictStatus(restrictSave); // Lưu vào file

    bot.sendMessage(chatId, `✅ Đã ${status === 'on' ? 'BẬT' : 'TẮT'} chế độ cấm lưu nội dung.`);
  });

  // 🚫 Kiểm tra và cấm người gửi nội dung bị cấm nếu chế độ restrictSave đang bật
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (restrictSave[chatId]) {
      if (
        msg.photo ||                     // Ảnh
        msg.video ||                     // Video
        msg.animation ||                 // GIF
        msg.document ||                  // File
        msg.audio ||                     // Mp3
        msg.sticker ||                   // Nhãn dán
        (msg.text && /(http|https):\/\/\S+/i.test(msg.text)) // Link
      ) {
        try {
          await bot.banChatMember(chatId, userId);
          bot.sendMessage(chatId, `❌ *${msg.from.username || 'ID: ' + userId}* đã bị ban vì gửi nội dung bị cấm.`, { parse_mode: 'Markdown' });
        } catch (err) {
          console.error('Lỗi khi ban người dùng:', err);
          bot.sendMessage(chatId, '❌ Không thể ban người dùng. Kiểm tra quyền của bot.');
        }
      }
    }
  });

  // 👑 Thêm admin
  bot.onText(/\/promote/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId.toString() !== config.adminId) {
      bot.sendMessage(chatId, '❌ Bạn không có quyền sử dụng lệnh này.');
      return;
    }

    if (!msg.reply_to_message) {
      bot.sendMessage(chatId, '📌 Vui lòng reply vào tin nhắn của người cần cấp quyền admin.');
      return;
    }

    const targetId = msg.reply_to_message.from.id;

    try {
      await bot.promoteChatMember(chatId, targetId, {
        can_change_info: true,
        can_delete_messages: true,
        can_invite_users: true,
        can_restrict_members: true,
        can_pin_messages: true,
        can_promote_members: false,
      });

      bot.sendMessage(chatId, `✅ Đã thăng cấp *${msg.reply_to_message.from.username || 'ID: ' + targetId}* làm admin.`, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Lỗi khi thăng cấp admin:', err);
      bot.sendMessage(chatId, '❌ Không thể thăng cấp. Kiểm tra quyền của bot.');
    }
  });

  // ❌ Bỏ quyền admin
  bot.onText(/\/demote/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId.toString() !== config.adminId) {
      bot.sendMessage(chatId, '❌ Bạn không có quyền sử dụng lệnh này.');
      return;
    }

    if (!msg.reply_to_message) {
      bot.sendMessage(chatId, '📌 Vui lòng reply vào tin nhắn của người cần hạ cấp.');
      return;
    }

    const targetId = msg.reply_to_message.from.id;

    try {
      await bot.promoteChatMember(chatId, targetId, {
        can_change_info: false,
        can_delete_messages: false,
        can_invite_users: false,
        can_restrict_members: false,
        can_pin_messages: false,
        can_promote_members: false,
      });

      bot.sendMessage(chatId, `✅ Đã hạ cấp *${msg.reply_to_message.from.username || 'ID: ' + targetId}* khỏi admin.`, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Lỗi khi hạ cấp admin:', err);
      bot.sendMessage(chatId, '❌ Không thể hạ cấp. Kiểm tra quyền của bot.');
    }
  });
};