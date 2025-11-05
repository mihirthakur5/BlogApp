"use client";

import Image from "next/image";
import { useGetBlogsQuery } from "../src/services/api";
import Link from "next/link";
import { LoadingSpinner } from "./components";

export default function Home() {
  const { data: blogs, isLoading } = useGetBlogsQuery();

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <LoadingSpinner size="lg" text="Loading Blogs..." />
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-5">
      <h1 className="text-2xl font-semibold mb-4">Latest Blogs</h1>
      <div className="grid gap-4">
        {blogs?.map((blog: any) => {
          const authorId =
            blog.author?.id ?? blog.author?.userId ?? blog.author?.sub;
          return (
            <article
              key={blog.id}
              className="bg-white w-full shadow-md rounded p-4 flex flex-col gap-2"
            >
              <Link href={`/posts/${blog.id}`} className="text-lg font-bold">
                {blog.title}
              </Link>
              <p className="text-sm text-gray-600">
                By{" "}
                {authorId ? (
                  <Link href={`/profile/${authorId}`} className="text-blue-600">
                    {blog.author?.username}
                  </Link>
                ) : (
                  <span>{blog.author?.username ?? "Unknown"}</span>
                )}
              </p>
              <div className="flex item-center justify-center w-full h-64 rounded-md">
                <Image
                  src={`/uploads/${blog.image}`}
                  alt={blog.title}
                  width={1000}
                  height={1000}
                  className="h-auto w-full rounded-md object-cover"
                  unoptimized
                />
              </div>
              <p className="mt-2 text-gray-700 font-medium text-sm mt-4">
                {blog.description}
              </p>
            </article>
          );
        })}
      </div>
    </main>
  );
}
