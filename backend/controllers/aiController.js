// controllers/aiController.js
// ============================================================
// AI Controller – Calls Anthropic Claude API to generate
// smart step-by-step suggestions for completing a task.
// Uses the logged-in user's context for personalised advice.
// ============================================================

const Anthropic = require('@anthropic-ai/sdk');

// Initialise Anthropic client — reads ANTHROPIC_API_KEY from .env
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── POST /api/ai/suggest ────────────────────────────────────
const suggestTask = async (req, res) => {
  try {
    const { title, description, due_date, status, remarks } = req.body;
    const userName = req.user?.name || 'the user';

    // Validate — must provide at least a title
    if (!title || !title.trim()) {
      return res.status(422).json({
        success: false,
        message: 'Task title is required to generate suggestions.',
      });
    }

    // ── Build a rich, structured prompt ──────────────────────
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

    // ── Call Claude API ────────────────────────────────────────
    const message = await anthropic.messages.create({
      model:      'claude-opus-4-5',
      max_tokens: 1024,
      messages:   [{ role: 'user', content: prompt }],
    });

    // Extract text from the response
    const suggestion = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return res.status(200).json({
      success:    true,
      message:    'AI suggestion generated successfully.',
      data: {
        suggestion,
        task_title: title,
        model:      message.model,
        tokens_used: message.usage?.output_tokens || 0,
      },
    });

  } catch (err) {
    console.error('[suggestTask AI]', err);

    // Handle specific Anthropic API errors gracefully
    if (err.status === 401) {
      return res.status(500).json({
        success: false,
        message: 'Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY in .env',
      });
    }
    if (err.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'AI rate limit reached. Please wait a moment and try again.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI suggestion. Please try again.',
    });
  }
};

module.exports = { suggestTask };
