import React from "react";

interface SignupProps {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  authError: string;
  onUsernameChange: (username: string) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onSignUp: () => void;
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({
  username,
  email,
  password,
  confirmPassword,
  authError,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSignUp,
  onSwitchToLogin,
}) => {
  const cardStyle = "relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md text-center";
  const inputStyle = "w-full p-4 mb-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all";
  const buttonStyle = "w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 p-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30";

  return (
    <div className={cardStyle}>
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg">
        ✨
      </div>
      
      <h1 className="text-4xl font-bold mb-2 mt-8 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 text-transparent bg-clip-text">
        Create Account
      </h1>
      <p className="text-white/60 mb-8">Join the party!</p>

      {authError && (
        <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
          {authError}
        </div>
      )}

      <input
        className={inputStyle}
        placeholder="Username"
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
      />

      <input
        className={inputStyle}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
      />

      <input
        className={inputStyle}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
      />

      <input
        className={inputStyle}
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => onConfirmPasswordChange(e.target.value)}
      />

      <button onClick={onSignUp} className={buttonStyle}>
        Create Account 
      </button>

      <p className="text-white/60 mt-6">
        Already have an account?{" "}
        <button 
          onClick={onSwitchToLogin}
          className="text-pink-400 hover:text-pink-300 font-semibold"
        >
          Sign In
        </button>
      </p>
    </div>
  );
};

export default Signup;
