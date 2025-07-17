/**
 * @command /downhoyolab
 * @category Media
 * @author tnt
 * @date 2025-03-01
 * @usage /downhoyolab
 * @description Tự động tải xuống hoyolab.
 */
const axios = require('axios');

module.exports = (bot) => {
  // Lắng nghe tin nhắn chứa link Hoyolab
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Kiểm tra xem tin nhắn có chứa link Hoyolab không
    if (text && text.startsWith('https://www.hoyolab.com/article/')) {
      const hoyolabLinkRegex = /https:\/\/www\.hoyolab\.com\/article\/\d+/;
      const match = text.match(hoyolabLinkRegex);

      if (match) {
        const url = match[0]; // Lấy link Hoyolab từ tin nhắn

        try {
          // Gọi API để lấy thông tin bài viết
          const apiUrl = `https://apitntrick.onrender.com/hoyolab?url=${url}`;
          const response = await axios.get(apiUrl);
          const data = response.data;

          // Kiểm tra xem có ảnh không
          if (data.imageUrls && data.imageUrls.length > 0) {
            // Gửi thông tin bài viết
            const caption = `
📌 *Tiêu đề:* ${data.title}
📝 *Chủ đề:* ${data.subject}
👤 *UID:* ${data.uid}
👀 *Lượt xem:* ${data.view_num}
💬 *Bình luận:* ${data.reply_num}
❤️ *Thích:* ${data.like_num}
🔖 *Đánh dấu:* ${data.bookmark_num}
🔗 *Chia sẻ:* ${data.share_num}
            `;

            // Gửi tất cả ảnh cùng một lần dưới dạng attachment
            const mediaGroup = data.imageUrls.map((imageUrl, index) => ({
              type: 'photo',
              media: imageUrl,
              caption: index === 0 ? caption : '', // Chỉ thêm caption vào ảnh đầu tiên
            }));

            bot.sendMediaGroup(chatId, mediaGroup);
          } else {
            bot.sendMessage(chatId, 'Bài viết không có ảnh.');
          }
        } catch (error) {
          console.error('Lỗi khi gọi API:', error);
          bot.sendMessage(chatId, 'Không thể tải thông tin bài viết. Vui lòng thử lại sau.');
        }
      }
    }
  });
};