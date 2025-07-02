const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

app.get('/armories/characters/:nickname/profiles', async (req, res) => {
  const { nickname } = req.params;
  const url = `https://developer-lostark.game.onstove.com/armories/characters/${encodeURIComponent(nickname)}/profiles`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `bearer ${process.env.LOSTARK_API_KEY}`,
        'accept': 'application/json'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '데이터 요청 실패', detail: err.toString() });
  }
});

// 🚀 Render 호환 포트 설정
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 서버 실행 중! http://localhost:${PORT}`));
