"use client";

import { useState } from "react";
import { useCreateBlogMutation } from "../../src/services/api";

export default function Create() {
  const [createBlog, { isLoading }] = useCreateBlogMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("public", "true");
      if (image) formData.append("image", image);
      formData.append("comments", "[]");

      await createBlog(formData).unwrap();
      window.location.href = "/";
    } catch (err) {
      alert("Create failed");
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 bg-white rounded shadow-md mt-10">
      <h1 className="text-xl font-semibold mb-4">Create Blog</h1>
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
          placeholder="Image"
          className="ring-2 ring-gray-300 rounded-md p-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="ring-2 ring-gray-300 rounded-md p-2 h-32"
        />
        <button
          disabled={isLoading}
          className="mt-2 bg-blue-600 text-white font-semibold px-3 py-2 rounded-md"
        >
          Create
        </button>
      </form>
    </main>
  );
}
