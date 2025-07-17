const os = require('os');
const fs = require('fs');

module.exports = (bot, chatId) => {
  // Thời gian chạy bot
  const uptimeInSeconds = process.uptime();
  const hours = Math.floor(uptimeInSeconds / 3600);
  const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeInSeconds % 60);
  const uptimeString = `${hours} giờ ${minutes} phút ${seconds} giây`;

  // Ngày hiện tại
  const now = new Date();
  const dateString = now.toLocaleDateString('vi-VN');

  // CPU Usage
  const cpuUsage = os.loadavg()[0] * 10; // Load trung bình nhân với 10 để có %
  const cpuStatus = cpuUsage < 40 ? 'Mượt' : 'Chậm';

  // Memory Usage
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = ((totalMemory - freeMemory) / totalMemory) * 100;
  
  // Disk Usage (chỉ hỗ trợ trên hệ thống Linux)
  let diskUsage = 'Không xác định';
  if (fs.existsSync('/')) {
    const { size, free } = fs.statSync('/');
    diskUsage = `${((1 - free / size) * 100).toFixed(2)}%`;
  }

  // Tạo thông báo
  const message = `
📌 *Uptime Bot*
🕒 *Thời gian chạy:* ${uptimeString}
📅 *Ngày hiện tại:* ${dateString}
⚡ *Trạng thái:* ${cpuStatus}
💾 *CPU Usage:* ${cpuUsage.toFixed(2)}%
📊 *Memory Usage:* ${usedMemory.toFixed(2)}%
  `;

  // Gửi tin nhắn
  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
};