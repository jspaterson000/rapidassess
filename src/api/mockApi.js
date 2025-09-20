import { 
  mockUsers, 
  mockCompanies, 
  mockJobs, 
  mockAssessments, 
  mockComments, 
  mockNotifications,
  mockPdsDocuments 
} from './mockData.js';

// Simple in-memory storage
let currentUser = null;
let users = [...mockUsers];
let companies = [...mockCompanies];
let jobs = [...mockJobs];
let assessments = [...mockAssessments];
let comments = [...mockComments];
let notifications = [...mockNotifications];
let pdsDocuments = [...mockPdsDocuments];

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication
export const auth = {
  async login({ email, password }) {
    await delay(500); // Simulate network delay
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },

  async me() {
    await delay(100);
    if (currentUser) return currentUser;
    
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
    
    throw new Error('Not authenticated');
  },

  async logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
  },

  async updateMyUserData(data) {
    if (!currentUser) throw new Error('Not authenticated');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...data };
      currentUser = users[userIndex];
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    return currentUser;
  }
};

// Generic CRUD operations
const createCrudOperations = (dataArray, name) => ({
  async list(sortField = null) {
    await delay(200);
    let result = [...dataArray];
    if (sortField && sortField.startsWith('-')) {
      const field = sortField.substring(1);
      result.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    }
    return result;
  },

  async get(id) {
    await delay(100);
    const item = dataArray.find(item => item.id === id);
    if (!item) throw new Error(`${name} not found`);
    return item;
  },

  async filter(filters = {}, sortField = null, limit = null) {
    await delay(200);
    let result = dataArray.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'object' && value.$ne) {
          return item[key] !== value.$ne;
        }
        if (typeof value === 'object' && value.$in) {
          return value.$in.includes(item[key]);
        }
        if (typeof value === 'object' && value.$nin) {
          return !value.$nin.includes(item[key]);
        }
        if (typeof value === 'object' && value.$gte && value.$lt) {
          const itemDate = new Date(item[key]);
          return itemDate >= new Date(value.$gte) && itemDate < new Date(value.$lt);
        }
        return item[key] === value;
      });
    });

    if (sortField && sortField.startsWith('-')) {
      const field = sortField.substring(1);
      result.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    }

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  },

  async create(data) {
    await delay(300);
    const newItem = {
      ...data,
      id: generateId(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };
    dataArray.push(newItem);
    return newItem;
  },

  async update(id, data) {
    await delay(200);
    const index = dataArray.findIndex(item => item.id === id);
    if (index === -1) throw new Error(`${name} not found`);
    
    dataArray[index] = {
      ...dataArray[index],
      ...data,
      updated_date: new Date().toISOString()
    };
    return dataArray[index];
  },

  async delete(id) {
    await delay(200);
    const index = dataArray.findIndex(item => item.id === id);
    if (index === -1) throw new Error(`${name} not found`);
    
    const deleted = dataArray.splice(index, 1)[0];
    return deleted;
  }
});

// Export entities
export const User = {
  ...auth,
  ...createCrudOperations(users, 'User')
};

export const Company = createCrudOperations(companies, 'Company');
export const Job = createCrudOperations(jobs, 'Job');
export const Assessment = createCrudOperations(assessments, 'Assessment');
export const Comment = createCrudOperations(comments, 'Comment');
export const Notification = createCrudOperations(notifications, 'Notification');
export const PdsDocument = createCrudOperations(pdsDocuments, 'PdsDocument');

// Mock integrations
export const integrations = {
  Core: {
    async InvokeLLM({ prompt, response_json_schema }) {
      await delay(2000); // Simulate AI processing time
      
      // Return mock responses based on prompt content
      if (prompt.includes('distance') && prompt.includes('travel time')) {
        return {
          distance_km: Math.random() * 50 + 5,
          travel_time_minutes: Math.random() * 60 + 15
        };
      }
      
      if (prompt.includes('policy') || prompt.includes('PDS')) {
        return {
          recommendation: ['proceed', 'additional_info_needed', 'refer_to_insurer'][Math.floor(Math.random() * 3)],
          reasoning: 'Based on policy analysis, this claim appears to meet coverage requirements.',
          confidence_level: 'high',
          pds_citations: [
            {
              clause: 'Section 4.2 - Storm Damage',
              text: 'Coverage includes damage from wind, hail, and falling objects',
              relevance: 'Directly applicable to this storm damage claim'
            }
          ],
          additional_requirements: ['Provide contractor quotes', 'Submit building inspection report']
        };
      }
      
      if (prompt.includes('report') || prompt.includes('assessment')) {
        return {
          executive_summary: 'Property assessment completed with comprehensive damage documentation.',
          claim_details: 'Standard assessment process followed with full documentation.',
          assessment_findings: 'Damage areas identified and photographed with detailed descriptions.',
          damage_analysis: 'Damage consistent with reported cause and covered under policy terms.',
          policy_analysis: 'Claim meets policy requirements for coverage.',
          scope_of_works: 'Repair work outlined with detailed cost estimates.',
          recommendations: 'Proceed with repairs as outlined in scope of works.',
          total_estimate: Math.random() * 10000 + 5000
        };
      }
      
      return { message: 'Mock AI response generated' };
    },

    async UploadFile({ file }) {
      await delay(1000);
      // Create a mock URL for the uploaded file
      const mockUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg`;
      return { file_url: mockUrl };
    },

    async UploadPrivateFile({ file }) {
      await delay(1000);
      return { file_uri: `private://files/${generateId()}-${file.name}` };
    },

    async CreateFileSignedUrl({ file_uri }) {
      await delay(500);
      return { signed_url: `https://example.com/signed/${generateId()}` };
    }
  }
};