import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { lazy, Suspense } from "react";
import { Provider } from "react-redux";
import store, { persistor } from "./app/Store";
import { PersistGate } from "redux-persist/integration/react";

import Jobs from "./pages/Jobs";

// Lazy loaded pages
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const RecruiterHome = lazy(() => import("./pages/RecruiterHome"));
const Applications = lazy(() => import("./pages/Applications"));
const JobDescription = lazy(() => import("./Components/JobDescription/JobDescription"));
const CandidateApplications = lazy(() => import("./pages/CandidateApplications"));
const CandidateProfile = lazy(() => import("./pages/CandidateProfile"));
const RecruiterProfile = lazy(() => import("./pages/RecruiterProfile"));
const SavedJobs = lazy(() => import("./pages/SavedJobs"));

const PageLoader = () => (
  <div className="flex h-[92vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Loading...</p>
    </div>
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

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
        element: withSuspense(RecruiterHome),
      },
      {
        path: "/login",
        element: withSuspense(Login),
      },
      {
        path: "/signup",
        element: withSuspense(Signup),
      },
      {
        path: "/job/:job_id",
        element: withSuspense(JobDescription),
      },
      {
        path: "/applications/:job_id",
        element: withSuspense(Applications),
      },
      {
        path: "/candidate/applied",
        element: withSuspense(CandidateApplications),
      },
      {
        path: "/profile/candidate",
        element: withSuspense(CandidateProfile),
      },
      {
        path: "/profile/recruiter",
        element: withSuspense(RecruiterProfile),
      },
      {
        path: "/jobs/saved",
        element: withSuspense(SavedJobs),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={<PageLoader />} persistor={persistor}>
      <RouterProvider router={Router} />
    </PersistGate>
  </Provider>
);
