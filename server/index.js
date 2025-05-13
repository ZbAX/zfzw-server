require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS配置
app.use(cors({
  origin: ['https://zfzw-server-2.onrender.com', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../zfzw_program')));

// API代理端点
app.post('/api/test', async (req, res) => {
  try {
    const { input1 } = req.body;
    
    const response = await axios.post('https://zfzw-api.onrender.com/api/test', {
      input1
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.COZE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('API请求错误:', error);
    res.status(500).json({ 
      error: '服务器内部错误',
      details: error.message 
    });
  }
});

// 处理所有其他路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../zfzw_program/index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 