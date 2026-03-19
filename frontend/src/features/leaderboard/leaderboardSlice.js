import {createSlice,createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL=`${import.meta.env.VITE_API_URL}/rank/`;

const initialState = {
  leaderboard: [],
  isLoading: false,
  isError: false,
  message: "",
};

export const getLeaderboard=createAsyncThunk("leaderboard/get",async(__,thunkAPI)=>{
    try{
       const response=await axios.get(`${API_URL}leaderboard`);
       return response.data;
    }catch(error){
       const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
})



export const leaderboardSlice=createSlice({
    name:"leaderboard",
    initialState,
    reducers: {
    resetLeaderboard: (state) => {
      state.leaderboard = [];
      state.isLoading = false;
      state.isError = false;
      state.message = "";
    },
  },

  extraReducers:(builder)=>{
    builder
     .addCase(getLeaderboard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaderboard = action.payload;
      })
      .addCase(getLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
})

export const { resetLeaderboard } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;