import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../features/Authslice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [loader, setloader] = useState<boolean>(false);
  const role = (searchParams.get('role') as "Recruiter" )|| "Candidate";
  const [form, setform] = useState({ email: "", password: "" });
  const [error, seterror] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setform((prev) => ({ ...prev, [name]: value }));
  };

  const handlelogin = async (e: React.FormEvent<HTMLFormElement>,role:"Candidate" | "Recruiter") => {
    e.preventDefault();
    setloader(true);
    try {
      let response = await axios.post(
        "http://127.0.0.1:5000/api/auth/login",
        {...form,role}
      );
      setloader(false);
      console.log(response.data);
      const { token } = response.data;
      localStorage.setItem("token", token);
      if(role=="Candidate"){
        navigate("/");
      }else{
        const {rec_id} = response.data
        navigate(`/recruiterhome?id=${rec_id}`)
      }
      dispatch(login());
      setform({ email: "", password: "" });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message || "error occured");
        seterror(error.response?.data.message || "error occured");
        setloader(false);
      } else {
        console.log("Unexpected error:", error);
        setform({ email: "", password: "" });
        setloader(false);
      }
    }
  };

  return (
    <div className="relative w-full h-[90vh] z-10">
      {
        loader && <div 
        className="absolute z-10 h-full w-full flex justify-center items-center">
          <div className="absolute h-full w-full bg-blue-200 opacity-20"></div>
            <div className="relative z-20 bottom-18 w-14 h-14 border-4 rounded-full border-t-transparent border-b-transparent border-blue-500 animate-spin"></div>
        </div>
      }
    <div className=" h-[64vh] w-[25vw] mt-[10vh] m-auto rounded-xl bg-white shadow-sm hover:shadow-none transition-all flex flex-col items-center p-2">
      
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
          className="w-full form-input"
          placeholder="email"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full form-input"
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
          className={ `${role==="Recruiter"? " bg-purple-500": "bg-blue-500"} w-full  text-white font-semibold tracking-wide px-8 py-2.5 rounded-sm cursor-pointer transition-colors duration-400 hover:bg-black`}
        >
          Login
        </button>
      </form>
      <div className="mb-4">
        Don't have an account?{" "}
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() =>{
            navigate("/signup");
          }}
        >
          SignUp
        </span>
      </div>
      <span>or</span>
    </div>
    </div>
  );
};

export default Login;
