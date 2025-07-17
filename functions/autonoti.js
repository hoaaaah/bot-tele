module.exports = (bot, groupId) => {
  function sendMorningNoti() {
    const now = new Date();
    if (now.getHours() === 7 && now.getMinutes() === 0) {
      bot.sendMessage(groupId, "🌞 Chào buổi sáng! Chúc bạn một ngày tốt lành! ☕");
    }
  }

  function sendReminderNoti() {
    const now = new Date();
    if (now.getHours() % 3 === 0 && now.getMinutes() === 0) {
      bot.sendMessage(groupId, "⏰ Chào các tình yêu!");
    }
  }

  setInterval(() => {
    sendMorningNoti();
    sendReminderNoti();
  }, 60 * 1000); // Kiểm tra mỗi phút

  console.log("✅ AutoNoti on");
};