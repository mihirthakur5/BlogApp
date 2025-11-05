"use client";

import Image from "next/image";
import Link from "next/link";

interface BlogHeaderProps {
  blog: {
    title: string;
    description: string;
    image: string;
    createdAt: Date;
    author?: {
      id: number;
      username: string;
    };
  };
}

export default function BlogHeader({ blog }: BlogHeaderProps) {
  return (
    <>
      <h1 className="mb-4 text-xl font-bold">Blog</h1>
      <header className="min-h-[200px] max-w-[600px] flex flex-col gap-2 bg-white p-6 rounded-md shadow-md mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
          <span>By</span>
          {blog.author ? (
            <Link
              href={`/profile/${blog.author.id}`}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {blog.author.username}
            </Link>
          ) : (
            <span className="font-medium">Unknown Author</span>
          )}
          <p>· {new Date(blog.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex item-center justify-center">
          <Image
            src={`/uploads${blog.image}`}
            alt={blog.title}
            width={500}
            height={500}
            className="object-contain rounded-md"
          />
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed text-lg">
            {blog.description}
          </p>
        </div>
      </header>
    </>
  );
}
