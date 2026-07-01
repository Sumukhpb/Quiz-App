const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function normalizeOptions(options) {
  return (options || []).map((option) => {
    if (typeof option === 'string') return { text: option };
    if (option && typeof option === 'object' && typeof option.text === 'string') return { text: option.text };
    return { text: String(option || '') };
  });
}

function makeFallbackQuestions({ topic, count, difficulty }) {
  const safeTopic = (topic || 'the quiz topic').trim();
  const safeCount = Math.max(1, Math.min(8, Number(count) || 4));
  const safeDifficulty = difficulty || 'medium';
  const baseQuestions = [];

  for (let index = 0; index < safeCount; index += 1) {
    const stem = `${safeTopic} — ${safeDifficulty} level`;
    const questionText = `Which option best describes a key idea in ${stem}?`;
    const options = [
      { text: `A practical concept related to ${safeTopic}` },
      { text: `A common misconception about ${safeTopic}` },
      { text: `An advanced example of ${safeTopic}` },
      { text: `A follow-up challenge for ${safeTopic}` }
    ];
    const correctOptionIndex = 0;
    const explanation = `The best answer is the option that clearly reflects a core principle of ${safeTopic}.`;
    baseQuestions.push({ text: questionText, options, correctOptionIndex, explanation });
  }

  return baseQuestions;
}

async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are a quiz assistant that returns strict JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error('OpenAI request failed, falling back to heuristic AI.', error.message);
    return null;
  }
}

async function generateQuestions({ topic, count, difficulty }) {
  const prompt = `Generate ${count || 4} multiple-choice quiz questions about "${topic || 'the provided topic'}" at ${difficulty || 'medium'} difficulty. Return strict JSON as an array of objects with fields: text, options (array of strings), correctOptionIndex, explanation.`;

  const aiPayload = await callOpenAI(prompt);
  if (Array.isArray(aiPayload) && aiPayload.length) {
    return aiPayload.map((question) => ({
      text: question.text,
      options: normalizeOptions(question.options),
      correctOptionIndex: Number(question.correctOptionIndex || 0),
      explanation: question.explanation || 'This answer reflects a core concept behind the topic.'
    }));
  }

  return makeFallbackQuestions({ topic, count, difficulty });
}

function makeFallbackReview({ quizTitle, questions, answers, score, totalQuestions }) {
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const safeAnswers = Array.isArray(answers) ? answers : [];
  const missed = safeQuestions.filter((question, index) => {
    const answer = safeAnswers[index];
    return !answer || Number(answer.selectedIndex) !== Number(question.correctOptionIndex);
  });

  const ratio = totalQuestions ? score / totalQuestions : 0;
  let summary = `You scored ${score}/${totalQuestions} on ${quizTitle || 'this quiz'}.`;
  if (ratio >= 0.8) {
    summary += ' You have a strong grasp of the material and are ready for a more advanced challenge.';
  } else if (ratio >= 0.5) {
    summary += ' You understand many of the concepts, but a few gaps are worth revisiting.';
  } else {
    summary += ' Focus on the core ideas and revisit the questions you missed to build confidence.';
  }

  const questionReviews = safeQuestions.map((question, index) => {
    const answer = safeAnswers[index];
    const userAnswer = answer ? question.options?.[Number(answer.selectedIndex)]?.text : null;
    const correctAnswer = question.options?.[Number(question.correctOptionIndex)]?.text || null;
    const isCorrect = Boolean(answer && Number(answer.selectedIndex) === Number(question.correctOptionIndex));
    return {
      questionText: question.text,
      isCorrect,
      yourAnswer: userAnswer,
      correctAnswer,
      explanation: question.explanation || `The best answer is ${correctAnswer || 'the correct option'} because it aligns with the main idea of the topic.`
    };
  });

  return {
    summary,
    strengths: ratio >= 0.5 ? ['You answered several questions correctly.', 'You demonstrated a solid understanding of the main ideas.'] : ['You attempted every question thoughtfully.'],
    focusAreas: missed.length
      ? missed.slice(0, 3).map((question) => question.text)
      : ['Continue practicing and try a second round to reinforce confidence.'],
    questionReviews,
    score,
    totalQuestions
  };
}

async function summarizeAttempt({ quizTitle, questions, answers, score, totalQuestions }) {
  const prompt = `Summarize a quiz attempt for "${quizTitle || 'the quiz'}". The user scored ${score}/${totalQuestions}. Return strict JSON with fields: summary, strengths (array), focusAreas (array), questionReviews (array with questionText,isCorrect,yourAnswer,correctAnswer,explanation).`;

  const aiPayload = await callOpenAI(prompt);
  if (aiPayload && typeof aiPayload === 'object') {
    return {
      summary: aiPayload.summary || `You scored ${score}/${totalQuestions} on ${quizTitle || 'this quiz'}.`,
      strengths: Array.isArray(aiPayload.strengths) ? aiPayload.strengths : [],
      focusAreas: Array.isArray(aiPayload.focusAreas) ? aiPayload.focusAreas : [],
      questionReviews: Array.isArray(aiPayload.questionReviews) ? aiPayload.questionReviews : [],
      score,
      totalQuestions
    };
  }

  return makeFallbackReview({ quizTitle, questions, answers, score, totalQuestions });
}

module.exports = {
  generateQuestions,
  summarizeAttempt,
  normalizeOptions
};
