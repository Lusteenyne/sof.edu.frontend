import React, { useState } from "react";
import {  Routes, Route } from 'react-router-dom';
import './App.css';

import SignupForm from './components/SignupForm';
import LoginForm from './components/LoginForm';
import SuperAdminSignup from './components/SuperAdminSignup';
import SuperAdminLogin from './components/SuperAdminLogin';
import TeacherLogin from './components/TeacherLogin';
import TeacherSignupForm from "./components/TeacherSignupForm";
import TeacherContainer from "./components/TeacherContainer";
import AdminContainer from "./components/AdminContainer";
import StudentContainer from "./components/StudentContainer";
import StudentPaymentSuccess from "./components/StudentPaymentSuccess";
import NewLanding from "./components/NewLanding";
import StudentForgotPassword from "./components/StudentForgotPassword";
import StudentResetPassword from "./components/StudentResetPassword";
import TeacherForgotPassword from "./components/TeacherForgotPassword";
import TeacherResetPassword from "./components/TeacherResetPassword";
import AdminForgotPassword from "./components/AdminForgotPassword";
import AdminResetPassword from "./components/AdminResetPassword";





const App = () => {
  return (
  <>
      <Routes>
        
        <Route path="/" element={<NewLanding />} />
        <Route path="/signup-student" element={<SignupForm />} />
        <Route path="/login-student" element={<LoginForm />} />
        <Route path="/signup-superadmin" element={<SuperAdminSignup />} />
        <Route path="/login-superadmin" element={<SuperAdminLogin />} />
        <Route path="/login-teacher" element={<TeacherLogin />} />
        <Route path="/signup-teacher" element={<TeacherSignupForm />} />
        <Route path ="/admin-dashboard" element={<AdminContainer/>} />
        <Route path="/teacher-dashboard" element={<TeacherContainer />} />
        <Route path="/student-dashboard" element={<StudentContainer />} />
        <Route path="/payment-success" element={<StudentPaymentSuccess />} />
         <Route path="/student/forgot-password" element={<StudentForgotPassword />} />
         <Route path="/student/reset-password" element={<StudentResetPassword />} />
<Route path="/teacher/forgot-password" element={<TeacherForgotPassword />} />
         <Route path="/teacher/reset-password" element={<TeacherResetPassword />} />
<Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
         <Route path="/admin/reset-password" element={<AdminResetPassword />} />

      </Routes>
   </>
  );
};

export default App;
