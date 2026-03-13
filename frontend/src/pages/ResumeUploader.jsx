import React, { useState } from "react";

function ResumeUploadPage({ user }) {

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = (e) => {
    e.preventDefault();

    if (!file) return;

    setIsUploading(true);

    // simulate upload
    setTimeout(() => {
      setIsUploading(false);
      alert("Resume uploaded successfully!");
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-8 sm:space-y-12 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 sm:pb-8">

        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Resume Interview,{" "}
            <span className="text-teal-600">
              {user?.name?.split(" ")[0]}
            </span>
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-lg font-medium">
            Upload your resume and let AI generate personalized interview questions.
          </p>
        </div>

        <div className="bg-teal-50 px-4 py-2 rounded-2xl border border-teal-100">
          <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">
            AI Powered
          </p>
          <p className="text-xl font-black text-teal-700 leading-none">
            Resume Analysis
          </p>
        </div>

      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-xl sm:shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">

        {/* Card Header */}
        <div className="bg-slate-900 px-6 py-4 sm:px-8 sm:py-6">
          <h2 className="text-lg font-bold text-white flex items-center">
            <span className="bg-teal-500 w-1.5 h-5 rounded-full mr-3"></span>
            Upload Resume
          </h2>
        </div>

        {/* Upload Form */}
        <form
          onSubmit={handleUpload}
          className="p-6 sm:p-8 space-y-6"
        >

          {/* Upload Box */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-4">

            <div className="text-4xl">📄</div>

            <p className="text-slate-700 font-semibold">
              Upload your resume to start a personalized interview
            </p>

            <p className="text-sm text-slate-400">
              Supported formats: PDF, DOCX (Max 5MB)
            </p>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="block mx-auto text-sm text-slate-600
              file:mr-4 file:py-2 file:px-4
              file:rounded-xl file:border-0
              file:text-sm file:font-semibold
              file:bg-teal-50 file:text-teal-700
              hover:file:bg-teal-100"
            />

          </div>

         

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || isUploading}
            className={`w-full h-[48px] rounded-xl font-bold text-white flex items-center justify-center gap-2 ${
              isUploading
                ? "bg-slate-300"
                : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {isUploading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Uploading...
              </>
            ) : (
              <span className="text-sm">
                Analyze Resume & Start Interview
              </span>
            )}
          </button>

        </form>
      </div>

      {/* AI Feature Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 space-y-6">

        <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center">
          <span className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center mr-3">
            🤖
          </span>
          What AI Will Do
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-white p-4 rounded-xl border border-slate-100">
            <h3 className="font-bold text-slate-800">Resume Analysis</h3>
            <p className="text-sm text-slate-500">
              AI scans your resume to identify skills and technologies.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100">
            <h3 className="font-bold text-slate-800">Skill Detection</h3>
            <p className="text-sm text-slate-500">
              Extracts programming languages and frameworks automatically.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100">
            <h3 className="font-bold text-slate-800">Custom Questions</h3>
            <p className="text-sm text-slate-500">
              Generates interview questions based on your resume.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-100">
            <h3 className="font-bold text-slate-800">AI Feedback</h3>
            <p className="text-sm text-slate-500">
              Provides scores, feedback, and ideal answers.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default ResumeUploadPage;