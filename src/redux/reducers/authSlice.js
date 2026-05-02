import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig/firebase';

// Async Thunk Sign Up User
export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name, role }, { rejectWithValue }) => {
    try {
      const trimmedEmail = email.trim();
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Add user document in Firestore
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: name,
          role: role || 'attendee',
          createdAt: new Date().toISOString(),
        });
        console.log("User document created in Firestore with role:", role);
      } catch (firestoreError) {
        console.error("Firestore Error during Signup (Document not created):", firestoreError);
        // We still proceed since Firebase Auth was successful
      }

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        role: role || 'attendee'
      };
    } catch (error) {
      console.error("SignUp Auth Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk: Sign In User
export const signInUser = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const trimmedEmail = email.trim();
      // Sign in via Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      
      // Fetch user role from Firestore
      let userRole = 'attendee';
      try {
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          userRole = userDoc.data().role || 'attendee';
        } else {
          console.warn("User document not found in Firestore. Defaulting to 'attendee' role.");
        }
      } catch (firestoreError) {
        console.error("Firestore error during login:", firestoreError);
        // We continue with 'attendee' role if auth was successful
      }

      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || "User",
        role: userCredential.user.email === "mabbas@gmail.com" ? "organizer" : userRole
      };

      console.log("SignIn successful:", userData);
      return userData;
    } catch (error) {
      console.error("SignIn Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Async Thunk: Sign Out User
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      console.log("User logged out");
      return null;
    } catch (error) {
      console.error("Logout Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,             
    isAuthenticated: false, 
    initializing: true,     
    loading: false,         
    error: null,             
  },
  reducers: {
    // Manually set user  used with Firebase onAuthStateChanged
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.initializing = false; 
      state.loading = false;
      console.log("Redux setUser called with:", action.payload);
    },
    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Sign Up cases
    builder
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initializing = false;
        console.log("SignUp Redux state updated:", action.payload);
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Sign In cases
      .addCase(signInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initializing = false;
        console.log("SignIn Redux state updated:", action.payload);
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Logout case
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
