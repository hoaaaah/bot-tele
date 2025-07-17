/**
 * @command /ai
 * @category Al
 * @author khanhh huyen
 * @date 2025-03-01
 * @usage /ai + số model + chat
 * @description OpenAl.
 */
const axios = require("axios");

module.exports = (bot) => {
  // Danh sách mô hình AI
  const models = [
    { name: "Claude 3.5 Haiku", model: "claude-3-5-haiku" },
    { name: "Claude 3.5 Sonnet", model: "claude-3-5-sonnet" },
    { name: "Claude 3.7 Sonnet", model: "claude-3-7-sonnet" },
    { name: "Claude 3 Haiku", model: "claude-3-haiku-20240307" },
    { name: "Claude 3 Opus", model: "claude-3-opus-20240229" },
    { name: "Claude 3 Sonnet", model: "claude-3-sonnet-20240229" },
    { name: "Command R", model: "command-r" },
    { name: "DeepSeek-R1", model: "deepseek-r1" },
    { name: "Gemini 1.5 Flash", model: "gemini-1.5-flash" },
    { name: "Gemini 1.5 Pro", model: "gemini-1.5-pro" },
    { name: "Gemini 2.0 Flash", model: "gemini-2.0-flash" },
    { name: "Gemma 2 9B IT", model: "gemma2-9b-it" },
    { name: "GPT-3.5 Turbo", model: "azure/gpt-35-turbo-0125" },
    { name: "GPT-4o", model: "azure/gpt-4o" },
    { name: "GPT-4o Mini", model: "azure/gpt-4o-mini" },
    { name: "GPT-4 Turbo", model: "azure/gpt-4-turbo" },
    { name: "Granite 13B Chat v2", model: "watsonx/ibm/granite-13b-chat-v2" },
    { name: "Granite 3.0 8B Instruct", model: "watsonx/ibm/granite-3-8b-instruct" },
    { name: "Llama 3.1 8B Instant", model: "llama-3.1-8b-instant" },
    { name: "Llama 3.3 70B", model: "llama-3.3-70b-versatile" },
    { name: "Llama 3 70B", model: "groq/llama3-70b-8192" },
    { name: "Mixtral", model: "groq/mixtral-8x7b-32768" },
    { name: "O1", model: "o1" },
    { name: "O1 Mini", model: "o1-mini" },
    { name: "O3 Mini", model: "o3-mini" },
    { name: "Qwen 2.5 72B", model: "qwen/qwen2.5-72b-instruct-turbo" },
    { name: "Qwen 2 72B Instruct", model: "qwen/qwen2-72b-instruct" },
    { name: "Saul Instruct V1", model: "huggingface/Saul-Instruct-v1" },
    { name: "WhiteRabbitNeo 2.5 32B (Beta)", model: "WhiteRabbitNeo/WhiteRabbitNeo-2.5-Qwen-2.5-32B" },
    { name: "WhiteRabbitNeo 33B v1.7", model: "/models/WhiteRabbitNeo-33B-DeepSeekCoder" },
    { name: "WhiteRabbitNeo R1 32B", model: "WhiteRabbitNeo-R1-32B" }
  ];

  // Lệnh /aihelp để hiển thị danh sách mô hình
  bot.onText(/\/aihelp/, (msg) => {
    const chatId = msg.chat.id;
    let modelList = models
      .map((item, index) => `*${index + 1}.* ${item.name} \`(${item.model})\``)
      .join("\n");

    bot.sendMessage(
      chatId,
      `📌 *Danh sách models AI có thể sử dụng:*\n\n${modelList}\n\n👉 Sử dụng lệnh: \`/ai <số> <tin nhắn>\``,
      { parse_mode: "Markdown" }
    );
  });

  // Lệnh /ai để gọi AI với mô hình được chọn
  bot.onText(/\/ai (\d+)?\s*(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const modelIndex = parseInt(match[1], 10) - 1; // Chỉ số của model
    const userMessage = match[2]; // Nội dung tin nhắn

    // Kiểm tra model có hợp lệ không
    const modelData =
      models[modelIndex] || models.find((m) => m.model === "llama-3.1-8b-instant"); // Mặc định dùng Llama 3.1 8B
    const modelName = modelData.name;
    const model = modelData.model;

    try {
      // Gửi yêu cầu đến API AI
      const response = await axios.post(
        "https://llm.kindo.ai/v1/chat/completions",
        {
          model: model,
          messages: [{ role: "user", content: userMessage }],
        },
        {
          headers: {
            "api-key": "9ed3551e-bacc-44b4-9649-2b32cacc34b5-65b7c66ea287cf40",
            "content-type": "application/json",
          },
        }
      );

      // Lấy phản hồi từ API
      let aiResponse = response.data.choices[0].message.content;

      // Kiểm tra nếu AI trả lời bằng code
      if (aiResponse.includes("```")) {
        aiResponse = `💻 AI đã trả lời bằng code:\n${aiResponse}`;
      } else {
        aiResponse = `🤖 AI:\n${aiResponse}`;
      }

      // Gửi phản hồi của AI vào nhóm
      bot.sendMessage(chatId, `📌 Model: *${modelName}*\n\n${aiResponse}`, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("❌ Lỗi khi gọi API AI:", error.message);
      bot.sendMessage(chatId, "❌ Đã xảy ra lỗi khi gọi API AI. Vui lòng thử lại.");
    }
  });
};
