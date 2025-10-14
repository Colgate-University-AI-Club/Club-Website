export function extractTags(title: string, content: string): string[] {
  const commonTags = [
    'ai', 'artificial intelligence', 'machine learning', 'deep learning',
    'neural networks', 'llm', 'gpt', 'chatgpt', 'openai', 'anthropic',
    'technology', 'startup', 'research', 'innovation', 'automation',
    'robotics', 'computer vision', 'nlp', 'data science', 'algorithm',
    'blockchain', 'cryptocurrency', 'fintech', 'cybersecurity', 'privacy',
    'ethics', 'regulation', 'policy', 'education', 'healthcare',
    'climate', 'sustainability', 'energy', 'transportation', 'autonomous'
  ];

  const text = `${title} ${content}`.toLowerCase();
  const foundTags = new Set<string>();

  for (const tag of commonTags) {
    if (text.includes(tag.toLowerCase())) {
      foundTags.add(tag);
    }
  }

  // Limit to 5 most relevant tags
  return Array.from(foundTags).slice(0, 5);
}