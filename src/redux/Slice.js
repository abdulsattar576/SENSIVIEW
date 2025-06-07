import { createSlice } from '@reduxjs/toolkit';

const infoSlice = createSlice({
  name: "info",
  initialState: "Text",  
  reducers: {
    addinfo: (state, action) => action.payload  
  }
});

export default infoSlice.reducer;
export const { addinfo } = infoSlice.actions;
