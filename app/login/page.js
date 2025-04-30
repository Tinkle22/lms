/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      console.log("Session in useEffect:", session);
      if (session.user.role === 'SUPER_ADMIN') {
        router.push('/super-dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Attempting login with:", formData.email);
      
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log("Sign in result:", result);

      if (result.error) {
        throw new Error("Invalid email or password");
      }

      // Instead of fetching user data, reload the page to trigger the useEffect
      // This ensures we're using the session data from NextAuth
      window.location.reload();
      
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
      
      {registered && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          School registered successfully! Please login with your administrator account.
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <p>Don't have an account?</p>
          <Link href="/register/school" className="text-blue-600 hover:underline">
            Register your school
          </Link>
        </div>
      </div>
    </div>
  );
}