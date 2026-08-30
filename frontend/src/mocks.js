export const mockTracks = [
  {
    id: 1,
    name: "ML Engineer",
    description: "Learn to build, train, and deploy machine learning models.",
    required_skills: ["Python", "Statistics", "Machine Learning", "Deep Learning", "MLOps"]
  },
  {
    id: 2,
    name: "Backend Developer",
    description: "Master databases, APIs, and scalable architecture.",
    required_skills: ["Python", "Databases", "API Design", "Docker", "System Design"]
  }
];

export const mockUser = {
  id: 1,
  name: "Akanksha",
  email: "akanksha@heisenbugs.com",
  goal_text: "Become an ML Engineer and build AI agents",
  track_id: 1,
  preferred_style: "Interactive",
  hours_per_week: 15,
  skills_progress: [
    { skill_name: "Python", score: 85 },
    { skill_name: "Statistics", score: 60 },
    { skill_name: "Machine Learning", score: 20 },
    { skill_name: "Deep Learning", score: 0 },
    { skill_name: "MLOps", score: 0 }
  ]
};

export const mockLearningPath = [
  {
    id: 101,
    order_index: 1,
    completed_at: "2023-10-01T10:00:00Z",
    skill_name: "Python",
    resource: {
      title: "Advanced Python Decorators",
      platform: "Real Python",
      difficulty: 2,
      duration_hours: 2,
      learning_style: "Reading"
    }
  },
  {
    id: 102,
    order_index: 2,
    completed_at: null,
    skill_name: "Statistics",
    resource: {
      title: "Probability for Machine Learning",
      platform: "Khan Academy",
      difficulty: 3,
      duration_hours: 5,
      learning_style: "Video"
    }
  },
  {
    id: 103,
    order_index: 3,
    completed_at: null,
    skill_name: "Machine Learning",
    resource: {
      title: "Intro to Scikit-Learn",
      platform: "Coursera",
      difficulty: 2,
      duration_hours: 4,
      learning_style: "Interactive"
    }
  }
];

export const mockChatHistory = [
  { sender: 'assistant', text: "Hi Akanksha! I noticed your goal is to become an ML Engineer. Based on your Python proficiency (85%), I've skipped the beginner Python courses." },
  { sender: 'user', text: "Why is 'Probability for Machine Learning' next?" },
  { sender: 'assistant', text: "You need a solid foundation in Statistics before jumping into Machine Learning algorithms. Since your Statistics score is currently 60%, this course bridges the gap effectively!" }
];
