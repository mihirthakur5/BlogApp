"use client";

import React, { useState } from "react";
import {
  useGetAuthorQuery,
  useUpdateAuthorMutation,
  useProfileQuery,
  useDeleteBlogMutation,
} from "../../../src/services/api";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { TbEdit, TbTrash } from "react-icons/tb";
import { ErrorMessage as GlobalError, LoadingSpinner } from "@/app/components";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const AuthorSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string(),
  bio: Yup.string().max(300, "Bio too long"),
});

export default function AuthorPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: author, isLoading } = useGetAuthorQuery(id);
  const { data: currentUser } = useProfileQuery();
  const [updateAuthor, { isLoading: isUpdating }] = useUpdateAuthorMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const currentUserId =
    currentUser?.id ?? currentUser?.userId ?? currentUser?.sub;
  const isOwnProfile = currentUserId && Number(currentUserId) === id;

  const handleDelete = async (blogId: number) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await deleteBlog(blogId).unwrap();
      alert("Blog deleted!");
      router.refresh();
    } catch {
      alert("Failed to delete blog");
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <LoadingSpinner size="lg" text="Loading author profile..." />
      </main>
    );
  }

  if (!author) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <GlobalError
          message="Author not found or failed to load"
          onRetry={() => window.location.reload()}
        />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-semibold">
          {isOwnProfile ? "My Profile" : `${author.username}'s Profile`}
        </h1>
        {isOwnProfile && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 font-semibold text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
            <div className="flex items-center rounded-full h-40 w-40 overflow-hidden">
              <Image
                src={
                  preview
                    ? preview
                    : author.avatar
                    ? `/uploads/${author.avatar}`
                    : "/blank-profile.svg"
                }
                alt={`${author.username}'s avatar`}
                width={160}
                height={160}
                className="rounded-full object-cover w-40 h-40"
                unoptimized
              />
            </div>
            <h2 className="text-xl font-semibold text-center mt-4">
              {author.name || author.username}
            </h2>
            <p className="text-gray-600 text-center">@{author.username}</p>
            {author.bio && (
              <p className="text-gray-700 text-sm text-center mt-2">
                {author.bio}
              </p>
            )}
            {isOwnProfile && (
              <div className="mt-4 text-sm text-gray-500 text-center">
                <p>Email: {author.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit or Blogs */}
        <div className="md:col-span-2">
          {isOwnProfile && isEditing ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
              <Formik
                enableReinitialize
                initialValues={{
                  name: author.name ?? "",
                  username: author.username ?? "",
                  email: author.email ?? "",
                  password: "",
                  bio: author.bio ?? "",
                  avatar: null as File | null,
                }}
                validationSchema={AuthorSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const formData = new FormData();
                    formData.append("name", values.name);
                    formData.append("username", values.username);
                    formData.append("email", values.email);
                    formData.append("bio", values.bio);
                    if (values.password)
                      formData.append("password", values.password);
                    if (values.avatar) formData.append("avatar", values.avatar);

                    await updateAuthor({ body: formData }).unwrap();
                    alert("Profile updated!");
                    setIsEditing(false);
                    router.refresh();
                  } catch (err: any) {
                    alert(err?.data?.message ?? "Update failed");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ setFieldValue, isSubmitting }) => (
                  <Form className="flex flex-col gap-4">
                    {/* Name + Username */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Field
                          name="name"
                          placeholder="Name"
                          className="border p-3 rounded w-full"
                        />
                        <ErrorMessage
                          name="name"
                          component="p"
                          className="text-red-500 text-sm"
                        />
                      </div>
                      <div>
                        <Field
                          name="username"
                          placeholder="Username"
                          className="border p-3 rounded w-full"
                        />
                        <ErrorMessage
                          name="username"
                          component="p"
                          className="text-red-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Field
                        name="email"
                        type="email"
                        placeholder="Email"
                        className="border p-3 rounded w-full"
                      />
                      <ErrorMessage
                        name="email"
                        component="p"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <Field
                        name="password"
                        type="password"
                        placeholder="New Password (optional)"
                        className="border p-3 rounded w-full"
                      />
                      <ErrorMessage
                        name="password"
                        component="p"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    {/* Avatar Upload */}
                    <div>
                      <input
                        type="file"
                        name="avatar"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setFieldValue("avatar", file);
                          if (file) setPreview(URL.createObjectURL(file));
                        }}
                        className="border p-3 rounded w-full"
                      />
                      <ErrorMessage
                        name="avatar"
                        component="p"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <Field
                        as="textarea"
                        name="bio"
                        placeholder="Bio"
                        className="border p-3 rounded w-full h-24"
                      />
                      <ErrorMessage
                        name="bio"
                        component="p"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || isUpdating}
                        className="bg-green-600 font-semibold text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {isSubmitting || isUpdating
                          ? "Saving..."
                          : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-500 font-semibold text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                {isOwnProfile ? "My Blogs" : `${author.username}'s Blogs`}
              </h3>
              {author.blogs && author.blogs.length > 0 ? (
                <div className="space-y-4">
                  {author.blogs.map((blog: any) => (
                    <div
                      key={blog.id}
                      className="flex justify-between border-b pb-4 last:border-b-0"
                    >
                      <div>
                        <Link
                          href={`/posts/${blog.id}`}
                          className="text-lg font-medium text-blue-600 hover:text-blue-800"
                        >
                          {blog.title}
                        </Link>
                        <p className="text-gray-600 text-sm mt-1">
                          {blog.description?.substring(0, 150)}
                          {blog.description?.length > 150 && "..."}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {isOwnProfile && (
                        <div className="flex gap-2">
                          <TbEdit
                            size={25}
                            className="text-blue-500 cursor-pointer"
                            onClick={() =>
                              router.push(`/posts/${blog.id}/edit`)
                            }
                          />
                          <TbTrash
                            size={25}
                            onClick={() => handleDelete(blog.id)}
                            className="text-red-500 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {isOwnProfile
                    ? "You haven't written any blogs yet. Start writing!"
                    : `${author.username} hasn't written any blogs yet.`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
