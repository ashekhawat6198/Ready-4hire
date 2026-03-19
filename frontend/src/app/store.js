import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import sessionReducer from '../features/sessions/sessionSlice';
import leaderboardReducer from "../features/leaderboard/leaderboardSlice"
const store=configureStore({
    reducer: {
        auth: authReducer,
        sessions: sessionReducer,
        leaderboard:leaderboardReducer
    },
    devTools:true,
});

export default store