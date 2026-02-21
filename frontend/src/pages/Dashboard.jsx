import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  reset,
  createSession,
  getSessions,
  deleteSession,
} from "../features/sessions/sessionSlice.js";
import { toast } from "react-toastify";

const ROLES = [
  "MERN Stack Developer",
  "Data Scientist",
  "Full Stack Python",
  "DevOps Engineer",
];
const LEVELS = ["Junior", "Mid-Level", "Senior"];
const TYPES = [
  { label: "Oral only", value: "oral-only" },
  { label: "Coding Mix", value: "coding-mix" },
];
const COUNTS = [5, 10, 15];

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { sessions, isLoading, isGenerating, isError, message } = useSelector(
    (state) => state.sessions,
  );
  const isProcessing = isGenerating || isLoading;
  const [formData, setFormData] = useState({
    role: user.preferredRole || ROLES[0],
    level: LEVELS[0],
    interviewType: TYPES[1].value,
    count: COUNTS[0],
  });

  useEffect(() => {
    dispatch(getSessions(user._id));
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: [e.target.value],
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(createSession(formData));
  };

  const viewSession = (session) => {
    if (session.status === "completed") {
      navigate(`/review/${session._id}`);
    } else {
      navigate(`/interview/${session._id}`);
    }
  };

  const handleDelete = (e, sessionId) => {
    e.stopPropogation();
    if (window.confirm("Are you want to delete this session")) {
      dispatch(deleteSession(sessionId));
      toast.error("Session Deleted");
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12
    animate-in duration-700"
    >
      <div
        className="felx flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200
    pb-6 sm:pb-8 "
      >
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Welcome, <span className="text-teal-600">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-lg font-medium">Ready for your technical prep?</p>
        </div>
        <div className="flex items-center gap-3 ">
          <div className="bg-teal-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl
          sm:rounded-2xl border border-teal-100 flex sm:block items-center gap-2">
            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">
              Total Sessions
            </p>
            <p className="text-xl sm:text-2xl font-black text-teal-700 leading-none">{sessions.length}</p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
