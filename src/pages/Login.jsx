import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signInUser } from "../redux/reducers/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig/firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(signInUser({ email, password }));

      if (signInUser.fulfilled.match(result)) {
        const user = result.payload;

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        let role = "attendee";
        if (!querySnapshot.empty) {
          role = querySnapshot.docs[0].data().role;
        }

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
    <div className="min-h-screen flex items-start sm:items-center justify-center bg-gray-50 px-4 py-16 sm:py-20">
      <div className="flex w-full max-w-5xl shadow-lg rounded-2xl overflow-hidden bg-white">
        {/* Left panel */}
        <div className="hidden md:flex w-1/2 bg-indigo-600 text-white flex-col justify-center p-10">
          <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
          <p className="text-gray-200 leading-relaxed">
            Login to your account to view events, book tickets, and manage your attendee profile.
            Secure and fast access for all users.
          </p>
        </div>

        {/* Right panel */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-start">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Login
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-lg flex items-center justify-center
                         disabled:bg-gray-400 transition transform hover:-translate-y-0.5 hover:scale-105 hover:bg-indigo-700 duration-300"
            >
              {loading && (
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
              )}
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-indigo-600 font-medium hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
