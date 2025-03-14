import { IoIosSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../app/Store";
import { logout } from "../../features/Authslice";
import { IoIosPeople } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { FaAngleRight } from "react-icons/fa";
const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [placeholder, setplaceholder] = useState("");
  const [isTransitioning, setisTransitioning] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);
  const placeholders = ["jobs...", "roles...", "openings..."];
  const [isOpen, setisOpen] = useState(false);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    navigate("/login");
  };
  const delayAnim = () => {
    setTimeout(() => {
      if (loginRef.current) loginRef.current.classList.remove("slide-up");
      setisOpen(false);
    }, 200);
  };
  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      setisTransitioning(true);
      setTimeout(() => {
        setplaceholder(placeholders[index]);
        index = (index + 1) % placeholders.length;
        setisTransitioning(false);
      }, 300);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleHideRef = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        loginRef.current &&
        !loginRef.current.contains(target) &&
        !target.classList.contains("keep-open")
      ) {
        loginRef.current.classList.add("slide-up");
        delayAnim();
      }
    };
    document.addEventListener("mousedown", handleHideRef);
    return () => document.removeEventListener("mousedown", handleHideRef);
  }, []);
  return (
    <nav className="sticky top-0 h-[8vh] z-30 w-full flex items-center justify-between p-2 border-b-1 border-gray-200 bg-white">
      <div
        className="logo w-[15%] text-center p-6 cursor-pointer flex justify-center items-center gap-2"
        onClick={() => navigate("/")}
      >
        <IoIosPeople className="text-2xl" />
        <p className="text-xl font-semibold tracking-wider">
          Get<span className="text-blue-400">Hire</span>d
        </p>
      </div>
      <div className="flex w-[50%] h-[90%] bg-blue-50 rounded-4xl py-1 px-2">
        <IoIosSearch className="h-full w-[3%]" />
        <input
          type="text"
          placeholder={`Search for ${placeholder}`}
          className={`search_input ${
            isTransitioning ? "fade-out" : "fade-in"
          } `}
        />  
      </div>
      <div className="buttons w-[25%]">
        {isAuthenticated ? (
          <div className="flex w-full justify-end">
            <button
              onClick={handleLogout}
              className="bg-gray-800 py-1.5 px-4 h-[95%] rounded-sm flex justify-center items-center text-white font-medium tracking-wide cursor-pointer transition-colors duration-300 hover:bg-black justify-self-end"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="relative flex gap-6 w-full items-center justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="py-1.5 px-3 h-[95%] tracking-wide rounded-sm flex justify-center items-center cursor-pointer text-black font-medium transition-all duration-300"
            >
              SignUp
            </button>
            <button
              onClick={() => {
                if (!isOpen) {
                  setisOpen((prev) => !prev);
                } else {
                  if (loginRef.current)
                    loginRef.current.classList.add("slide-up");
                  setTimeout(() => {
                    setisOpen(false);
                    if (loginRef.current) loginRef.current.classList.remove("slide-up");
                  }, 200);
                }
              }}
              className="bg-black py-1.5 px-4 tracking-wide rounded-sm flex justify-center items-center gap-2 text-white font-medium cursor-pointer hover:bg-gray-800 transition-color duration-300 keep-open"
            >
              Login <FaAngleRight 
              className="transition-all"
              />
            </button>
            {isOpen && (
              <div
                ref={loginRef}
                className={`absolute  flex flex-wrap justify-center items-center gap-2 top-12 left-20 p-1 bg-white py-2 border border-gray-100 $ slide-down`}
              >
                <button
                  onClick={() => {
                    navigate("/login?role=Recruiter");
                    if (loginRef.current)
                      loginRef.current.classList.add("slide-up");
                    delayAnim();
                  }}
                  className="py-1.5 px-2 tracking-wide rounded-sm flex justify-center items-center text-md cursor-pointer border border-gray-400 transition-all duration-400 hover:bg-gray-800 hover:text-white"
                >
                  as Recruiter
                </button>
                <button
                  onClick={() => {
                    navigate("/login");
                    if (loginRef.current)
                      loginRef.current.classList.add("slide-up");
                    delayAnim();
                  }}
                  className="bg-black py-1.5 px-2 tracking-wide rounded-sm flex justify-center items-center text-white text-md cursor-pointer hover:bg-gray-800 transition-color duration-300"
                >
                  as Candidate
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
