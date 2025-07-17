/**
 * @command /restrictmedia 
 * @category Tiện ích
 * @author tnt
 * @date 2025-03-01
 * @usage /restrictmedia
 * @description Cấm thành viên gửi media.
 */
module.exports = (bot, config) => {
  // 🔧 Bật/Tắt quyền gửi media cho thành viên
  bot.onText(/\/restrictmedia (on|off)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId.toString() !== config.adminId) {
      bot.sendMessage(chatId, '❌ Bạn không có quyền sử dụng lệnh này.');
      return;
    }

    const status = match[1] === 'on' ? false : true; // on = tắt gửi media, off = bật gửi media

    try {
      // Cập nhật quyền hạn cho tất cả thành viên (trừ admin)
      await bot.setChatPermissions(chatId, {
        can_send_messages: true,
        can_send_media_messages: status,
        can_send_other_messages: status,
        can_add_web_page_previews: status
      });

      bot.sendMessage(chatId, `✅ Đã ${status ? 'CHO PHÉP' : 'CẤM'} thành viên gửi media.`);
    } catch (err) {
      console.error('Lỗi khi thay đổi quyền gửi media:', err);
      bot.sendMessage(chatId, '❌ Không thể thay đổi quyền gửi media. Kiểm tra quyền của bot.');
    }
  });
};