import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Redirect logged-in users away from login/signup
  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      let response;

      if (state === "Sign Up") {
        response = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email: cleanEmail,
          password,
        });
      } else {
        response = await axios.post(`${backendUrl}/api/user/login`, {
          email: cleanEmail,
          password,
        });
      }

      const data = response.data;

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        toast.success(`Welcome ${state === "Sign Up" ? "aboard!" : "back!"}`);
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-[80vh] flex items-center justify-center bg-gray-50"
    >
      <div className="flex flex-col gap-3 items-start p-8 w-[90%] sm:w-96 border border-gray-200 rounded-xl text-zinc-700 text-sm shadow-md bg-white">
        <h2 className="text-2xl font-semibold">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className="text-gray-500 mb-3">
          Please {state === "Sign Up" ? "sign up" : "log in"} to book
          appointments
        </p>

        {state === "Sign Up" && (
          <div className="w-full">
            <label className="block font-medium">Full Name</label>
            <input
              className="border border-gray-300 rounded w-full p-2 mt-1 focus:outline-primary"
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
        )}

        <div className="w-full">
          <label className="block font-medium">Email</label>
          <input
            className="border border-gray-300 rounded w-full p-2 mt-1 focus:outline-primary"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        <div className="w-full relative">
          <label className="block font-medium">Password</label>
          <input
            className="border border-gray-300 rounded w-full p-2 mt-1 focus:outline-primary pr-10"
            type={showPassword ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-9 text-gray-500 cursor-pointer select-none"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md text-base text-white transition-all duration-300 ${
            loading
              ? "bg-primary/70 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {loading
            ? "Please wait..."
            : state === "Sign Up"
            ? "Create Account"
            : "Login"}
        </button>

        <p className="text-gray-600 text-sm mt-2">
          {state === "Sign Up" ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-primary font-medium cursor-pointer hover:underline"
              >
                Login here
              </span>
            </>
          ) : (
            <>
              Create a new account?{" "}
              <span
                onClick={() => setState("Sign Up")}
                className="text-primary font-medium cursor-pointer hover:underline"
              >
                Click here
              </span>
            </>
          )}
        </p>
      </div>
    </form>
  );
};

export default Login;
