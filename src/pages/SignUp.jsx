import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signUpUser } from "../redux/reducers/authSlice";
import { useNavigate, Link } from "react-router-dom";

function SignUp() {
  const [fullName, setFullName] = useState(""); 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [confirmPassword, setConfirmPassword] = useState(""); 

  const dispatch = useDispatch(); 
  const navigate = useNavigate(); 
  const { loading, error } = useSelector((state) => state.auth); 

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      await dispatch(
        signUpUser({ email, password, name: fullName, role: "attendee" })
      ).unwrap();

      alert("Account created successfully!");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed: " + err);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 px-4 pt-12">
      <div className="flex w-full max-w-5xl shadow-lg rounded-2xl overflow-hidden bg-white">
        {/* Left panel */}
        <div className="hidden md:flex w-1/2 bg-indigo-600 text-white flex-col justify-center p-8">
          <h2 className="text-3xl font-bold mb-3">Join Our Community</h2>
          <p className="text-gray-200 leading-relaxed text-sm">
            Create your attendee account to book events, view your tickets, 
            and enjoy exclusive access. Easy, fast, and secure signup process.
          </p>
        </div>

        {/* Right panel: Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-start">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center md:text-center">
            Create Your Account
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-gray-500 transition"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-gray-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-gray-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-gray-500 transition"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-lg flex items-center justify-center disabled:bg-gray-400 
                         transition transform duration-300 hover:bg-indigo-700 hover:-translate-y-0.5 hover:scale-105"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3.5-3.5-3.5-3.5V4a8 8 0 100 16v-4l-3.5 3.5 3.5 3.5v-4a8 8 0 01-8-8z"
                  ></path>
                </svg>
              ) : null}
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-5 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
