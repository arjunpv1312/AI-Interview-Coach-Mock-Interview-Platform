import { Question } from './types';

export const mockQuestions: Question[] = [
  { id: 'q1', text: 'Reverse a linked list.', company: 'Google', role: 'Software Engineer', difficulty: 'Easy', category: 'Technical', timesAsked: 154 },
  { id: 'q2', text: 'Design a scalable chat application.', company: 'Meta', role: 'Software Engineer', difficulty: 'Hard', category: 'System Design', timesAsked: 89 },
  { id: 'q3', text: 'Tell me about a time you had a conflict with a team member.', company: 'Amazon', role: 'Product Manager', difficulty: 'Medium', category: 'Behavioural', timesAsked: 210 },
  { id: 'q4', text: 'Implement an LRU Cache.', company: 'Microsoft', role: 'Software Engineer', difficulty: 'Medium', category: 'Technical', timesAsked: 320 },
  { id: 'q5', text: 'How would you measure the success of a new feature?', company: 'Google', role: 'Data Scientist', difficulty: 'Medium', category: 'Technical', timesAsked: 65 },
  
  // Industrial questions
  { id: 'q6', text: 'Design a rate limiter for a production API API.', company: 'Stripe', role: 'Backend Developer', difficulty: 'Hard', category: 'System Design', timesAsked: 400 },
  { id: 'q7', text: 'Explain the difference between process and thread.', company: 'Oracle', role: 'Software Engineer', difficulty: 'Easy', category: 'Technical', timesAsked: 950 },
  { id: 'q8', text: 'What is CORS and how does it work?', company: 'Airbnb', role: 'Frontend Developer', difficulty: 'Medium', category: 'Technical', timesAsked: 180 },
  { id: 'q9', text: 'Find the maximum subarray sum (Kadanes Algorithm).', company: 'Apple', role: 'Software Engineer', difficulty: 'Medium', category: 'Technical', timesAsked: 220 },
  { id: 'q10', text: 'Tell me about a time you failed and what you learned.', company: 'Netflix', role: 'Engineering Manager', difficulty: 'Medium', category: 'Behavioural', timesAsked: 150 },
  { id: 'q11', text: 'Design a distributed key-value store.', company: 'Amazon', role: 'Cloud Architect', difficulty: 'Hard', category: 'System Design', timesAsked: 310 },
  { id: 'q12', text: 'What is a Virtual DOM and why is it useful?', company: 'Meta', role: 'Frontend Developer', difficulty: 'Easy', category: 'Technical', timesAsked: 450 },
  { id: 'q13', text: 'Write an SQL query to find the second highest salary.', company: 'IBM', role: 'Database Administrator', difficulty: 'Medium', category: 'Technical', timesAsked: 800 },
  { id: 'q14', text: 'How do you handle class imbalance in a dataset?', company: 'OpenAI', role: 'Machine Learning Engineer', difficulty: 'Medium', category: 'Technical', timesAsked: 95 },
  { id: 'q15', text: 'Design the architecture of Netflix.', company: 'Netflix', role: 'Backend Developer', difficulty: 'Hard', category: 'System Design', timesAsked: 520 },
  { id: 'q16', text: 'What are solid principles?', company: 'Salesforce', role: 'Software Engineer', difficulty: 'Medium', category: 'Technical', timesAsked: 630 },
  { id: 'q17', text: 'Explain CI/CD pipelines.', company: 'Atlassian', role: 'DevOps Engineer', difficulty: 'Medium', category: 'Technical', timesAsked: 210 },
  { id: 'q18', text: 'How do you prioritize the product roadmap?', company: 'Uber', role: 'Product Manager', difficulty: 'Hard', category: 'Behavioural', timesAsked: 120 },
  { id: 'q19', text: 'Explain the Transformer architecture used in LLMs.', company: 'OpenAI', role: 'AI Engineer', difficulty: 'Hard', category: 'Technical', timesAsked: 140 },
  { id: 'q20', text: 'Describe a complex problem you solved systematically.', company: 'Tesla', role: 'Software Engineer', difficulty: 'Hard', category: 'Behavioural', timesAsked: 85 }
];

export const COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix',
  'Zoho', 'OpenAI', 'Stripe', 'Airbnb', 'Uber', 'Spotify',
  'Tesla', 'Salesforce', 'IBM', 'Oracle', 'Intel', 'Atlassian'
];

export const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Mobile Developer', 'Data Scientist',
  'Data Analyst', 'Machine Learning Engineer', 'AI Engineer',
  'Product Manager', 'UX/UI Designer', 'DevOps Engineer',
  'Site Reliability Engineer', 'Cloud Architect', 'Security Engineer',
  'QA Engineer', 'Database Administrator', 'Engineering Manager'
];
