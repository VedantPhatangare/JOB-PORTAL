import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../features/Authslice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get('role') as "Recruiter" )|| "Candidate"
  const [form, setform] = useState({ email: "", password: "" });
  const [error, seterror] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setform((prev) => ({ ...prev, [name]: value }));
  };

  const handlelogin = async (e: React.FormEvent<HTMLFormElement>,role:"Candidate" | "Recruiter") => {
    e.preventDefault();
    try {
      let response = await axios.post(
        "http://127.0.0.1:5000/api/auth/login",
        {...form,role}
      );
      console.log(response.data);
      const { token } = response.data;
      localStorage.setItem("token", token);
      navigate("/");
      dispatch(login());
      setform({ email: "", password: "" });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message || "error occured");
        seterror(error.response?.data.message || "error occured");
      } else {
        console.log("Unexpected error:", error);
        setform({ email: "", password: "" });
      }
    }
  };

  return (
    <div className="h-[64vh] w-[25vw] mt-[10vh] rounded-xl bg-white flex flex-col items-center p-2">
      <div className="mb-10 mt-4 text-2xl font-semibold tracking-wider">
        {role =="Recruiter"?"Recruiter Login":"Candidate Login"}
      </div>
      <form
        action=""
        onSubmit={(e)=>handlelogin(e,role)}
        className="relative h-[48%] w-[80%] flex flex-col gap-4 items-center">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full outline-none px-2 py-1.5 border rounded-sm border-gray-400"
          placeholder="email"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full outline-none px-2 py-1.5 border rounded-sm border-gray-400"
          placeholder="password"
        />
        {error ? (
          <div className="text-red-500 text-sm absolute top-[44%] left-[0]">{error}</div>
        ) : (
          ""
        )}
        <span className="self-end mt-3 text-blue-500 cursor-pointer">
          forgot password?
        </span>
        <button
          type="submit"
          className={ `${role==="Recruiter"? " bg-purple-500": "bg-blue-500"} w-full  text-white font-semibold px-8 py-2.5 rounded-sm cursor-pointer`}
        >
          Login
        </button>
      </form>
      <div className="mb-4">
        Don't have an account?{" "}
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() =>{
            role==="Recruiter"? navigate("/signup?role=Recruiter"): navigate("/signup?role=Candidate")
          }}
        >
          SignUp
        </span>
      </div>
      <span>or</span>
    </div>
  );
};

export default Login;
