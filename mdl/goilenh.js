/**
 * @command /
 * @category Tiện ích
 * @author tnt
 * @date 2025-03-01
 * @usage /
 * @description Kiểm tra bot.
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const historyFile = path.join(__dirname, 'command_history.json');

// Hàm lưu lệnh vào lịch sử
function saveCommandHistory(command, user) {
  let history = [];

  if (fs.existsSync(historyFile)) {
    history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
  }

  // Lấy giờ Việt Nam (UTC+7)
  const timeVN = new Date().toLocaleString('vi-VN', {  
  timeZone: 'Asia/Ho_Chi_Minh',  
  hour12: false  
});


  history.unshift({
    command,
    user,
    time: new Date().toLocaleString(),
  });

  if (history.length > 10) {
    history = history.slice(0, 10);
  }

  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
}

// Hàm lấy lịch sử lệnh
function getCommandHistory() {
  if (!fs.existsSync(historyFile)) return [];
  return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
}

module.exports = (bot) => {
  // Danh sách các link video
  const videoLinks = [
  "https://files.catbox.moe/94vnq9.mp4",
  "https://files.catbox.moe/tjyhor.mp4",
  "https://files.catbox.moe/qikju9.mp4",
  "https://files.catbox.moe/v6621x.mp4",
  "https://files.catbox.moe/xqxe34.mp4",
  "https://files.catbox.moe/bn29os.mp4",
  "https://files.catbox.moe/sf7e0p.mp4",
  "https://files.catbox.moe/prcn4j.mp4",
  "https://files.catbox.moe/f19yv0.mp4",
  "https://files.catbox.moe/l8a19e.mp4",
  "https://files.catbox.moe/lfd31t.mp4",
  "https://files.catbox.moe/k1hkgd.mp4",
  "https://files.catbox.moe/xep6sh.mp4",
  "https://files.catbox.moe/omx0yu.mp4",
  "https://files.catbox.moe/rdxlur.mp4",
  "https://files.catbox.moe/az5s5a.mp4",
  "https://files.catbox.moe/4h14tm.mp4",
  "https://files.catbox.moe/puv9ll.mp4",
  "https://files.catbox.moe/v2roqo.mp4",
  "https://files.catbox.moe/nxvak8.mp4",
  "https://files.catbox.moe/elx3km.mp4",
  "https://files.catbox.moe/vuijop.mp4",
  "https://files.catbox.moe/73nqy3.mp4",
  "https://files.catbox.moe/s8om65.mp4",
  "https://files.catbox.moe/b1qh6h.mp4",
  "https://files.catbox.moe/vyyeyo.mp4",
  "https://files.catbox.moe/gbf1nj.mp4",
  "https://files.catbox.moe/l7j5qm.mp4",
  "https://files.catbox.moe/bzi7w2.mp4",
  "https://files.catbox.moe/lpq9p7.mp4",
  "https://files.catbox.moe/3nfefo.mp4",
  "https://files.catbox.moe/al159n.mp4",
  "https://files.catbox.moe/keum3y.mp4",
  "https://files.catbox.moe/2ttp7j.mp4",
  "https://files.catbox.moe/looy7p.mp4",
  "https://files.catbox.moe/jfehu5.mp4",
  "https://files.catbox.moe/3m6aef.mp4",
  "https://files.catbox.moe/w7skrp.mp4",
  "https://files.catbox.moe/gj3jlq.mp4",
  "https://files.catbox.moe/nzqj3n.mp4",
  "https://files.catbox.moe/cnd0ho.mp4",
  "https://files.catbox.moe/lv8pap.mp4",
  "https://files.catbox.moe/ez21aj.mp4",
  "https://files.catbox.moe/d7o6ov.mp4",
  "https://files.catbox.moe/v2cbia.mp4",
  "https://files.catbox.moe/g6xx6b.mp4",
  "https://files.catbox.moe/ydaxu8.mp4",
  "https://files.catbox.moe/q1m6wg.mp4",
  "https://files.catbox.moe/obftzc.mp4",
  "https://files.catbox.moe/oviem1.mp4",
  "https://files.catbox.moe/aqckte.mp4",
  "https://files.catbox.moe/i3f2ci.mp4",
  "https://files.catbox.moe/pkbvwt.mp4",
  "https://files.catbox.moe/rduh8c.mp4",
  "https://files.catbox.moe/xoam3d.mp4",
  "https://files.catbox.moe/xot9fu.mp4",
  "https://files.catbox.moe/73jiys.mp4",
  "https://files.catbox.moe/wup9ck.mp4",
  "https://files.catbox.moe/izqexb.mp4",
  "https://files.catbox.moe/g28bgg.mp4",
  "https://files.catbox.moe/exc8pg.html",
  "https://files.catbox.moe/2imwgq.mp4",
  "https://files.catbox.moe/ahmyp3.mp4",
  "https://files.catbox.moe/6q8wjl.mp4",
  "https://files.catbox.moe/fj7ipm.mp4",
  "https://files.catbox.moe/xxhepq.mp4",
  "https://files.catbox.moe/z6eou3.mp4",
  "https://files.catbox.moe/40fvhe.mpga",
  "https://files.catbox.moe/aiz0vy.mp4",
  "https://files.catbox.moe/miq18g.mp4",
  "https://files.catbox.moe/ys7dnh.mp4",
  "https://files.catbox.moe/n90kvf.mp4",
  "https://files.catbox.moe/xoam3d.mp4",
  "https://files.catbox.moe/mgoe85.mp4",
  "https://files.catbox.moe/1px71z.mp4",
  "https://files.catbox.moe/9p2rvu.mp4",
  "https://files.catbox.moe/eveodk.mp4",
  "https://files.catbox.moe/w67w1v.mp4",
  "https://files.catbox.moe/izqexb.mp4",
  "https://files.catbox.moe/9eirsa.mp4",
  "https://files.catbox.moe/vp7ibx.mp4",
  "https://files.catbox.moe/fwcakj.mp4",
  "https://files.catbox.moe/q39mac.mp4",
  "https://files.catbox.moe/2sobu5.mp4",
  "https://files.catbox.moe/ppimxr.mp4",
  "https://files.catbox.moe/8ssppq.mp4",
  "https://files.catbox.moe/r4dxlp.mp4",
  "https://files.catbox.moe/tvycae.mp4",
  "https://files.catbox.moe/b3exa7.mp4",
  "https://files.catbox.moe/ez0198.mp4",
  "https://files.catbox.moe/9s2kd0.mp4",
  "https://files.catbox.moe/wtzeyr.mp4",
  "https://files.catbox.moe/o4pau0.mp4",
  "https://files.catbox.moe/0umej4.mp4",
  "https://files.catbox.moe/5mf5m4.mp4",
  "https://files.catbox.moe/7n3zyh.mp4",
  "https://files.catbox.moe/2oo02y.mp4",
  "https://files.catbox.moe/mmcors.mp4",
  "https://files.catbox.moe/93zij8.mp4",
  "https://files.catbox.moe/5vqanv.mp4",
  "https://files.catbox.moe/c2fqq3.mp4",
  "https://files.catbox.moe/u2ygsb.mp4",
  "https://files.catbox.moe/z99vk7.mp4",
  "https://files.catbox.moe/7mpzzy.mp4",
  "https://files.catbox.moe/68p8dd.mp4",
  "https://files.catbox.moe/uf5wkd.mp4",
  "https://files.catbox.moe/jg5t9x.mp4",
  "https://files.catbox.moe/mlw786.mp4",
  "https://files.catbox.moe/em2hkf.mp4",
  "https://files.catbox.moe/623fr4.mp4",
  "https://files.catbox.moe/bso8j3.mp4",
  "https://files.catbox.moe/id6pe2.mp4",
  "https://files.catbox.moe/2tzwtf.mp4",
  "https://files.catbox.moe/9bdiqm.mp4",
  "https://files.catbox.moe/v5d7et.mp4",
  "https://files.catbox.moe/beehpa.mp4",
  "https://files.catbox.moe/p4r3yu.mp4",
  "https://files.catbox.moe/znojxq.mp4",
  "https://files.catbox.moe/x37tt2.mp4",
  "https://files.catbox.moe/lsbud3.mp4",
  "https://files.catbox.moe/b29to4.mp4",
  "https://files.catbox.moe/dtawqz.mp4",
  "https://files.catbox.moe/6wzv0k.mp4",
  "https://files.catbox.moe/ajnl9q.mp4",
  "https://files.catbox.moe/07ukd5.mp4",
  "https://files.catbox.moe/36teky.mp4",
  "https://files.catbox.moe/ps8mtp.mp4",
  "https://files.catbox.moe/8rmk57.mp4",
  "https://files.catbox.moe/q6qvbw.mp4",
  "https://files.catbox.moe/6j4mfy.mp4",
  "https://files.catbox.moe/nnql1b.mp4",
  "https://files.catbox.moe/1ez2z4.mp4",
  "https://files.catbox.moe/x67wjs.mp4",
  "https://files.catbox.moe/9p4kl7.mp4",
  "https://files.catbox.moe/wijp9b.mp4",
  "https://files.catbox.moe/t5177r.mp4",
  "https://files.catbox.moe/1yacbn.mp4",
  "https://files.catbox.moe/zr3fs2.mp4",
  "https://files.catbox.moe/ebhk09.mp4",
  "https://files.catbox.moe/7pqim0.mp4",
  "https://files.catbox.moe/405z8l.mp4",
  "https://files.catbox.moe/zsoyta.mp4",
  "https://files.catbox.moe/dcjw9t.mp4",
  "https://files.catbox.moe/9fsiiz.mp4",
  "https://files.catbox.moe/9pytfr.mp4",
  "https://files.catbox.moe/hkifln.mp4",
  "https://files.catbox.moe/55vpmr.mp4",
  "https://files.catbox.moe/2oatg7.mp4",
  "https://files.catbox.moe/8bhxz4.mp4",
  "https://files.catbox.moe/ah7zyf.mp4",
  "https://files.catbox.moe/rkl97s.mp4",
  "https://files.catbox.moe/ox9l2w.mp4",
  "https://files.catbox.moe/1yzx8y.mp4",
  "https://files.catbox.moe/wc5vfi.mp4",
  "https://files.catbox.moe/xoqcc6.mp4",
  "https://files.catbox.moe/bwyuhr.mp4",
  "https://files.catbox.moe/k4iuao.mp4",
  "https://files.catbox.moe/cugmvy.mp4",
  "https://files.catbox.moe/8set11.mp4",
  "https://files.catbox.moe/yp9xpt.mp4",
  "https://files.catbox.moe/ubb024.mp4",
  "https://files.catbox.moe/zeevng.mp4",
  "https://files.catbox.moe/y5ucny.mp4",
  "https://files.catbox.moe/fmzhxg.mp4",
  "https://files.catbox.moe/9b3rd2.mp4",
  "https://files.catbox.moe/6iffv6.mp4",
  "https://files.catbox.moe/b9898a.mp4",
  "https://files.catbox.moe/zqr220.mp4",
  "https://files.catbox.moe/u5jkol.mp4",
  "https://files.catbox.moe/ynkcbo.mp4"
  ];

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text && text.trim() === '/') {
      saveCommandHistory(text, msg.from.username || msg.from.first_name); // Lưu lịch sử

      // Lấy lịch sử lệnh
      const history = getCommandHistory();
      const historyText = history.map((h, i) => `${i + 1}. ${h.command} - ${h.user} (${h.time})`).join('\n');

      try {
        const videoUrl = videoLinks[Math.floor(Math.random() * videoLinks.length)];
        const filePath = path.join(__dirname, 'temp_video.mp4');

        const videoResponse = await axios({
          url: videoUrl,
          method: 'GET',
          responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);
        videoResponse.data.pipe(writer);

        writer.on('finish', async () => {
          // Gửi video kèm lịch sử lệnh
          await bot.sendVideo(chatId, filePath, {
            caption: `📌 Sử dụng /menu để biết thêm lệnh.\n\n🕒 *Lịch sử lệnh gần đây:*\n${historyText}`,
            parse_mode: 'Markdown'
          });

          // Xóa file sau khi gửi
          fs.unlinkSync(filePath);
        });

        writer.on('error', (err) => {
          console.error('Lỗi khi lưu video:', err);
          bot.sendMessage(chatId, '❌ Không thể tải video.');
        });

      } catch (err) {
        console.error('Lỗi khi tải video:', err);
        bot.sendMessage(chatId, '❌ Không thể tải video.');
      }
    }
  });
};