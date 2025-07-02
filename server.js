const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
app.use(cors({
  origin: "https://paas93.github.io"
}));
app.use(express.json()); // 🔥 POST 요청의 body를 읽을 수 있게 함

// Supabase 클라이언트 설정
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ 캐릭터 프로필 API (기존 유지)
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

// ✅ 레이드 카드 API

// 카드 조회
app.get('/cards/:raid_id', async (req, res) => {
  const { raid_id } = req.params;
  const { data, error } = await supabase
    .from('raid_cards')
    .select('*')
    .eq('raid_id', raid_id)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 카드 추가
app.post('/cards', async (req, res) => {
  const { raid_id, nickname, role } = req.body;
  const { data, error } = await supabase
    .from('raid_cards')
    .insert([{ raid_id, nickname, role }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 카드 삭제
app.delete('/cards/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('raid_cards')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});


// ✅ 레이드 일정 API 추가 🔥

// 일정 불러오기
app.get('/schedules/:raid_id', async (req, res) => {
  const { raid_id } = req.params;
  const { data, error } = await supabase
    .from('raid_schedules')
    .select('*')
    .eq('raid_id', raid_id)
    .single();

  if (error && error.code !== 'PGRST116')
    return res.status(500).json({ error: error.message });

  res.json(data || {});
});

// 일정 저장/업데이트
app.post('/schedules/:raid_id', async (req, res) => {
  const { raid_id } = req.params;
  const { date, time, level } = req.body;

  const { data, error } = await supabase
    .from('raid_schedules')
    .upsert({ raid_id, date, time, level, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});


// 🚀 Render 포트 설정
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 서버 실행 중! http://localhost:${PORT}`));
