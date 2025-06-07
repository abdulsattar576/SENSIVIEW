import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {BASE_URL} from"@env"
// Use local network IP for physical devices
const baseUrl = `${BASE_URL}:8000/api/user/`;

// Define a service using a base URL and expected endpoints
export const UserAuthApi = createApi({
  reducerPath: 'UserAuthApi',
  baseQuery: fetchBaseQuery({baseUrl}),
  endpoints: build => ({
    registerUser: build.mutation({
      query: user => {
        return {
          url: 'register/',
          method: 'POST',
          body: user,
          headers: {
            'Content-type': 'application/json',
          },
        };
      },
    }),
    loginUser: build.mutation({
      query: user => {
        return {
          url: 'login/',
          method: 'POST',
          body: user,
          headers: {
            'Content-type': 'application/json',
          },
        };
      },
    }),

    getLoggedUser: build.query({
      query: token => {
        return {
          url: 'profile/',
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      },
    }),
    ChangeUserPassword: build.mutation({
      query: ({formData, access}) => ({
        url: 'changePassword/',
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${access}`,
        },
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useGetLoggedUserQuery,
  useChangeUserPasswordMutation,
} = UserAuthApi;
