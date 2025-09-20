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
        // Extract key information from the prompt for more realistic responses
        const eventType = prompt.match(/Event Type: ([^\\n]+)/)?.[1] || 'unknown';
        const damageDesc = prompt.match(/Damage Description: ([^\\n]+)/)?.[1] || 'not provided';
        const causeDesc = prompt.match(/Stated Cause: ([^\\n]+)/)?.[1] || 'not provided';
        const maintenance = prompt.match(/Owner Maintenance Status: ([^\\n]+)/)?.[1] || 'not specified';
        
        // Generate more realistic responses based on the data
        let recommendation = 'proceed';
        let reasoning = '';
        let additionalRequirements = [];
        let confidence = 'high';
        
        // Analyze based on event type and details
        if (eventType.includes('fire')) {
          if (causeDesc.includes('electrical') || causeDesc.includes('faulty')) {
            reasoning = 'Fire damage from electrical fault is covered under Section 2.1 of the policy. The cause appears to be accidental and not due to negligence.';
            additionalRequirements = ['Electrical inspection report', 'Fire brigade report if available'];
          } else if (damageDesc.toLowerCase().includes('test') || causeDesc.toLowerCase().includes('test')) {
            recommendation = 'additional_info_needed';
            reasoning = 'Insufficient information provided in damage and cause descriptions. More detailed assessment required to determine coverage eligibility.';
            additionalRequirements = ['Detailed damage description', 'Clear explanation of cause', 'Supporting photographs', 'Professional assessment if required'];
            confidence = 'low';
          } else {
            reasoning = 'Fire damage is covered under the policy terms. Cause appears to be accidental and within policy coverage.';
          }
        } else if (eventType.includes('storm')) {
          reasoning = 'Storm damage including wind and hail is covered under Section 1.3 of the policy. Weather event is verifiable and damage is consistent with reported cause.';
          if (damageDesc.toLowerCase().includes('test')) {
            recommendation = 'additional_info_needed';
            reasoning = 'Storm damage is generally covered, however insufficient detail provided in damage description requires further assessment.';
            additionalRequirements = ['Detailed damage assessment', 'Weather bureau report for the date', 'Professional contractor quote'];
            confidence = 'medium';
          }
        } else if (eventType.includes('escape_of_liquid')) {
          if (maintenance === 'no' || maintenance === 'partial') {
            recommendation = 'additional_info_needed';
            reasoning = 'Water damage may be covered, however poor maintenance history requires insurer review to determine if damage was preventable.';
            additionalRequirements = ['Maintenance records', 'Plumber inspection report', 'Age and condition assessment of plumbing'];
            confidence = 'medium';
          } else {
            reasoning = 'Escape of liquid damage is covered under Section 1.5. Property appears well-maintained and damage is accidental.';
          }
        } else if (eventType.includes('impact')) {
          reasoning = 'Impact damage from external sources is covered under Section 1.7 of the policy. Damage appears to be from sudden and accidental impact.';
          additionalRequirements = ['Police report if applicable', 'Third party details if available'];
        }
        
        // Handle insufficient information cases
        if (damageDesc.toLowerCase().includes('test') || damageDesc === 'not provided' || 
            causeDesc.toLowerCase().includes('test') || causeDesc === 'not provided') {
          recommendation = 'additional_info_needed';
          reasoning = 'Assessment contains insufficient information to make a coverage determination. Detailed descriptions of damage and cause are required for policy analysis.';
          additionalRequirements = [
            'Comprehensive damage description with specific details',
            'Clear explanation of how the damage occurred',
            'Supporting photographic evidence',
            'Professional assessment if damage is extensive'
          ];
          confidence = 'low';
        }
        
        return {
          recommendation,
          reasoning,
          confidence_level: confidence,
          pds_citations: [
            {
              clause: eventType.includes('storm') ? 'Section 1.3 - Storm Damage' :
                     eventType.includes('fire') ? 'Section 2.1 - Fire Damage' :
                     eventType.includes('escape_of_liquid') ? 'Section 1.5 - Escape of Liquid' :
                     eventType.includes('impact') ? 'Section 1.7 - Impact Damage' :
                     'Section 1.1 - General Coverage',
              text: eventType.includes('storm') ? 'Coverage includes damage from wind, hail, and falling objects during weather events' :
                    eventType.includes('fire') ? 'Coverage includes fire damage from accidental causes, electrical faults, and external ignition' :
                    eventType.includes('escape_of_liquid') ? 'Coverage includes sudden and accidental escape of liquid from fixed pipes and appliances' :
                    eventType.includes('impact') ? 'Coverage includes damage from sudden and accidental impact by external objects' :
                    'General property damage coverage applies to sudden and accidental events',
              relevance: `Directly applicable to this ${eventType.replace('_', ' ')} damage claim`
            }
          ],
          additional_requirements: additionalRequirements
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