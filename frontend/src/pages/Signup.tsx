import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const Role = searchParams.get("role") as "Candidate" | "Recruiter" | "";

  const [form, setform] = useState({
    name: "",
    email: "",
    password: "",
    role: Role ? Role: "",
  });
  useEffect(() => {
    if(Role=="") setform({ name: "", email: "", password: "", role: "" });
  }, [searchParams])

  const [error, seterror] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setform((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      let response = await axios.post(
        "http://127.0.0.1:5000/api/auth/register",
        { ...form }
      );
      console.log(response.data);
      if (form.role == "Recruiter") navigate("/login?role=Recruiter");
      else navigate("/login");
      setform({ name: "", email: "", password: "", role: "" });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message || "error occured");
        seterror(error.response?.data.message || "error occured");
        setform({ name: "", email: "", password: "", role: "" });
      } else {
        console.log("Unexpected error:", error);
        setform({ name: "", email: "", password: "", role: "" });
      }
    }
  };

  return (
    <div className="relative w-[25%] h-[90vh]">
      <div className="relative mt-20 rounded-lg bg-white flex flex-col items-center p-2">
        <div className="mb-10 mt-4 text-2xl font-semibold tracking-wider">
          SignUp
        </div>
        <div className="h-full w-full relative flex flex-col items-center gap-10">
          <form
            action=""
            onSubmit={(e) => handleRegister(e)}
            className="relative w-[80%] flex flex-col gap-4 items-center"
          >
            <select
              name="role"
              value={form.role}
              onChange={(e) =>
                setform((prev) => ({ ...prev, role: e.target.value }))
              }
              required
              className="w-full selectinput-nohover"
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="Candidate">Candidate</option>
              <option value="Recruiter">Recruiter</option>
            </select>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full form-input"
              placeholder="Enter your Name"
            />
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
              <div className="text-red-500 text-sm absolute top-[76%] left-[0]">
                {error}
              </div>
            ) : (
              ""
            )}
            <button
              type="submit"
              className={`${
                form.role === ""
                  ? " bg-gray-800"
                  : form.role == "Candidate"
                  ? "bg-blue-500"
                  : "bg-purple-500"
              } mt-12 w-full  text-white font-medium tracking-wide px-8 py-2.5 rounded-sm cursor-pointer transition-all duration-500 hover:bg-black`}
            >
              {form.role ? `Register as ${form.role}` : "Register"}
            </button>
          </form>
          <div className="mb-4">
            Already have an account?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => {
                form.role === "Recruiter"
                  ? navigate("/login?role=Recruiter")
                  : navigate("/login");
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
