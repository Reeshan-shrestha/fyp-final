const { exec } = require('child_process');
const bcrypt = require('bcryptjs');

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function resetPasswords() {
  try {
    const user1Hash = await generateHash('user123');
    const sellerHash = await generateHash('seller123');
    
    // MongoDB update command for user1
    const user1UpdateCmd = `mongosh --eval 'db.users.updateOne({username:"user1"}, {$set:{password:"${user1Hash}"}})' chainbazzar`;
    
    // MongoDB update command for TechGadgets
    const sellerUpdateCmd = `mongosh --eval 'db.users.updateOne({username:"TechGadgets"}, {$set:{password:"${sellerHash}"}})' chainbazzar`;
    
    console.log('Resetting user1 password...');
    exec(user1UpdateCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error resetting user1 password: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`User1 password reset: ${stdout}`);
      
      // Reset seller password after user1 is done
      console.log('Resetting TechGadgets password...');
      exec(sellerUpdateCmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error resetting TechGadgets password: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`TechGadgets password reset: ${stdout}`);
        console.log('Password reset complete!');
      });
    });
  } catch (error) {
    console.error('Error generating password hashes:', error);
  }
}

// Run the password reset
resetPasswords(); 