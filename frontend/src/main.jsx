import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import store from './store';
import { Provider } from 'react-redux';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import LoginScreen from './screens/LoginScreen.jsx';
import RegisterScreen from './screens/RegisterScreen.jsx';
import UploadScreen from './screens/UploadScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import GeminiScreen from './screens/GeminiScreen.jsx';  
import CloudinaryScreen from './screens/CloudinaryScreen.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index={true} element={<HomeScreen />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      <Route path='/upload' element={<UploadScreen />} />
      <Route path='/gemini' element={<GeminiScreen />} /> 
      <Route path='/cloudinary' element={<CloudinaryScreen />} />
      {/* Private Route Wrapper */}
      <Route element={<PrivateRoute />}>
        <Route path='/profile' element={<ProfileScreen />} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </Provider>
);
