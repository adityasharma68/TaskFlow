// controllers/aiController.js
const https = require('https');

const suggestTask = async (req, res) => {
  try {
    const { title, description, due_date, status, remarks } = req.body;

    if (!title || !title.trim()) {
      return res.status(422).json({
        success: false,
        message: 'Task title is required.',
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'GROQ_API_KEY is missing from your .env file.',
      });
    }

    const taskContext = [
      `Task Title: ${title}`,
      description ? `Description: ${description}` : null,
      due_date     ? `Due Date: ${due_date}`        : null,
      status       ? `Current Status: ${status}`    : null,
      remarks      ? `Remarks/Notes: ${remarks}`    : null,
    ].filter(Boolean).join('\n');

    const prompt = `You are a helpful productivity assistant inside a task management app called TaskFlow.

A user needs help completing the following task:

${taskContext}

Please provide a clear, practical, and motivating response with:

1. **Quick Summary** — One sentence explaining what this task is about.
2. **Step-by-Step Plan** — A numbered list of 4 to 6 concrete action steps to complete this task. Be specific and actionable.
3. **Pro Tips** — 2 to 3 expert tips or best practices relevant to this task.
4. **Time Estimate** — A realistic estimate of how long this task might take.
5. **Motivational Note** — One short sentence to encourage the user to get started.

Keep the tone friendly, professional, and encouraging. Format using markdown with bold headings.`;

    const body = JSON.stringify({
      model:       'llama-3.1-8b-instant',
      messages:    [{ role: 'user', content: prompt }],
      max_tokens:  1024,
      temperature: 0.7,
    });

    const options = {
      hostname: 'api.groq.com',
      path:     '/openai/v1/chat/completions',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const suggestion = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              reject(new Error(parsed.error.message || 'Groq API error'));
              return;
            }
            const text = parsed.choices?.[0]?.message?.content;
            if (!text) {
              reject(new Error('No response from Groq'));
              return;
            }
            resolve(text);
          } catch (e) {
            reject(new Error('Failed to parse Groq response'));
          }
        });
      });
      request.on('error', (err) => reject(err));
      request.write(body);
      request.end();
    });

    console.log(`[AI Groq] ✅ Suggestion generated for: "${title}"`);

    return res.status(200).json({
      success: true,
      message: 'AI suggestion generated successfully.',
      data: {
        suggestion,
        task_title:  title,
        model:       'llama-3.1-8b-instant (Groq)',
        tokens_used: 0,
      },
    });

  } catch (err) {
    console.error('[AI Error]', err.message);
    return res.status(500).json({
      success: false,
      message: `AI error: ${err.message}`,
    });
  }
};

module.exports = { suggestTask };
