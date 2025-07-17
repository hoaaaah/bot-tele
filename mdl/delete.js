/**
 * @command /delete
 * @category Hỗ trợ
 * @author tnt
 * @date 2025-03-01
 * @usage /delete
 * @description Xóa tin nhắn người dùng trong nhóm.
 */
module.exports = (bot, config) => {
  // Lắng nghe lệnh /delete
  bot.onText(/\/delete/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const replyToMessageId = msg.reply_to_message?.message_id;

    // Kiểm tra xem người dùng có phải là admin không
    if (userId.toString() !== config.adminId) {
      bot.sendMessage(chatId, 'Bạn không có quyền sử dụng lệnh này.');
      return;
    }

    // Kiểm tra xem tin nhắn có được reply không
    if (!replyToMessageId) {
      bot.sendMessage(chatId, 'Vui lòng reply (trả lời) tin nhắn cần xóa.');
      return;
    }

    // Xóa tin nhắn được reply
    bot.deleteMessage(chatId, replyToMessageId)
      .then(() => {
        bot.sendMessage(chatId, 'Tin nhắn đã được xóa thành công.');
      })
      .catch((err) => {
        console.error('Không thể xóa tin nhắn:', err);
        bot.sendMessage(chatId, 'Không thể xóa tin nhắn. Đảm bảo bot có quyền xóa tin nhắn.');
      });
  });
};