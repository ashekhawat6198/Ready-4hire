import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLeaderboard } from "../features/leaderboard/leaderboardSlice";

const Leaderboard = () => {
  const dispatch = useDispatch();

  const { leaderboard, isLoading } = useSelector((state) => state.leaderboard);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getLeaderboard());
  }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center">
          🏆 Leaderboard
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-lg font-medium">
          Top Performers 
        </p>
      </div>

      {/* LEADERBOARD CARD */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
        {/* HEADER BAR */}
        <div className="bg-slate-900 px-6 py-4 sm:px-8 sm:py-6">
          <h2 className="text-lg font-bold text-white flex items-center">
            <span className="bg-teal-500 w-1.5 h-5 rounded-full mr-3"></span>
            Top 10 Candidates
          </h2>
        </div>

        {/* LIST */}
        <div className="divide-y">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-teal-500 rounded-full"></div>
            </div>
          ) : (
            leaderboard.map((u, index) => {
              const isCurrentUser = user._id === u.id;

              return (
                <div
                  key={u._id}
                  className={`flex items-center justify-between px-6  py-4 sm:px-10 sm:py-5 transition 
                   }`}
                >
                  
                  {/* LEFT */}
                  <div className="flex items-center gap-4">
                    {/* RANK */}
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
                      ${
                        index === 0
                          ? "bg-yellow-400 text-white"
                          : index === 1
                            ? "bg-gray-400 text-white"
                            : index === 2
                              ? "bg-orange-400 text-white"
                              : "bg-slate-200 text-slate-700"
                      }
                    `}
                    >
                      {index + 1}
                    </div>

                    {/* NAME */}
                    <div>
                      <p className="font-bold text-slate-800">
                        {u.name} {isCurrentUser && "(You)"}
                      </p>
                     
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-right">
                    <p className="text-lg font-black text-teal-600">
                      {u.leaderboardScore}
                    </p>
                    <p className=" text-slate-400 text-lg font-bold text-teal-500">{u.points} 🪙</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
