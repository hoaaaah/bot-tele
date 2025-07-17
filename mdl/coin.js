/**
 * @command /coin
 * @category Game
 * @author khanhh huyenn
 * @date 2025-07-08
 * @usage /coin
 * @description Game giao dịch chứng khoán. Đăng ký/đăng nhập qua chat riêng, chơi trong nhóm.
 */

const axios = require('axios');
const fs = require('fs');

const API_BASE_URL = 'https://seven72025.onrender.com/api';
const USER_DATA_FILE = './userData.json';


function loadUserData() {
    try {
        if (fs.existsSync(USER_DATA_FILE)) {
            const fileContent = fs.readFileSync(USER_DATA_FILE, 'utf8');
            return JSON.parse(fileContent);
        }
    } catch (error) {
        console.error('Lỗi khi tải file userData.json:', error);
    }
    return {};
}

function saveUserData() {
    try {
        fs.writeFileSync(USER_DATA_FILE, JSON.stringify(userData, null, 2));
    } catch (error) {
        console.error('Lỗi khi lưu file userData.json:', error);
    }
}

let userData = loadUserData();
const conversationState = {};

module.exports = (bot) => {
      
    bot.onText(/\/coin$/, async (msg) => {
        const userId = msg.from.id.toString();
        let text = `Chào mừng bạn đến với Sàn Giao Dịch Tiền Ảo, **${msg.from.first_name}**! 🚀\n`;
        
        if (userData[userId] && userData[userId].token) {
            text += `\nBạn đã đăng nhập với tài khoản **${userData[userId].username}**.`;
        } else {
            text += `\nBạn chưa có tài khoản. Vui lòng nhắn tin riêng cho bot để đăng ký.`;
        }

        text += '\n\nVui lòng chọn một hành động:';
        
        const options = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    
                    [
                        { text: '📝 Đăng ký', callback_data: 'coin_register' },
                        { text: '🔑 Đăng nhập', callback_data: 'coin_login' }
                    ],
                    [
                        { text: '📈 Mua cổ phiếu', callback_data: 'coin_buy' },
                        { text: '📉 Bán cổ phiếu', callback_data: 'coin_sell' }
                    ],
                    [
                        { text: '💼 Xem Portfolio', callback_data: 'coin_portfolio' },
                        { text: '📊 Xem Bảng Điện', callback_data: 'coin_ticker' }
                    ]
                ]
            }
        };
        bot.sendMessage(msg.chat.id, text, options);
    });

    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const userId = callbackQuery.from.id.toString();
        const data = callbackQuery.data;

        if (!data.startsWith('coin_')) return;
        bot.answerCallbackQuery(callbackQuery.id);

        const action = data.split('_')[1];

        if (['register', 'login'].includes(action)) {
            // Nếu đang ở trong nhóm, yêu cầu người dùng chat riêng
            if (msg.chat.type !== 'private') {
                const botInfo = await bot.getMe();
                return bot.sendMessage(chatId, `Để bảo mật, **${callbackQuery.from.first_name}** vui lòng nhắn tin riêng cho bot để ${action === 'register' ? 'đăng ký' : 'đăng nhập'}.`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[{ text: `Bắt đầu chat riêng`, url: `https://t.me/${botInfo.username}` }]]
                    }
                });
            }
            // Nếu đã ở chat riêng, tiếp tục xử lý bên dưới
        }
     
        else if (['buy', 'sell', 'portfolio'].includes(action) && (!userData[userId] || !userData[userId].token)) {
            return bot.sendMessage(chatId, `⚠️ **${callbackQuery.from.first_name}**, bạn cần đăng ký/đăng nhập trước! Vui lòng nhắn tin riêng cho bot.`, { parse_mode: 'Markdown' });
        }

        
        switch (action) {
            case 'register':
                if (userData[userId]) {
                    return bot.sendMessage(chatId, 'Bạn đã có tài khoản rồi!');
                }
                conversationState[userId] = { step: 'register_username', data: {} };
                bot.sendMessage(chatId, '📝 **Đăng ký**\nVui lòng nhập `tên đăng nhập` bạn muốn tạo:', { parse_mode: 'Markdown' });
                break;
            case 'login':
                conversationState[userId] = { step: 'login_username', data: {} };
                bot.sendMessage(chatId, '🔑 **Đăng nhập**\nVui lòng nhập `tên đăng nhập` của bạn:', { parse_mode: 'Markdown' });
                break;
            case 'buy':
                conversationState[userId] = { step: 'buy_stock', chatId: chatId }; // Lưu lại chatId của nhóm
                bot.sendMessage(chatId, `📈 **${callbackQuery.from.first_name}**, vui lòng nhập lệnh mua theo định dạng: \`MÃ_CP SỐ_LƯỢNG\`\nVí dụ: \`AAPL 10\``, { parse_mode: 'Markdown' });
                break;
            case 'sell':
                conversationState[userId] = { step: 'sell_stock', chatId: chatId }; // Lưu lại chatId của nhóm
                bot.sendMessage(chatId, `📉 **${callbackQuery.from.first_name}**, vui lòng nhập lệnh bán theo định dạng: \`MÃ_CP SỐ_LƯỢNG\`\nVí dụ: \`TSLA 5\``, { parse_mode: 'Markdown' });
                break;
            case 'portfolio':
                await handleViewPortfolio(chatId, userId);
                break;
            case 'ticker':
                await handleViewTicker(chatId);
                break;
        }
    });
 
    bot.on('message', async (msg) => {
        const userId = msg.from.id.toString();
        const text = msg.text;

        // Chỉ xử lý nếu người dùng đang trong một cuộc hội thoại
        if (!conversationState[userId] || text.startsWith('/')) return;

        const state = conversationState[userId];
        const targetChatId = state.chatId || msg.chat.id; // Gửi phản hồi về nhóm hoặc chat riêng
        
        // Xóa trạng thái ngay sau khi nhận được tin nhắn để tránh lặp lại
        delete conversationState[userId];

        try {
            switch (state.step) {
                // Các bước đăng ký/đăng nhập chỉ xảy ra trong chat riêng
                case 'register_username':
                    state.data.username = text;
                    state.step = 'register_password';
                    conversationState[userId] = state;
                    bot.sendMessage(targetChatId, 'Vui lòng nhập `mật khẩu`:', { parse_mode: 'Markdown' });
                    break;
                case 'register_password':
                    state.data.password = text;
                    await handleRegister(targetChatId, userId, state.data.username, state.data.password);
                    break;
                case 'login_username':
                    state.data.username = text;
                    state.step = 'login_password';
                    conversationState[userId] = state;
                    bot.sendMessage(targetChatId, 'Vui lòng nhập `mật khẩu`:', { parse_mode: 'Markdown' });
                    break;
                case 'login_password':
                    state.data.password = text;
                    await handleLogin(targetChatId, userId, state.data.username, state.data.password);
                    break;
                
                // Các bước mua/bán có thể xảy ra trong nhóm
                case 'buy_stock':
                    const [buySymbol, buyShares] = text.split(' ');
                    if (!buySymbol || !buyShares || isNaN(parseInt(buyShares))) {
                        bot.sendMessage(targetChatId, '❌ Định dạng không hợp lệ. Vui lòng thử lại.');
                    } else {
                        await handleBuy(targetChatId, userId, buySymbol.toUpperCase(), parseInt(buyShares));
                    }
                    break;
                case 'sell_stock':
                    const [sellSymbol, sellShares] = text.split(' ');
                    if (!sellSymbol || !sellShares || isNaN(parseInt(sellShares))) {
                        bot.sendMessage(targetChatId, '❌ Định dạng không hợp lệ. Vui lòng thử lại.');
                    } else {
                        await handleSell(targetChatId, userId, sellSymbol.toUpperCase(), parseInt(sellShares));
                    }
                    break;
            }
        } catch (error) {
            bot.sendMessage(targetChatId, 'Đã có lỗi xảy ra. Vui lòng thử lại.');
            console.error(error);
        }
    });

    
    async function handleRegister(chatId, userId, username, password) {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, { username, password });
            const successMessage = response.data.msg || "Đăng ký thành công!";
            bot.sendMessage(chatId, `✅ ${successMessage}\nĐang tự động đăng nhập...`, { parse_mode: 'Markdown' });
            await handleLogin(chatId, userId, username, password);
        } catch (error) {
            const errorMessage = error.response?.data?.msg || error.response?.data?.message || 'Tên người dùng có thể đã tồn tại.';
            bot.sendMessage(chatId, `❌ Đăng ký thất bại: ${errorMessage}`);
        }
    }

    async function handleLogin(chatId, userId, username, password) {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
            const token = response.data.token;
            userData[userId] = { username, password, token };
            saveUserData();
            bot.sendMessage(chatId, `✅ Đăng nhập thành công! Giờ bạn có thể bắt đầu giao dịch ở bất kỳ nhóm nào có bot.`, { parse_mode: 'Markdown' });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Sai tên đăng nhập hoặc mật khẩu.';
            bot.sendMessage(chatId, `❌ Đăng nhập thất bại: ${errorMessage}`);
        }
    }
    
    async function handleViewPortfolio(chatId, userId) {
        try {
            const token = userData[userId].token;
            const response = await axios.get(`${API_BASE_URL}/portfolio`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const portfolio = response.data;
            let portfolioText = `💼 **Portfolio của ${userData[userId].username}**\n\n`;
            portfolioText += `💵 **Tiền mặt:** ${portfolio.cash.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n\n`;
            portfolioText += '📈 **Cổ phiếu đang nắm giữ:**\n';
            if (portfolio.holdings && portfolio.holdings.length > 0) {
                portfolio.holdings.forEach(stock => {
                    portfolioText += `- **${stock.symbol}**: ${stock.shares} cổ phiếu\n`;
                });
            } else {
                portfolioText += '_Bạn chưa sở hữu cổ phiếu nào._\n';
            }
            bot.sendMessage(chatId, portfolioText, { parse_mode: 'Markdown' });
        } catch (error) {
            bot.sendMessage(chatId, '❌ Không thể tải được thông tin portfolio. Token của bạn có thể đã hết hạn, vui lòng thử Đăng nhập lại.');
        }
    }

    async function handleBuy(chatId, userId, symbol, shares) {
        try {
            const token = userData[userId].token;
            const response = await axios.post(`${API_BASE_URL}/portfolio/buy`, 
                { symbol, shares },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const successMessage = response.data.msg || "Giao dịch thành công!";
            const newCash = response.data.portfolio.cash;
            bot.sendMessage(chatId, `✅ **${successMessage}**\n**${userData[userId].username}** vừa mua ${shares} ${symbol}.\nSố dư mới: **${newCash.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}**`, { parse_mode: 'Markdown' });
        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'Giao dịch thất bại.';
            bot.sendMessage(chatId, `❌ **Lỗi:** ${errorMessage}`);
        }
    }

    async function handleSell(chatId, userId, symbol, shares) {
        try {
            const token = userData[userId].token;
            const response = await axios.post(`${API_BASE_URL}/portfolio/sell`, 
                { symbol, shares },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const successMessage = response.data.msg || "Giao dịch thành công!";
            const newCash = response.data.portfolio.cash;
            bot.sendMessage(chatId, `✅ **${successMessage}**\n**${userData[userId].username}** vừa bán ${shares} ${symbol}.\nSố dư mới: **${newCash.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}**`, { parse_mode: 'Markdown' });
        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'Giao dịch thất bại.';
            bot.sendMessage(chatId, `❌ **Lỗi:** ${errorMessage}`);
        }
    }

    async function handleViewTicker(chatId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/portfolio/ticker`);
          let tickerText = '📊 **Bảng điện tử**\n\n';
          response.data.forEach(stock => {
            const icon = stock.change >= 0 ? '🔼' : '🔽';
            tickerText += `**${stock.symbol}**: ${stock.price.toLocaleString('en-US')} (${icon} ${stock.change})\n`;
          });
          bot.sendMessage(chatId, tickerText, { parse_mode: 'Markdown' });
        } catch (error) {
          bot.sendMessage(chatId, '❌ Không thể tải được bảng điện tử lúc này.');
        }
    }
};
