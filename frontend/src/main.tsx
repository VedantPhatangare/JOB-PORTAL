import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { lazy, Suspense } from "react";

import Home from "./pages/Home";

// import Login from './pages/Login'
// import Signup from "./pages/Signup";
// import RecruiterHome from "./pages/RecruiterHome";
// import JobDescription from "./Components/JobDescription/JobDescription";

// lazy loading components
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const RecruiterHome = lazy(() => import("./pages/RecruiterHome"));
const Applications = lazy(() => import("./pages/Applications"));
const JobDescription = lazy(
  () => import("./Components/JobDescription/JobDescription")
);
import { Provider } from "react-redux";
import store, { persistor } from "./app/Store";
import { PersistGate } from "redux-persist/integration/react";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/recruiterhome",
        element: (
          <Suspense fallback={<div>loading...</div>}>
            <RecruiterHome />
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={<div>loading...</div>}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "/signup",
        element: (
          <Suspense fallback={<div>loading...</div>}>
            <Signup />
          </Suspense>
        ),
      },
      {
        path: "/job/:job_id",
        // loader: Jobloader,
        element: (
          <Suspense fallback={<div>loading...</div>}>
            <JobDescription />
          </Suspense>
        )
      },
      {
        path:"/applicantions/:job_id",
        element:(
          <Suspense>
            <Applications/>
          </Suspense>
        )
      }
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
      <RouterProvider router={Router} />
    </PersistGate>
  </Provider>
);
