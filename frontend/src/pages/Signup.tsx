import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') as "Recruiter" | "Candidate";
  const [form, setform] = useState({ name:"", email: "", password: "" });
  const [error, seterror] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setform((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>,role:"Candidate" | "Recruiter") => {
    e.preventDefault();
    try {
      let response = await axios.post(
        "http://127.0.0.1:5000/api/auth/register",
        {...form,role}
      );
      console.log(response.data);
      if(role == "Recruiter") navigate("/login?role=Recruiter");else navigate("/login")
      setform({name:"", email: "", password: "" });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message || "error occured");
        seterror(error.response?.data.message || "error occured");
      } else {
        console.log("Unexpected error:", error);
        setform({ name:"", email: "", password: "" });
      }
    }
  };

  return (
    <div className="relative w-[25%] h-[90vh]">
      <div className="relative mt-20 rounded-xl bg-white flex flex-col items-center p-2">
      <div className="mb-10 mt-4 text-2xl font-semibold tracking-wider">
        SignUp
      </div>
      <div className="h-full w-full relative flex flex-col items-center gap-10">
      <form
        action=""
        onSubmit={(e)=>handleRegister(e,role)}
        className="relative w-[80%] flex flex-col gap-4 items-center">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full outline-none px-2 py-1.5 border rounded-sm border-gray-400"
          placeholder="Enter your Name"
        />
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
          <div className="text-red-500 text-sm absolute top-[76%] left-[0]">{error}</div>
        ) : (
          ""
        )}
        <button
          type="submit"
          className={ `${role==="Recruiter"? " bg-purple-500": "bg-blue-500"} mt-12 w-full  text-white font-semibold px-8 py-2.5 rounded-sm cursor-pointer`}
        >
          Register as {role}
        </button>
      </form>
      <div className="mb-4">
        Already have an account?{" "}
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() =>{
            role==="Recruiter"? navigate("/login?role=Recruiter"): navigate("/login")
          }}
        >
          Login
        </span>
      </div>
      </div>
      
      </div>
    </div>
  );
};

export default Signup;
