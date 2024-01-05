// import React, { useState, useEffect } from 'react';

// function UserPage() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // Fetch data from the API
//     fetch('http://localhost:3000/api/user/3')
//       .then(response => response.json())
//       .then(data => setUser(data.user))
//       .catch(error => console.error(error));
//   }, []);

//   return (
//     <div>
//       {user ? (
//         <div>
//           <h2>User Information</h2>
//           <p>Name: {user.name}</p>
//           <p>Email: {user.email}</p>
//           <p>Status: {user.status}</p>
//           <img src={user.image} alt="User Image" />
//         </div>
//       ) : (
//         <p>Loading user data...</p>
//       )}
//     </div>
//   );
// }

// export default UserPage;