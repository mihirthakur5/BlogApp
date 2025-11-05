"use client";

import { ErrorMessage, LoadingSpinner } from "@/app/components";
import {
  useGetBlogQuery,
  useProfileQuery,
  useUpdateBlogMutation,
} from "@/src/services/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditPage = () => {
  const params = useParams();
  const { data: blog, isLoading, error } = useGetBlogQuery(Number(params.id));
  const { data: currentUser } = useProfileQuery();
  const [updateBlog, { isLoading: updating }] = useUpdateBlogMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (blog) {
      setTitle(blog.title || "");
      setDescription(blog.description || "");
      // For image, you could show a preview if blog.image exists
    }
  }, [blog]);

  const currentUserId =
    currentUser?.id ?? currentUser?.userId ?? currentUser?.sub;

  const isOwner = blog && currentUserId && blog.author?.id === currentUserId;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (image) formData.append("image", image);

      await updateBlog({ blogId: blog.id, formData }).unwrap();
      router.push(`/posts/${blog.id}`);
    } catch (error) {}
  };

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <LoadingSpinner size="lg" text="Loading blog post..." />
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <ErrorMessage
          message="Blog post not found or failed to load"
          onRetry={() => window.location.reload()}
        />
      </main>
    );
  }

  if (!isOwner)
    return (
      <main className="max-w-3xl mx-auto px-4 py-8 text-center">
        <ErrorMessage message="You are not authorized to edit this blog." />
      </main>
    );

  return (
    <main className="max-w-md mx-auto p-4 bg-white rounded shadow-md mt-10">
      <h1 className="text-xl font-semibold mb-4">Edit Blog</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="ring-2 ring-gray-300 rounded-md p-2"
        />

        <input
          type="file"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="ring-2 ring-gray-300 rounded-md p-2"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="ring-2 ring-gray-300 rounded-md p-2 h-32"
        />

        <button
          disabled={updating}
          className="mt-2 bg-green-600 text-white font-semibold px-3 py-2 rounded-md"
        >
          {updating ? "Updating..." : "Update"}
        </button>
      </form>
    </main>
  );
};

export default EditPage;
