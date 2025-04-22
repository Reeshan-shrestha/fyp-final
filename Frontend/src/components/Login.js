const SellerAccountSection = () => {
  const handleSellerAccountClick = (username) => {
    // Find the username and password fields
    const usernameField = document.getElementById('username') || document.querySelector('input[name="username"]');
    const passwordField = document.getElementById('password') || document.querySelector('input[name="password"]');
    
    if (usernameField) {
      usernameField.value = username;
    }
    
    if (passwordField) {
      passwordField.value = 'seller123';
    }
  };
  
  return (
    <div className="seller-accounts-section">
      <h3>Test Seller Accounts</h3>
      <p>All test accounts use password: <strong>seller123</strong></p>
      <div className="seller-account-list">
        <button onClick={() => handleSellerAccountClick('TechVision')} className="seller-account-button">
          TechVision
        </button>
        <button onClick={() => handleSellerAccountClick('SportStyle')} className="seller-account-button">
          SportStyle
        </button>
        <button onClick={() => handleSellerAccountClick('GourmetDelights')} className="seller-account-button">
          GourmetDelights
        </button>
        <button onClick={() => handleSellerAccountClick('FashionFusion')} className="seller-account-button">
          FashionFusion
        </button>
        <button onClick={() => handleSellerAccountClick('SmartHome')} className="seller-account-button">
          SmartHome
        </button>
      </div>
    </div>
  );
}; 