const { exec } = require('child_process');
const bcrypt = require('bcryptjs');

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function resetAllPasswords() {
  try {
    // Generate password hashes
    const adminHash = await generateHash('admin123');
    const userHash = await generateHash('user123');
    const sellerHash = await generateHash('seller123');
    
    // Reset passwords for admin accounts
    console.log('Resetting admin passwords...');
    exec(`mongosh --eval 'db.users.updateMany({role:"admin"}, {$set:{password:"${adminHash}"}})' chainbazzar`, 
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error resetting admin passwords: ${error.message}`);
          return;
        }
        console.log(`Admin passwords reset: ${stdout}`);
        
        // Reset passwords for user accounts
        console.log('Resetting user passwords...');
        exec(`mongosh --eval 'db.users.updateMany({role:"user"}, {$set:{password:"${userHash}"}})' chainbazzar`, 
          (error, stdout, stderr) => {
            if (error) {
              console.error(`Error resetting user passwords: ${error.message}`);
              return;
            }
            console.log(`User passwords reset: ${stdout}`);
            
            // Reset passwords for seller accounts
            console.log('Resetting seller passwords...');
            exec(`mongosh --eval 'db.users.updateMany({role:"seller"}, {$set:{password:"${sellerHash}"}})' chainbazzar`, 
              (error, stdout, stderr) => {
                if (error) {
                  console.error(`Error resetting seller passwords: ${error.message}`);
                  return;
                }
                console.log(`Seller passwords reset: ${stdout}`);
                console.log('\nPassword reset summary:');
                console.log('- Admin accounts: password is now "admin123"');
                console.log('- User accounts: password is now "user123"');
                console.log('- Seller accounts: password is now "seller123"');
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error generating password hashes:', error);
  }
}

// Run the password reset
resetAllPasswords(); 