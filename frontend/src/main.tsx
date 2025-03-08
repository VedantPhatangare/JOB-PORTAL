import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import { Provider } from 'react-redux'
import store, { persistor } from './app/Store'
import JobDescription from './Components/JobDescription/JobDescription'
import { PersistGate } from 'redux-persist/integration/react'

const Router  = createBrowserRouter([
    {
      path:"/",
      element:<App/>,
      children:[
        {
          path:'/',
          element:<Home/>
        }
        ,
        {
          path:"/login",
          element:<Login/>
        },
        {
          path:"/signup",
          element:<Signup/>
        },
        {
          path:"/job/:job_id",
          // loader: Jobloader,
          element:<JobDescription/>
        }
      ]
    }
])


createRoot(document.getElementById('root')!).render(
  <Provider store = {store}>
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
    <RouterProvider router={Router}/>
    </PersistGate>
  </Provider>
)
