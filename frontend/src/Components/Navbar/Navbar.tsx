import { IoIosSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../app/Store";
import { logout } from "../../features/Authslice";
import { IoIosPeople } from "react-icons/io";
import React, { useEffect, useRef, useState } from "react";
import { FaAngleRight } from "react-icons/fa";
const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [placeholder, setplaceholder] = useState("openings...");
  const [isTransitioning, setisTransitioning] = useState(false);
  const [searchtext, setsearchtext] = useState("")
  const loginRef = useRef<HTMLDivElement>(null);
  const logoutRef = useRef<HTMLDivElement>(null);
  const placeholders = ["jobs...", "roles...", "openings..."];
  const [loginDropDown, setloginDropDown] = useState(false);
  const [logoutDropDown, setlogoutDropDown] = useState(false);
  const [showBtn, setshowBtn] = useState(false);
  const userInfo = useSelector((state: RootState) => {
    return { isLoggedin: state.auth.isAuthenticated, role: state.auth.role };
  });
  const navRef = useRef<HTMLDivElement>(null)
  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    if(userInfo.role=="Recruiter") navigate("/login?role=Recruiter");else navigate("/login");
  };
  const delayAnim = () => {
    const ref: {refElement:React.RefObject<HTMLDivElement | null>, setFunction:React.Dispatch<React.SetStateAction<boolean>>} = loginRef.current? {refElement:loginRef, setFunction:setloginDropDown}: {refElement:logoutRef, setFunction:setlogoutDropDown} ;
    setTimeout(() => {
      if (ref.refElement.current) ref.refElement.current.classList.remove("slide-up");
      ref.setFunction(false);
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
      const refElement: React.RefObject<HTMLDivElement | null> = loginRef.current? loginRef: logoutRef ;
      const target = e.target as HTMLElement;
      if(refElement == loginRef){
          if (
            refElement.current &&
            !refElement.current.contains(target) &&
            !target.classList.contains("keep-open")
          ) {
            refElement.current.classList.add("slide-up");
            delayAnim();
          }
      }else{
        if (
          refElement.current &&
          !refElement.current.contains(target)
        ) {
          refElement.current.classList.add("slide-right");
          delayAnim();
        }
      }
    };
    document.addEventListener("mousedown", handleHideRef);
    return () => document.removeEventListener("mousedown", handleHideRef);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current){
        if (window.scrollY > 20) {
          const maxsroll = 100;
          const scrollPosition = window.scrollY;
          let brightnessFactor = Math.max(0,1-scrollPosition/maxsroll);
          navRef.current.style.background = `linear-gradient(to bottom, rgba(255, 255, 255, ${brightnessFactor * 0.5}), rgba(255, 255, 255, ${brightnessFactor})) 0% 0% / cover, linear-gradient(to bottom, #bcc3cd, #f3f4f6)`;
          navRef.current.style.opacity = "1";
        } else {
          navRef.current.style.background = "bg-neutral-100";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <nav 
    ref={navRef} 
    className="sticky top-0 h-[8vh] z-30 w-full flex items-center justify-between p-2 transition-all">
      <div
        className="logo w-[15%] text-center p-6 cursor-pointer flex justify-center items-center gap-2"
        onClick={() => {
          navigate("/");
          setshowBtn((prev)=>!prev? !prev: prev);
        }}  
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
          value={searchtext}
          onChange={(e)=>setsearchtext(e.target.value)}
          className={`search_input ${
            searchtext? "": isTransitioning? "fade-out" : "fade-in"
          } `}
        />
      </div>
      <div className="buttons w-[25%]">
        {userInfo.isLoggedin ? (
          <div className="relative flex flex-row gap-8 w-full justify-end items-center">
            {userInfo.role == "Candidate" ? (
              <div></div>
            ) : userInfo.role == "Recruiter" && showBtn==true ? (
              <button
                className="py-2 px-4 h-[95%] rounded-sm flex justify-center items-center text-sm tracking-wide cursor-pointer font-medium transition-all duration-300 hover:bg-black hover:text-white border-none bg-purple-100"
                onClick={() => {
                  navigate("/recruiterhome");
                  setshowBtn(false);
                }}
              >
                Recruiter Home
              </button>
            ) : (
              ""
            )}
            <button
              onClick={() => {
                setlogoutDropDown((prev) => !prev);
                // handleLogout()
              }}
              className={`bg-gray-800 py-1.5 px-4 h-[95%] rounded-sm flex justify-center items-center text-white tracking-wide font-medium cursor-pointer transition-all duration-300 hover:bg-black justify-self-end ${
                logoutDropDown ? "hidden" : "visible"
              }`}
            >
              Logout
            </button>
            {logoutDropDown ? (
              <div 
              ref={logoutRef}
              className="slide-left absolute z-20 bg-gray-800 text-white flex flex-row gap-6 left-0 justify-center items-center rounded-md w-full  transition-all">
                <p className="text-sm font-semibold tracking-wider">Confirm choice</p>
                <div className="flex flex-row gap-6 justify-center items-center rounded-lg py-2">
                  <button 
                  onClick={()=>{
                    setlogoutDropDown(false);
                    handleLogout()}}
                  className="py-1 px-4 tracking-wide rounded-md flex  justify-center items-center text-md hover:text-white text-gray-800 cursor-pointer  bg-white transition-all duration-400 hover:bg-red-700">
                    Logout
                  </button>
                  <button 
                  onClick={()=>{
                      logoutRef.current?.classList.add("slide-right");
                      delayAnim()}
                    }
                  
                  className="bg-blue-500 py-1 px-6 tracking-wide rounded-sm flex justify-center items-center text-white text-md  cursor-pointer  transition-all hover:bg-sky-600">
                    Stay
                  </button>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        ) : (
          <div className="relative flex gap-6 w-full items-center justify-center">
            <button
              onClick={() => navigate("/signup?role=")}
              className="py-1.5 px-3 h-[95%] tracking-wide rounded-sm flex justify-center items-center cursor-pointer text-black font-medium transition-all duration-300"
            >
              SignUp
            </button>
            <button
              onMouseOver={() => setloginDropDown(!loginDropDown)}
              onClick={() => {
                if (!loginDropDown) {
                  setloginDropDown((prev) => !prev);
                } else {
                  if (loginRef.current)
                    loginRef.current.classList.add("slide-up");
                  delayAnim();
                }
              }}
              className="bg-black py-1.5 px-4 tracking-wide rounded-sm flex justify-center items-center gap-2 text-white font-medium cursor-pointer hover:bg-gray-800 transition-color duration-300 keep-open"
            >
              Login{" "}
              <FaAngleRight
                className={`transition-all duration-200 ${
                  loginDropDown ? "rotate-90 " : ""
                }`}
              />
            </button>
            {loginDropDown && (
              <div
                ref={loginRef}
                className={`absolute  flex flex-wrap justify-center items-center gap-2 top-12 left-20 px-4 pb-4 bg-gray-50 py-2 border border-gray-100 slide-down`}
                onMouseLeave={() => {
                  if (loginRef.current)
                    loginRef.current.classList.add("slide-up");
                  delayAnim();
                }}
              >
                <button
                  onClick={() => {
                    navigate("/login?role=Recruiter");
                    if (loginRef.current)
                      loginRef.current.classList.add("slide-up");
                    delayAnim();
                  }}
                  className="py-1.5 px-2 tracking-wide rounded-sm flex justify-center items-center text-md cursor-pointer border border-gray-200  bg-gray-100 transition-all duration-400 hover:bg-gray-800 hover:text-white"
                >
                  Recruiter
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
                  Candidate
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
