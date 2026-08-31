const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    throw { status: response.status, data };
  }

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
};

export const registerUser = (userData) => {
  return apiCall('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const loginUser = (credentials) => {
  return apiCall('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const fetchProgress = () => {
  return apiCall('/progress');
};

export const fetchRoadmap = () => {
  return apiCall('/roadmap');
};

export const regenerateRoadmap = () => {
  return apiCall('/roadmap/regenerate', {
    method: 'POST',
  });
};

export const completeSkill = (skillName, quizScore) => {
  return apiCall('/skills/complete', {
    method: 'POST',
    body: JSON.stringify({ skill: skillName, quiz_score: quizScore }),
  });
};

export const sendChatMessage = (message) => {
  return apiCall('/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
};
