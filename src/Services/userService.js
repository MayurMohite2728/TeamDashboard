import axios from 'axios';

// Use CORS proxy
const API_URL = '/api/v3/users?pageSize=50';

// Basic Auth credentials
const API_KEY = 'apikey';
const PASSWORD = '0b78127b3361cb3c7186fdc1b23bc152f905108d70a6c3e65761a86117557a5a';

// Base64 encode "username:password"
const authHeader = 'Basic ' + btoa(`${API_KEY}:${PASSWORD}`);

export const getUsersList = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
         'X-Requested-With': 'XMLHttpRequest',
        Authorization: authHeader,
      },
    });

    // Extract names from the response
    const users = response.data?._embedded?.elements || [];
    //const userNames = users.map(user => user.name);

    //console.log('✅ User names:', userNames);
    return users; 

  } catch (error) {
    console.error('❌ Error fetching users:', error.message || error);
    throw error;
  }
}; 


export const getUsersTask = async (userId) => {
  const url = `https://cors-anywhere.herokuapp.com/http://164.68.99.129/api/v3/work_packages?filters=[{"assignee":{"operator":"=","values":["${5}"]}}]`;

  try {
    const response = await axios.get(url, {
      headers: {
         'X-Requested-With': 'XMLHttpRequest',
        Authorization: authHeader,
      },
    });

    const data = response.data; // Axios already parses the response
    return data._embedded?.elements || [];
  } catch (error) {
    console.error('❌ Error fetching user tasks:', error.message || error);
    throw error;
  }
};