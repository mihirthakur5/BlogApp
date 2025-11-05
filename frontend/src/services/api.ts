import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
    credentials: "include", // send cookies
  }),
  tagTypes: ["Blog", "Auth", "Author", "Comment"],
  endpoints: (build) => ({
    //* <------------ BLOGS ------------>
    getBlogs: build.query<any[], void>({
      query: () => ({ url: "/blogs" }),
      transformResponse: (response: any[]) => {
        return [...response].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      providesTags: ["Blog"],
    }),

    getBlog: build.query<any, number>({
      query: (id) => ({ url: `/blogs/${id}` }),
      providesTags: (result, error, id) => [{ type: "Blog", id }],
    }),

    createBlog: build.mutation<any, FormData>({
      query: (formData) => ({ url: "/blogs", method: "POST", body: formData }),
      invalidatesTags: ["Blog"],
    }),

    updateBlog: build.mutation<any, { blogId: number; formData: FormData }>({
      query: ({ blogId, formData }) => ({
        url: `/blogs/${blogId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result, error, { blogId }) => [
        { type: "Blog", id: blogId },
        "Blog",
      ],
    }),

    deleteBlog: build.mutation<any, number>({
      query: (blogId) => ({
        url: `/blogs/${blogId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, err, blogId) => [
        { type: "Blog", id: blogId },
        "Author",
      ],
    }),

    //* <------------ AUTH ------------>
    login: build.mutation<any, { username: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),

    register: build.mutation<any, FormData>({
      query: (formData) => ({
        url: "/auth/register",
        method: "POST",
        body: formData,
      }),
    }),

    profile: build.query<any, void>({
      query: () => ({ url: "/auth/profile" }),
      providesTags: ["Auth"],
    }),

    logout: build.mutation<any, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Auth"],
    }),

    //* <------------ AUTHORS ------------>
    getAuthor: build.query<any, number>({
      query: (id) => ({ url: `/author/${id}` }),
      providesTags: (result, error, id) => [{ type: "Author", id }],
    }),

    updateAuthor: build.mutation<any, { body: any }>({
      query: ({ body }) => ({ url: `/auth/profile`, method: "PATCH", body }),
      invalidatesTags: (result, error, arg) => {
        const id = (result as any)?.id ?? arg?.body?.id;
        return id ? [{ type: "Author", id }, "Auth"] : ["Auth", "Author"];
      },
    }),

    //* <------------ COMMENTS ------------>
    getComments: build.query<any[], number>({
      query: (blogId) => ({ url: `/comments/blog/${blogId}` }),
      providesTags: (result, error, blogId) => [
        { type: "Comment", id: blogId },
      ],
    }),

    createComment: build.mutation<any, { blogId: number; content: string }>({
      query: ({ blogId, content }) => ({
        url: `/comments/${blogId}`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (result, error, { blogId }) => [
        { type: "Comment", id: blogId },
        { type: "Blog", id: blogId },
      ],
    }),

    updateComment: build.mutation<any, { commentId: number; content: string }>({
      query: ({ commentId, content }) => ({
        url: `/comments/${commentId}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comment", id: commentId },
      ],
    }),

    deleteComment: build.mutation<any, number>({
      query: (commentId) => ({
        url: `/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, commentId) => [
        { type: "Comment", id: commentId },
        "Author",
      ],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useLoginMutation,
  useRegisterMutation,
  useProfileQuery,
  useLogoutMutation,
  useGetAuthorQuery,
  useUpdateAuthorMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = api;
