import { IoIosSearch } from "react-icons/io";
import "./Navstyles.css";
import { useNavigate } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { RootState } from "../../app/Store";
import { logout } from "../../features/Authslice";
const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const CandidateNav = () => {
    navigate("/login");
  };
  const RecruiterNav = () => {
    navigate("/login?role=Recruiter");
  };
  const handleLogout = () => {
    localStorage.removeItem('token')
    dispatch(logout());
    navigate("/login");
  };
  return (
    <div className="sticky top-0 h-[8vh] z-20 w-full flex bg-white items-center justify-between p-2">
      <div className="logo w-[15%] text-center p-6 cursor-pointer" onClick={()=>navigate("/")}>
        <img src="/portaLogo.png" alt="logo" />
      </div>
      <div className="flex w-[50%] bg-white h-[90%] border border-gray-400 rounded-sm py-1 px-2">
        <IoIosSearch className="h-full w-[3%]" />
        <input
          type="text"
          className=" h-full w-[97%] outline-none text-xl p-2"
        />
      </div>
      <div className="buttons w-[25%] h-[80%] justify-center items-center flex flex-col">
        {isAuthenticated ? (
          <div className="place-self-end">
            <button
              onClick={handleLogout}
              className="bg-red-500 py-1 px-2 h-[95%] rounded-sm flex justify-center items-center text-amber-50 cursor-pointer"
            >
              logout
            </button>
          </div>
        ) : (
          <div className="flex gap-8 w-full h-full">
            <button
              onClick={CandidateNav}
              className="bg-blue-500 py-1 px-2 h-[95%] rounded-sm flex justify-center items-center text-amber-50 cursor-pointer"
            >
              Candidates login
            </button>
            <button
            onClick={RecruiterNav} 
            className="bg-purple-500 py-1 px-2  h-[95%] rounded-sm flex justify-center items-center text-amber-50 cursor-pointer">
              Recruiters login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
