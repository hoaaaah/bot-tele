const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const sendAutoDeleteMessage = require('./functions/sendAutoDeleteMessage');
const setupAutoNoti = require('./functions/autonoti');
const sendUptime = require('./functions/uptime');

// Thêm trực tiếp thông tin vào mã nguồn
const token = "7419228820:AAEIVjNxCYpmTzhN4uP_xz_XrMaQk-guGak";
const adminId = "6476532822";
const groupId = "-1002759861322";

// Khởi tạo bot với token
const bot = new TelegramBot(token, { polling: true });

// Tự động import tất cả các module trong thư mục "mdl/"
const mdlPath = path.join(__dirname, 'mdl');
fs.readdirSync(mdlPath).forEach((file) => {
    if (file.endsWith('.js')) {
        require(`./mdl/${file}`)(bot, { adminId, groupId });
    }
});

// Lắng nghe lệnh /start
bot.onText(/\/start/, (msg) => {
    sendAutoDeleteMessage(bot, msg.chat.id, 'Xin chào! Tôi là bot của Huyenn Khanh.');
});

bot.onText(/\/uptime/, (msg) => {
    sendUptime(bot, msg.chat.id);
});

// Gửi thông báo khi bot khởi động
sendAutoDeleteMessage(bot, adminId, 'Bot đã khởi động và sẵn sàng hoạt động!');
setupAutoNoti(bot, groupId);
