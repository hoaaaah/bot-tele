/**
 * @command /box
 * @category Tiện ích
 * @author tnt
 * @date 2025-03-01
 * @usage /box
 * @description Xem thông tin box.
 */
module.exports = (bot) => {
  bot.onText(/\/box/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      // Lấy thông tin nhóm
      const chat = await bot.getChat(chatId);
      const admins = await bot.getChatAdministrators(chatId);
      const memberCount = await bot.getChatMemberCount(chatId);

      // Lấy ảnh đại diện nhóm
      let photoUrl = '';
      if (chat.photo) {
        const file = await bot.getFile(chat.photo.big_file_id);
        photoUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
      }

      // Xây dựng thông tin nhóm
      let messageText = `📌 *Thông tin nhóm:*\n`;
      messageText += `🏷 *Tên nhóm:* ${chat.title}\n`;
      messageText += `📝 *Mô tả:* ${chat.description || 'Không có'}\n`;
      messageText += `🔗 *Link nhóm:* ${chat.invite_link || 'Không có'}\n`;
      messageText += `👥 *Thành viên:* ${memberCount}\n`;
      messageText += `👮‍♂️ *Số lượng Admin:* ${admins.length}\n`;

      // Gửi tin nhắn hiển thị thông tin nhóm
      bot.sendMessage(chatId, messageText, { parse_mode: 'Markdown' });

      // Gửi ảnh nhóm nếu có
      if (photoUrl) {
        bot.sendPhoto(chatId, photoUrl);
      }
    } catch (err) {
      console.error('Lỗi khi lấy thông tin nhóm:', err);
      bot.sendMessage(chatId, '❌ Không thể lấy thông tin nhóm. Kiểm tra quyền của bot.');
    }
  });
};