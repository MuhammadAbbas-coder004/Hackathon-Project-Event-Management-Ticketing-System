import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signInUser } from "../redux/reducers/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";

function Login() {
  // State variables for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch(); // Redux dispatch function
  const navigate = useNavigate(); // React Router navigate function
  const { loading, error } = useSelector((state) => state.auth); // Access auth state from Redux

  // Function to handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submit

    try {
      // Dispatch login action from Redux
      const result = await dispatch(signInUser({ email, password }));

      // Check if login was successful
      if (signInUser.fulfilled.match(result)) {
        const user = result.payload;

        // Fetch user role from Firestore
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        let role = "attendee"; // Default role
        if (!querySnapshot.empty) {
          role = querySnapshot.docs[0].data().role; // Get role from Firestore
        }

        // Navigate based on role
        if (role === "organizer") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Split layout: Left info panel and Right form */}
      <div className="flex w-full max-w-5xl shadow-lg rounded-2xl overflow-hidden bg-white">
        {/* Left panel with info */}
        <div className="hidden md:flex w-1/2 bg-indigo-600 text-white flex-col justify-center p-10">
          <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
          <p className="text-gray-200 leading-relaxed">
            Login to your account to view events, book tickets, and manage your attendee profile.
            Secure and fast access for all users.
          </p>
        </div>

        {/* Right panel with form */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Login
          </h2>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                required
              />
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                required
              />
            </div>

            {/* Login button with spinner when loading */}
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
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Link to signup page */}
          <p className="text-center text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-indigo-600 font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
