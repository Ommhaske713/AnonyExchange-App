export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    let seed: number;
    try {
      const body = await req.json();
      seed = body.seed || Date.now();
    } catch (e) {
      seed = Date.now();
    }

    const questions = generateQuestions(seed);

    return new Response(
      JSON.stringify({ 
        text: questions, 
        message: 'Message generated successfully',
        seed: seed 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error generating suggestions',
      }),
      { status: 500 }
    );
  }
}

function generateQuestions(seed: number) {
  const questionTemplates = [
    "What's something new you've learned recently?",
    "If you could visit any place in the world, where would it be?",
    "What's a movie or book that has inspired you?",
    "If you could master any skill instantly, what would it be?",
    "What's a simple joy in life that you cherish?",
    "If you could live in any historical era, which one would it be?",
    "What's the best advice you've ever received?",
    "If you could have any superpower, what would it be and why?",

    "Tell me about a moment that changed your perspective on life.",
    "What do you think happens after we die?",
    "How do you define success in your life?",
    "Which controversial opinion do you hold that might surprise people?",
    "When was the last time you did something for the first time?",
    "Who has had the biggest influence on your life and why?",
    "Do you believe in soulmates or is love a choice?",
    "What's a childhood dream you never outgrew?",
    "Have you ever experienced something you couldn't explain?",
    "Where do you see yourself in 10 years?",
    "Why did you choose your current career path?",
    "How different would your life be if you had made one key decision differently?",
    "Can you describe your perfect day from start to finish?",
    "Are you more afraid of failure or success?",
    "What's a song that brings back a specific memory for you?",
    "Which of your personality traits are you most proud of?",
    "Has a stranger ever changed your life?",
    "Would you rather be respected or liked?",
    "Is there something you've dreamed of doing for a long time?",
    "What's a risk you took that you're glad you took?",
    "How do you think your friends would describe you?",
    "What was your favorite childhood toy?",
    "Does your name have a special meaning?",
    "Which historical figure would you want to have dinner with?",
    "What's something you know now that you wish you knew 10 years ago?",
    "Have you ever had a paranormal experience?",
    "Do you believe alien life exists in the universe?",
    "What's your most controversial food opinion?",
    "Which fictional world would you most want to live in?",
    "How do you handle disagreements with people you care about?",
    "What's the most helpful piece of technology in your life?",
    "Would you rather time travel to the past or the future?",
    "What's an unpopular opinion you have about relationships?",
    "Have you ever been told you look like a celebrity? Who was it?",
    "What's something people often misunderstand about you?",
    "Do you believe in fate or do we create our own destiny?",
    "What's the last thing that made you laugh until you cried?",
    "Which app on your phone do you use the most?",
    "What's one thing you refuse to compromise on?",
    "Who knows you better than anyone else?",
    "How different are you from the person you were 5 years ago?",
    "What three things would you bring to a deserted island?",
    "Which subject in school did you find most fascinating?",
    "What's something you wish you could tell your younger self?",
    "Would you rather be exceptionally beautiful or exceptionally intelligent?",
    "What's your favorite scent and what does it remind you of?",
    "How do you recharge after a long day?",
    "What's something you're terrible at but love doing anyway?",
    "Which fictional character do you relate to most?",
    "What's a hill you're willing to die on?",

    "What's a small, everyday habit that has improved your life?",
    "What's something you've changed your mind about recently?",
    "What's a seemingly small decision that ended up changing your life?",
    "If your home was on fire and you could only save three items, what would they be?",
    "What's something you're looking forward to in the coming months?",
    "What was your most embarrassing moment that you can laugh about now?",
    "When was the last time you felt completely out of your depth?",
    "What's something you've been putting off that you know you should do?",
    "What's a seemingly insignificant memory that has stuck with you?",
    "How do you deal with stress or anxiety?",
    "What's a personal rule you never break?",
    "What hobby would you get into if time and money weren't an issue?",
    "What's the most recent thing that made you genuinely happy?",
    "What's a small act of kindness you'll never forget?",
    "What part of your daily routine do you look forward to the most?",
    "If you could instantly become fluent in another language, which would you choose?",
    "What's the best piece of advice you've ignored?",
    "What's something you thought you'd hate but ended up loving?",
    "How do you think your childhood has shaped who you are today?",
    "What's the most valuable thing you own that isn't expensive?",

    "I'm curious about your approach to public speaking. Do you have any tips for someone who's just starting out?",
    "I've been thinking about starting a new hobby. What activity has brought you the most joy outside of work?",
    "I'm interested in your perspective on work-life balance. How do you maintain boundaries between professional and personal time?",
    "I've noticed you seem great at networking. Would you mind sharing how you approach meeting new people in professional settings?",
    "I'm trying to improve my time management skills. What strategies have worked best for you to stay organized and productive?",
    "I'm wondering about your learning process. How do you approach mastering a completely new skill?",
    "I've been struggling with decision-making lately. Do you have a framework or method you use when faced with difficult choices?",
    "I'm curious how you handle criticism. Any advice for someone who takes feedback too personally?",
    "I've been considering a career pivot. What factors did you weigh when making significant professional changes?",
    "I'm interested in your reading habits. What book has influenced your thinking the most recently?",

    "What's one thing about our workplace culture that could be improved?",
    "If you could change one policy anonymously, what would it be?",
    "What's a concern you have that you've been hesitant to share openly?",
    "How would you rate the transparency of leadership on a scale of 1-10, and why?",
    "What's something the team does well that deserves recognition?",
    "What resources or tools would help you be more effective in your role?",
    "Is there something happening in the workplace that leadership might not be aware of?",
    "What's an idea you have that you think might be dismissed if you shared it directly?",
    "How psychologically safe do you feel at work to express your honest opinions?",
    "What's one thing we could do better to support work-life balance?",
    "Is there anyone in the team who deserves special recognition and why?",
    "What aspect of our recent project could have been handled differently?",
    "What's something that frustrates you but you haven't had a chance to address?",
    "How could communication be improved within our team?",
    "What's one change that would make your daily work experience better?",

    "What's the most embarrassing thing you've done while drunk?",
    "Who's your secret celebrity crush that you've never admitted to anyone?",
    "What's the weirdest thing you've ever googled?",
    "Have you ever pretended to know someone famous just to impress others?",
    "What's the worst fashion choice you've ever made that you thought was cool?",
    "Have you ever stalked an ex on social media and accidentally liked their post?",
    "What's your most embarrassing bathroom-related story?",
    "Have you ever sent a spicy text to the wrong person? What happened?",
    "What's the most ridiculous lie you've told to get out of plans?",
    "If your internet search history was made public, what would be the most embarrassing thing people would find?",
    "What's the most awkward date you've ever been on?",
    "Have you ever laughed at a completely inappropriate time? When was it?",
    "What's the weirdest thing you've done when you thought no one was watching?",
    "Have you ever had a wardrobe malfunction in public?",
    "What's your guilty pleasure TV show or movie that you'd be embarrassed if people knew you loved?",
  ];

  seededShuffleArray(questionTemplates, seed);

  return selectDiverseAndNonRepeatingQuestions(questionTemplates, 3).join('||');
}

function selectDiverseAndNonRepeatingQuestions(questions: string[], count: number): string[] {
  const categories: Record<string, string[]> = {};
  
  questions.forEach(question => {
    const pattern = getPattern(question);
    if (!categories[pattern]) {
      categories[pattern] = [];
    }
    categories[pattern].push(question);
  });
  
  const selected: string[] = [];
  const categoryKeys = Object.keys(categories);

  while (selected.length < count && categoryKeys.length > 0) {
    const categoryIndex = selected.length % categoryKeys.length;
    const category = categoryKeys[categoryIndex];

    if (categories[category].length > 0) {
      const question = categories[category].shift()!;
      selected.push(question);
    } else {
      categoryKeys.splice(categoryIndex, 1);
    }
  }

  if (selected.length < count) {
    const remaining = questions.filter(q => !selected.includes(q));
    for (let i = 0; i < remaining.length && selected.length < count; i++) {
      selected.push(remaining[i]);
    }
  }

  return selected;
}

function getPattern(question: string): string {
  if (question.startsWith("What's")) return "whats";
  if (question.startsWith("If you could")) return "ifyoucould";
  if (question.startsWith("Would you rather")) return "wouldyourather";
  if (question.startsWith("Have you ever")) return "haveyouever";
  if (question.startsWith("Do you believe")) return "doyoubelieve";
  if (question.startsWith("Which")) return "which";
  if (question.startsWith("How")) return "how";
  if (question.startsWith("Who")) return "who";
  if (question.startsWith("When")) return "when";
  if (question.startsWith("Where")) return "where";
  if (question.startsWith("Why")) return "why";
  if (question.startsWith("Can")) return "can";
  if (question.startsWith("Are")) return "are";
  if (question.startsWith("Is")) return "is";
  if (question.startsWith("Tell me")) return "tellme";

  return question.split(' ').slice(0, 2).join('').toLowerCase();
}

function seededShuffleArray(array: string[], seed: number): void {
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function shuffleArray(array: string[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}