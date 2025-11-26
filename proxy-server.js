import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper to parse Baekjoon
async function parseBaekjoon(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        const title = $('#problem_title').text().trim();
        const description = $('#problem_description').text().trim();
        const inputDesc = $('#problem_input').text().trim();
        const outputDesc = $('#problem_output').text().trim();

        // Examples
        let examples = "";
        let i = 1;
        while ($(`#sample-input-${i}`).length > 0) {
            const input = $(`#sample-input-${i}`).text().trim();
            const output = $(`#sample-output-${i}`).text().trim();
            examples += `\n[예제 입력 ${i}]\n${input}\n\n[예제 출력 ${i}]\n${output}\n`;
            i++;
        }

        return `[문제 제목]: ${title}\n\n[문제 설명]\n${description}\n\n[입력]\n${inputDesc}\n\n[출력]\n${outputDesc}\n\n[예제]${examples}`;
    } catch (error) {
        throw new Error("백준 문제 파싱 실패: " + error.message);
    }
}

// Helper to parse Programmers (Limited support as it's often dynamic/SPA)
// Note: Programmers often renders content via JS, so simple axios/cheerio might not get everything.
// We will try to get meta description or basic content if available.
async function parseProgrammers(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        // Programmers structure is complex and often dynamic. 
        // This is a best-effort attempt for static parts.
        const title = $('.algorithm-title').text().trim() || $('title').text().trim();
        const description = $('.guide-section-description').text().trim() || "프로그래머스 문제는 동적 렌더링으로 인해 전체 내용을 가져오기 어려울 수 있습니다. 링크를 참조하세요.";

        return `[문제 제목]: ${title}\n\n[문제 설명]\n${description}`;
    } catch (error) {
        throw new Error("프로그래머스 문제 파싱 실패: " + error.message);
    }
}

app.get('/api/parse', async (req, res) => {
    const { url, platform } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        let content = "";
        if (platform === 'baekjoon' || url.includes('acmicpc.net')) {
            // If user enters just a number, convert to URL
            let targetUrl = url;
            if (/^\d+$/.test(url)) {
                targetUrl = `https://www.acmicpc.net/problem/${url}`;
            }
            content = await parseBaekjoon(targetUrl);
        } else if (platform === 'programmers' || url.includes('programmers.co.kr')) {
            content = await parseProgrammers(url);
        } else {
            return res.status(400).json({ error: '지원하지 않는 플랫폼입니다.' });
        }

        res.json({ content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '문제 정보를 가져오는데 실패했습니다. URL을 확인해주세요.' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
