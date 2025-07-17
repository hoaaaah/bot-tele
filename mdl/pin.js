/**
 * @command /pin
 * @category Tiện ích
 * @author tnt
 * @date 2025-03-01
 * @usage /pin|unpin
 * @description Ghim tin nhắn và gỡ ghim tin nhắn.
 */
module.exports = (bot, config) => {
  // Lắng nghe lệnh /pin
  bot.onText(/\/pin/, (msg) => {
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
      bot.sendMessage(chatId, 'Vui lòng reply (trả lời) tin nhắn cần ghim.');
      return;
    }

    // Ghim tin nhắn
    bot.pinChatMessage(chatId, replyToMessageId)
      .then(() => {
        bot.sendMessage(chatId, 'Tin nhắn đã được ghim thành công.');
      })
      .catch((err) => {
        console.error('Không thể ghim tin nhắn:', err);
        bot.sendMessage(chatId, 'Không thể ghim tin nhắn. Đảm bảo bot có quyền ghim tin nhắn.');
      });
  });

  // Lắng nghe lệnh /unpin
  bot.onText(/\/unpin/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Kiểm tra xem người dùng có phải là admin không
    if (userId.toString() !== config.adminId) {
      bot.sendMessage(chatId, 'Bạn không có quyền sử dụng lệnh này.');
      return;
    }

    // Bỏ ghim tin nhắn được ghim gần nhất
    bot.unpinChatMessage(chatId)
      .then(() => {
        bot.sendMessage(chatId, 'Tin nhắn đã được bỏ ghim thành công.');
      })
      .catch((err) => {
        console.error('Không thể bỏ ghim tin nhắn:', err);
        bot.sendMessage(chatId, 'Không thể bỏ ghim tin nhắn. Đảm bảo bot có quyền bỏ ghim tin nhắn.');
      });
  });
};