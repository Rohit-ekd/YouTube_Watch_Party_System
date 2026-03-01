import React from "react";

interface LoginProps {
  email: string;
  password: string;
  authError: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onLogin: () => void;
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({
  email,
  password,
  authError,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onSwitchToSignup,
}) => {
  const cardStyle = "relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md text-center";
  const inputStyle = "w-full p-4 mb-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all";
  const buttonStyle = "w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 p-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30";

  return (
    <div className={cardStyle}>
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg">
        🔐
      </div>
      
      <h1 className="text-4xl font-bold mb-2 mt-8 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text">
        Welcome Back
      </h1>
      <p className="text-white/60 mb-8">Sign in to continue</p>

      {authError && (
        <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
          {authError}
        </div>
      )}

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

      <button onClick={onLogin} className={buttonStyle}>
        Sign In 
      </button>

      <p className="text-white/60 mt-6">
        Don't have an account?{" "}
        <button 
          onClick={onSwitchToSignup}
          className="text-pink-400 hover:text-pink-300 font-semibold"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default Login;
