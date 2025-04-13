// This script adds an admin user directly to the frontend localStorage authentication
// No need for backend connection

// Execute this code in the browser console 
// or save it as a standalone HTML file that you can open in the browser
// We'll simulate it here by creating console output

console.log("Creating admin user for ChainBazzar frontend...");

// Admin user data for localStorage
const adminData = {
  id: 'admin_' + Math.random().toString(36).substring(2, 15),
  username: 'Reeshan',
  displayName: 'Reeshan',
  email: 'reeshan@admin.com',
  password: 'Reeshan@1', // In localStorage, password is stored in plain text
  registeredAt: new Date().toISOString(),
  isAdmin: true // Add admin flag
};

// Function to simulate adding user to localStorage
function setupAdmin() {
  // Get existing registered users or create empty array
  let registeredUsers = [];
  const existingUsers = localStorage.getItem('chainbazzar_registered_users');
  
  if (existingUsers) {
    try {
      registeredUsers = JSON.parse(existingUsers);
      console.log(`Found ${registeredUsers.length} existing users`);
    } catch (e) {
      console.error("Error parsing existing users, starting fresh:", e);
    }
  }
  
  // Remove any existing user with the same username
  registeredUsers = registeredUsers.filter(user => user.username !== adminData.username);
  console.log("Removed any existing users with the same username");
  
  // Add admin user to registered users
  registeredUsers.push(adminData);
  
  // Save back to localStorage
  localStorage.setItem('chainbazzar_registered_users', JSON.stringify(registeredUsers));
  console.log("Added admin user to registered users");
  
  // Also create a user session (optional, auto-logs in the admin)
  const userSession = {
    id: adminData.id,
    username: adminData.username,
    displayName: adminData.displayName,
    email: adminData.email,
    isAdmin: true
  };
  
  localStorage.setItem('chainbazzar_user', JSON.stringify(userSession));
  console.log("Created user session for admin");
  
  console.log("Admin user setup complete! You can now log in with:");
  console.log("Username:", adminData.username);
  console.log("Password:", adminData.password);
}

// Instructions for the user
console.log(`
INSTRUCTIONS:
1. Open your browser and go to http://localhost:3000 (your ChainBazzar app)
2. Open the browser's developer console (Press F12 or right-click > Inspect > Console)
3. Copy and paste the following code into the console and press Enter:

// ==== START CODE TO COPY ====
const adminData = {
  id: 'admin_${Math.random().toString(36).substring(2, 15)}',
  username: 'Reeshan',
  displayName: 'Reeshan',
  email: 'reeshan@admin.com',
  password: 'Reeshan@1',
  registeredAt: '${new Date().toISOString()}',
  isAdmin: true
};

// Get existing registered users or create empty array
let registeredUsers = [];
const existingUsers = localStorage.getItem('chainbazzar_registered_users');

if (existingUsers) {
  try {
    registeredUsers = JSON.parse(existingUsers);
    console.log('Found ' + registeredUsers.length + ' existing users');
  } catch (e) {
    console.error("Error parsing existing users, starting fresh:", e);
  }
}

// Remove any existing user with the same username
registeredUsers = registeredUsers.filter(user => user.username !== adminData.username);
console.log("Removed any existing users with the same username");

// Add admin user to registered users
registeredUsers.push(adminData);

// Save back to localStorage
localStorage.setItem('chainbazzar_registered_users', JSON.stringify(registeredUsers));
console.log("Added admin user to registered users");

console.log("Admin user setup complete! You can now log in with:");
console.log("Username: Reeshan");
console.log("Password: Reeshan@1");
// ==== END CODE TO COPY ====

4. Refresh the page
5. Log in with:
   - Username: Reeshan
   - Password: Reeshan@1
`); 