import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { lazy, Suspense } from "react";

import Jobs from "./pages/Jobs";

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
const CandidateApplications = lazy(() => import("./pages/CandidateApplications"));
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
        element: <Jobs />,
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
        path: "/applications/:job_id",
        element: (
          <Suspense fallback={<div>loading...</div>}>
            <Applications />
          </Suspense>
        ),
      },
      {
        path: "/candidate/applied",
        element: (
          <Suspense fallback={<div>loading...</div>}>
            <CandidateApplications />
          </Suspense>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
      <RouterProvider router={Router} />
    </PersistGate>
  </Provider>
);
