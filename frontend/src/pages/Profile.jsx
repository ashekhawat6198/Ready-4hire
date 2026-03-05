import React from "react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateProfile, reset } from "../features/auth/authSlice.js";

const ROLES = [
  "MERN Stack Developer",
  "Data Scientist",
  "Full Stack Python",
  "Devops Engineer",
];

const inputBase =
  "w-full bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl p-3.5 sm-4 font-semibold text-slate-700 text-base transition-all focus:bg-white focus:border-teal-500 outline-none";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isSuccess, isError, message, isProfileLoading } = useSelector(
    (state) => state.auth,
  );

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    preferredRole: user?.preferredRole || "",
  });

  useEffect(() => {
    if (!isError && !isSuccess) return;
    if (isError) toast.error(message);
    if (isSuccess) toast.success("Profile Updated Successfully");
    dispatch(reset());
  }, [isError, isSuccess, message, dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        preferredRole: user?.preferredRole || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.name === user.name &&
      formData.preferredRole === user.preferredRole
    ) {
      toast.info("No changes to save.");
      return;
    }
    dispatch(updateProfile(formData));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12 pb-24">
      <div
        className="bg-white rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-12
      border border-slate-100"
      >
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Edit Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update your professional details and preferences
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Full Name">
            <input
              type="text"
              className={inputBase}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </FormField>
           <FormField label="Email Address (Fixed)" muted>
            <input
              type="email"
              className=
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </FormField>
        </form>
      </div>
    </div>
  );
};

export default Profile;

function FormField({ label, children, muted }) {
  return (
    <div className={`space-y-1.5 ${muted ? "opacity-60" : ""}`}>
      <label className="ml-1 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectArrow() {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}

function Loader() {
  return (
    <>
      <span className="w-5 border-2 border-slate-400 border-t-transparent animate-spin rounded-full" />
      <span>Saving...</span>
    </>
  );
}
