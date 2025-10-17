import React, { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import { DoctorContext } from "../context/DoctorContext";

const Login = () => {
  const [state, setState] = useState("Admin");
  const { setAToken, backendUrl } = useContext(AdminContext);
  const {setDToken} = useContext(DoctorContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === "Admin") {
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, {
          email,
          password,
        });

        if (data.success) {
          setAToken(data.token);
          localStorage.setItem("aToken", data.token); // Optional for persistence
        } else {
          toast.error(data.message);
        }
      } else {
        const {data} = await axios.post(`${backendUrl}/api/doctor/login`, {email, password});

        if (data.success) {
          setDToken(data.token);
          localStorage.setItem("DToken", data.token); // Optional for persistence
          console.log(data.token);
        } else {
          toast.error(data.message);
        }       
      }
    } catch (error) {
        console.error("Error during login:", error); // Log the error for debugging

        toast.error("Something went wrong. Please try again later.");

    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-[#5F6FFF]">{state}</span> Login
        </p>
        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="password"
            required
          />
        </div>

        <button className="bg-[#5F6FFF] text-white w-full py-2 rounded-md text-base">
          Login
        </button>

        <p>
          {state === "Admin" ? "Doctor" : "Admin"} Login{" "}
          <span
            className="text-[#5F6FFF] underline cursor-pointer ml-1"
            onClick={() => setState(state === "Admin" ? "Doctor" : "Admin")}
          >
            Click here
          </span>
        </p>
      </div>
    </form>
  );
};

export default Login;
