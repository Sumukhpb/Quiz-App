const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

function normalizeOptions(options) {
  return (options || []).map((option) => {
    if (typeof option === 'string') return { text: option };
    if (option && typeof option === 'object' && typeof option.text === 'string') return { text: option.text };
    return { text: String(option || '') };
  });
}

function extractJson(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();

  const parseCandidate = (candidate) => {
    try {
      return JSON.parse(candidate);
    } catch (err) {
      return null;
    }
  };

  const direct = parseCandidate(trimmed);
  if (direct) return direct;

  const codeFence = trimmed.match(/```(?:json)?\s*([\s\S]*)\s*```$/i);
  if (codeFence && codeFence[1]) {
    const parsed = parseCandidate(codeFence[1].trim());
    if (parsed) return parsed;
  }

  const firstArrayStart = trimmed.indexOf('[');
  const lastArrayEnd = trimmed.lastIndexOf(']');
  if (firstArrayStart !== -1 && lastArrayEnd !== -1 && lastArrayEnd > firstArrayStart) {
    const parsed = parseCandidate(trimmed.slice(firstArrayStart, lastArrayEnd + 1));
    if (parsed) return parsed;
  }

  const firstObjectStart = trimmed.indexOf('{');
  const lastObjectEnd = trimmed.lastIndexOf('}');
  if (firstObjectStart !== -1 && lastObjectEnd !== -1 && lastObjectEnd > firstObjectStart) {
    const parsed = parseCandidate(trimmed.slice(firstObjectStart, lastObjectEnd + 1));
    if (parsed) return parsed;
  }

  return null;
}

function makeFallbackQuestions({ topic, count, difficulty }) {
  const safeTopic = (topic || 'the quiz topic').trim();
  const safeCount = Math.max(1, Math.min(8, Number(count) || 4));
  const safeDifficulty = difficulty || 'medium';
  const baseQuestions = [];
  const templates = [
    `Which statement best summarizes an important point about ${safeTopic}?`,
    `What is a core concept related to ${safeTopic}?`,
    `Which example most clearly illustrates ${safeTopic}?`,
    `What is a common misconception about ${safeTopic}?`,
    `Which phrase best describes the purpose of ${safeTopic}?`,
    `What is an expected result of applying ${safeTopic}?`,
    `Which idea is most closely connected to ${safeTopic}?`,
    `What is the main benefit of understanding ${safeTopic}?`
  ];

  for (let index = 0; index < safeCount; index += 1) {
    const questionText = templates[index % templates.length];
    const options = [
      { text: `A clear concept related to ${safeTopic}` },
      { text: `A common misunderstanding about ${safeTopic}` },
      { text: `An application example of ${safeTopic}` },
      { text: `A follow-up challenge involving ${safeTopic}` }
    ];
    const correctOptionIndex = 0;
    const explanation = `The correct answer is the option that most clearly reflects the main idea of ${safeTopic}.`;
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
        max_tokens: 1200,
        messages: [
          {
            role: 'system',
            content: 'You are a quiz assistant that returns only valid JSON with no surrounding text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI responded with error', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = extractJson(content);
    if (!parsed) {
      console.error('OpenAI returned unparsable JSON:', content);
    }
    return parsed;
  } catch (error) {
    console.error('OpenAI request failed, falling back to heuristic AI.', error.message);
    return null;
  }
}

async function generateQuestions({ topic, count, difficulty }) {
  const requestedCount = Math.max(1, Math.min(8, Number(count) || 4));
  const prompt = `Generate exactly ${requestedCount} unique multiple-choice quiz questions about "${topic || 'the provided topic'}" at ${difficulty || 'medium'} difficulty. Return ONLY valid JSON in this exact format: [{"text": "...", "options": ["...", "...", "...", "..."], "correctOptionIndex": 0, "explanation": "..."}, ...]. Do not include any extra text outside the JSON array.`;

  const aiPayload = await callOpenAI(prompt);
  if (Array.isArray(aiPayload) && aiPayload.length >= requestedCount) {
    return aiPayload.slice(0, requestedCount).map((question) => ({
      text: question.text,
      options: normalizeOptions(question.options),
      correctOptionIndex: Number(question.correctOptionIndex || 0),
      explanation: question.explanation || 'This answer reflects a core concept behind the topic.'
    }));
  }

  return makeFallbackQuestions({ topic, count: requestedCount, difficulty });
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
  const questionsPayload = questions.map((question, index) => ({
    number: index + 1,
    text: question.text,
    options: question.options.map((option, idx) => ({
      index: idx,
      text: option.text
    })),
    correctOptionIndex: question.correctOptionIndex
  }));

  const answersPayload = answers.map((answer) => ({
    questionId: answer.question,
    selectedIndex: answer.selectedIndex,
    isCorrect: answer.isCorrect
  }));

  const prompt = `A student completed a quiz titled "${quizTitle || 'the quiz'}" and scored ${score}/${totalQuestions}. Here are the quiz questions and their options:\n${JSON.stringify(questionsPayload, null, 2)}\nThe student's answers are:\n${JSON.stringify(answersPayload, null, 2)}\nReturn strict JSON with fields: summary, strengths (array of short sentences), focusAreas (array of short sentences), questionReviews (array of objects with questionText, isCorrect, yourAnswer, correctAnswer, explanation).`;

  const aiPayload = await callOpenAI(prompt);
  if (aiPayload && typeof aiPayload === 'object') {
    if (!aiPayload.summary && !aiPayload.questionReviews) {
      console.warn('OpenAI returned no summary or reviews, using fallback.', aiPayload);
    }
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
