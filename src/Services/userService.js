import axios from 'axios';

// Use CORS proxy
const API_URL = 'https://vmi2493325.contaboserver.net/api/v3/users?pageSize=50';

// Basic Auth credentials
const API_KEY = 'apikey';
const PASSWORD = 'a8aaace68a649dc60b395684b18fa4a313e838bff8e62fb77fcb28a86e2ec4c7';

// Base64 encode "username:password"
const authHeader = 'Basic ' + btoa(`${API_KEY}:${PASSWORD}`);

export const getUsersList = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        //  'X-Requested-With': 'XMLHttpRequest',
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

// export const getUsersList = async () => {
//   try {
//     const response = await axios.get('https://vmi2493325.contaboserver.net/api/v3/users?pageSize=50', {
//       headers: {
//      Authorization: 'Bearer a8aaace68a649dc60b395684b18fa4a313e838bff8e62fb77fcb28a86e2ec4c7'
// }
//     });

//     return response.data?._embedded?.elements || [];

//   } catch (error) {
//     console.error("Status:", error.response?.status);
//     console.error("Data:", error.response?.data);
//     throw error;
//   }
// };


// export const getUsersTask = async (userId) => {
//   const url = `https://vmi2493325.contaboserver.net/api/v3/work_packages?filters=[{"assignee":{"operator":"=","values":["${5}"]}}]`;

//   try {
//     const response = await axios.get(url, {
//       headers: {
//          'X-Requested-With': 'XMLHttpRequest',
//         Authorization: authHeader,
//       },
//     });

//     const data = response.data; // Axios already parses the response
//     return data._embedded?.elements || [];
//   } catch (error) {
//     console.error('❌ Error fetching user tasks:', error.message || error);
//     throw error;
//   }
// };