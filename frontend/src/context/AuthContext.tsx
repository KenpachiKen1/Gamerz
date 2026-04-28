import { createContext, useContext, useEffect, useState} from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import { auth } from "./firebase"


type SignupForm = {
    email: string,
    username: string,
    password: string,
    first_name: string,
    last_name: string
}


type LoginResponse = unknown;
type SignupResponse = unknown;

type AuthContextType = {
  firebaseUser: User | null;
  loading: boolean;
  authError: string | null;
  isAuthenticated: boolean;
  signup: (formData: SignupForm) => Promise<SignupResponse>;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [authError, setAuthError] = useState<string | null>(null);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setFirebaseUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, [])


    //gets a jwt token telling the backend who the user is.
    async function getToken(): Promise<string | null> {
        if (!auth.currentUser) {
            return null;
        }
        return await auth.currentUser.getIdToken();
    }

    async function signup(formData: SignupForm): Promise<SignupResponse>{


        console.log("1")
      try { 
          
            console.log("2");

            setAuthError(null);
        const { email, password, username, first_name, last_name } = formData
        
                console.log(`${email}, ${username}, ${password}`);

            
            const credentials = await createUserWithEmailAndPassword(auth, email, password); //creating the firebase id for the user.
            console.log('created auth credentials')
            const token = await credentials.user.getIdToken();
        
            console.log(token); //for backend testing

            const response = await fetch(
              "gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/users/signup/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  email,
                  password,
                  username,
                  first_name,
                  last_name,
                }),
              }
            );

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Signup Failed")
            }

            return data
        } catch (err) {
            console.error("Firebase signup error:", err);

            const message =
              err instanceof Error ? err.message : "An unknown error happened.";

            setAuthError(message);
            throw err;
        }
    }

    async function login(email: string, password: string): Promise<LoginResponse> {
        
        try {
            setAuthError(null);

            const userCredentials = await signInWithEmailAndPassword(auth, email, password)

            const token = await userCredentials.user.getIdToken();


            const response = await fetch(
              "gamerz-backend-g4ctbqh9dwbxc3fd.eastus2-01.azurewebsites.net/api/users/login/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Login failed")
            }

            return data

        } catch (err) {
             const message =
               err instanceof Error
                 ? err.message
                 : "An unknown login error occurred";
             setAuthError(message);
             throw err;

        }
        
    } 

    async function logout(): Promise<void> {
      try {
        setAuthError(null);
        await signOut(auth);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "An unknown logout error occurred";
        setAuthError(message);
        throw err;
      }
    }

      const value: AuthContextType = {
        firebaseUser,
        loading,
        authError,
        isAuthenticated: !!firebaseUser,
        signup,
        login,
        logout,
        getToken,
      };

    
    return <AuthContext.Provider value = { value }> { children } </AuthContext.Provider>;
    

}


export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}

