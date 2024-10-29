import OpenAI from "openai";
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();  // 환경 변수를 로드

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.post('/practice', async (req, res) => {
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const messageWrapper = req.body;
    const messages = messageWrapper.messages;

    // messages 배열이 유효한지 확인
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Invalid messages: expected a non-empty array." });
    }

    // content 필드에서 'text'만 추출하여 단일 문자열로 변환
    const formattedMessages = messages.map(msg => {
        const textContent = msg.content && Array.isArray(msg.content)
            ? msg.content.find(c => c.type === "text")?.text || ""
            : msg.content;  // content가 배열이 아닐 경우 대비

        return {
            role: msg.role,
            content: textContent  // 문자열로 변환
        };
    });

    console.log('Formatted Messages:', JSON.stringify(formattedMessages, null, 2));

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'ft:gpt-4o-mini-2024-07-18::basicv2:AKM42qlZ',
            messages: formattedMessages,  // 문자열로 변환된 messages 배열
            temperature: 1,
            max_tokens: 2048,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const assistantMessage = response.data.choices[0].message.content;
        res.json({ message: assistantMessage });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});


app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://3.38.24.87:${port}`);
});
