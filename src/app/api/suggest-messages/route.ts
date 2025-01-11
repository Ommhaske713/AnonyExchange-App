export const runtime = 'edge';

export async function POST(req:Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const questions = generateQuestions();

    return new Response(JSON.stringify({ text: questions , message:'message generated successfully'}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
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

function generateQuestions() {

  const questionTemplates = [
    "What's something new you've learned recently?",
    "If you could visit any place in the world, where would it be?",
    "What's a movie or book that has inspired you?",
    "If you could master any skill instantly, what would it be?",
    "What's a simple joy in life that you cherish?",
    "If you could live in any historical era, which one would it be?",
    "What's the best advice you've ever received?",
    "If you could have any superpower, what would it be and why?",
    "What's a food or dish you could eat every day?",
    "What's one thing you're grateful for today?",
  ];
const additionalQuestions = [
    "What's your favorite way to relax after a long day?",
    "If you could have any job for a day, what would it be?",
    "What's a goal you're currently working towards?",
    "If you could meet any fictional character, who would it be?",
    "What's a memorable trip you've taken?",
    "If you could change one thing about the world, what would it be?",
    "What's a talent you wish you had?",
    "If you could relive any moment in your life, what would it be?",
    "What's your favorite way to spend a weekend?",
    "If you could have any animal as a pet, what would it be?",
    "What's a hobby you've always wanted to try?",
    "If you could have dinner with any celebrity, who would it be?",
    "What's a book that you couldn't put down?",
    "If you could instantly learn any language, what would it be?",
    "What's a tradition that you cherish?",
    "If you could time travel, where would you go?",
    "What's a song that always makes you happy?",
    "If you could switch lives with anyone for a day, who would it be?",
    "What's a skill you take pride in?",
    "If you could have any piece of art in your home, what would it be?",
    "What's a cause you're passionate about?",
    "If you could invent something, what would it be?",
    "What's a memory that always makes you smile?",
    "If you could play any instrument, what would it be?",
    "What's a challenge you've overcome recently?",
    "What's your favorite childhood memory?",
    "If you could have any fictional creature as a pet, what would it be?",
    "What's a dream you've had that you still remember?",
    "If you could have any view from your window, what would it be?",
    "What's a skill you wish you could teach others?",
    "If you could create a holiday, what would it celebrate?",
    "What's your favorite way to stay active?",
    "If you could have any car, what would it be?",
    "What's a dish you love to cook?",
    "If you could have any piece of technology, what would it be?",
    "What's a book or movie that changed your perspective?",
    "If you could live anywhere in the world, where would it be?",
    "What's a project you're excited about?",
    "If you could have any job in the world, what would it be?",
    "What's a tradition you want to start?",
    "If you could have any view from your home, what would it be?",
];

questionTemplates.push(...additionalQuestions);

  shuffleArray(questionTemplates);

  const selectedQuestions = questionTemplates.slice(0, 3);
  
  return selectedQuestions.join('||');
}

function shuffleArray(array: string[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
