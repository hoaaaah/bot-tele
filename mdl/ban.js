module.exports = (bot, config) => {
  // 🛑 Lệnh cấm người dùng
  bot.onText(/\/ban(?:\s+(@\S+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId.toString() !== config.adminId) {
      bot.sendMessage(chatId, 'Bạn không có quyền sử dụng lệnh này.');
      return;
    }

    let targetId = null;
    let targetUsername = match[1]; // Dữ liệu nhập từ lệnh

    if (msg.reply_to_message) {
      // Nếu reply vào tin nhắn, lấy ID người bị cấm
      targetId = msg.reply_to_message.from.id;
      targetUsername = msg.reply_to_message.from.username || `ID: ${targetId}`; // Sử dụng username nếu có, nếu không thì dùng ID
    } else if (targetUsername) {
      // Nếu nhập username, tìm ID của người dùng theo @username
      try {
        const chatMember = await bot.getChatMember(chatId, targetUsername);
        targetId = chatMember.user.id;
      } catch (err) {
        bot.sendMessage(chatId, '❌ Không tìm thấy người dùng này.');
        return;
      }
    }

    if (!targetId) {
      bot.sendMessage(chatId, '📌 Vui lòng reply tin nhắn hoặc nhập @username để cấm.');
      return;
    }

    try {
      await bot.banChatMember(chatId, targetId);
      bot.sendMessage(chatId, `✅ Đã cấm người dùng *${targetUsername}* khỏi nhóm.`, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Không thể cấm người dùng:', err);
      bot.sendMessage(chatId, '❌ Không thể cấm người dùng. Kiểm tra quyền của bot.');
    }
  });

  // 🔓 Lệnh mở khóa người dùng (unban)
  bot.onText(/\/unban(?:\s+(@\S+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId.toString() !== config.adminId) {
      bot.sendMessage(chatId, 'Bạn không có quyền sử dụng lệnh này.');
      return;
    }

    let targetId = null;
    let targetUsername = match[1]; // Dữ liệu nhập từ lệnh

    if (msg.reply_to_message) {
      // Nếu reply vào tin nhắn, lấy ID người bị cấm
      targetId = msg.reply_to_message.from.id;
      targetUsername = msg.reply_to_message.from.username || `ID: ${targetId}`; // Sử dụng username nếu có, nếu không thì dùng ID
    } else if (targetUsername) {
      // Nếu nhập username, tìm ID của người dùng theo @username
      try {
        const chatMember = await bot.getChatMember(chatId, targetUsername);
        targetId = chatMember.user.id;
      } catch (err) {
        bot.sendMessage(chatId, '❌ Không tìm thấy người dùng này.');
        return;
      }
    }

    if (!targetId) {
      bot.sendMessage(chatId, '📌 Vui lòng reply tin nhắn hoặc nhập @username để mở khóa.');
      return;
    }

    try {
      await bot.unbanChatMember(chatId, targetId);
      bot.sendMessage(chatId, `✅ Đã mở khóa người dùng *${targetUsername}* khỏi nhóm.`, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Không thể mở khóa người dùng:', err);
      bot.sendMessage(chatId, '❌ Không thể mở khóa người dùng. Kiểm tra quyền của bot.');
    }
  });
};