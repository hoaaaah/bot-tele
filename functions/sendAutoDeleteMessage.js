module.exports = (bot, chatId, text, options = {}) => {
  bot.sendMessage(chatId, text, options) // Gửi tin nhắn
    .then((sentMessage) => {
      setTimeout(() => {
        bot.deleteMessage(chatId, sentMessage.message_id).catch((err) => {
          console.error("❌ Lỗi khi xóa tin nhắn:", err.message);
        });
      }, 300000); // 5 phút (300000ms)
    })
    .catch((err) => console.error("❌ Lỗi khi gửi tin nhắn:", err.message));
};