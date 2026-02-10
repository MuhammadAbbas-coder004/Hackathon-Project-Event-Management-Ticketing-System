import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { signInUser } from "../redux/reducers/authSlice";
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
    e.preventDefault(); // Prevent default form submission

    try {
      // Dispatch login action from Redux
      const result = await dispatch(signInUser({ email, password }));

      // Check if login was successful
      if (signInUser.fulfilled.match(result)) {
        const user = result.payload;

        // Fetch the user's role from Firestore
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        let role = "attendee"; // Default role
        if (!querySnapshot.empty) {
          // If user exists in Firestore, get role
          role = querySnapshot.docs[0].data().role; 
        }

        // Redirect based on user role
        if (role === "organizer") {
          navigate("/dashboard", { replace: true }); // Organizer goes to dashboard
        } else {
          navigate("/", { replace: true }); // Attendee goes to homepage
        }
      }
    } catch (err) {
      console.error("Login error:", err); // Log any login errors
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 to-purple-100 px-4">
      {/* Card container */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 tracking-wide">
          Welcome Back
        </h2>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email input */}
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password input */}
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Display error message if login fails */}
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          {/* Login button with spinner when loading */}
          <button
            type="submit"
            disabled={loading} // Disable button while loading
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-lg disabled:bg-gray-400 hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center"
          >
            {loading ? (
              // Spinner SVG shown when loading
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
        <p className="text-center mt-6 text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-indigo-600 font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
