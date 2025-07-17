/**
 * @command /unlock
 * @category Tiện ích
 * @author tnt
 * @date 2025-03-10
 * @usage /unlock <link>
 * @description Sử dụng lệnh để mở khóa nội dung dựa trên link được cung cấp.
 */
module.exports = (bot) => {
  // Lắng nghe lệnh /unlock
  bot.onText(/\/unlock (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const link = match[1];

    // Kiểm tra xem link có hợp lệ không
    if (!link.startsWith('https://rekonise.com/')) {
      bot.sendMessage(chatId, '❌ Link không hợp lệ. Vui lòng cung cấp link từ Rekonise.');
      return;
    }

    // Trích xuất title từ link
    const title = link.split('/').pop();

    // Gọi API Rekonise
    try {
      const apiUrl = `https://api.rekonise.com/social-unlocks/${title}/unlock`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      // Kiểm tra xem API có trả về URL không
      if (data.url) {
        bot.sendMessage(chatId, `✅ Mở khóa thành công! Truy cập link: ${data.url}`);
      } else {
        bot.sendMessage(chatId, '❌ Không tìm thấy URL trong phản hồi từ API.');
      }
    } catch (err) {
      bot.sendMessage(chatId, '❌ Lỗi khi gọi API Rekonise. Vui lòng thử lại sau.');
    }
  });
};