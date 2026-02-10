import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signUpUser } from "../redux/reducers/authSlice";
import { useNavigate, Link } from "react-router-dom";

function SignUp() {
  // State for form inputs
  const [fullName, setFullName] = useState(""); 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [confirmPassword, setConfirmPassword] = useState(""); 

  const dispatch = useDispatch(); // Redux dispatch
  const navigate = useNavigate(); // React Router navigation
  const { loading, error } = useSelector((state) => state.auth); // Redux auth state

  // Handle signup form submission
  const handleSignUp = async (e) => {
    e.preventDefault();

    // Password match check
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Password length check
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      // Dispatch signup action from Redux
      await dispatch(
        signUpUser({ email, password, name: fullName, role: "attendee" })
      ).unwrap();

      alert("Account created successfully!");
      navigate("/login", { replace: true }); // Go to login
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed: " + err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Split layout: Left info panel and Right form */}
      <div className="flex w-full max-w-5xl shadow-lg rounded-2xl overflow-hidden bg-white">
        {/* Left side panel */}
        <div className="hidden md:flex w-1/2 bg-indigo-600 text-white flex-col justify-center p-10">
          <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-gray-200 leading-relaxed">
            Create your attendee account to book events, view your tickets, 
            and enjoy exclusive access. Easy, fast, and secure signup process.
          </p>
        </div>

        {/* Right side: Form */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Sign Up
          </h2>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                minLength={6}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-lg flex items-center justify-center disabled:bg-gray-400 transition-colors duration-300 hover:bg-indigo-700"
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

          {/* Link to login */}
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
