"use client";

import { useGetBlogQuery, useProfileQuery } from "../../../src/services/api";
import { useParams } from "next/navigation";
import {
  BlogHeader,
  CommentForm,
  CommentList,
  LoadingSpinner,
  ErrorMessage,
} from "../../components";

export default function PostPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: blog, isLoading, error } = useGetBlogQuery(id);
  const { data: currentUser } = useProfileQuery();

  const currentUserId =
    currentUser?.id ?? currentUser?.userId ?? currentUser?.sub;

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

  // max-w-3xl mx-auto

  return (
    <main className="max-w-5xl mx-auto md:flex gap-4 block justify-between px-4 py-8 min-h-[calc(100vh-10vh)]">
      <div>
        <BlogHeader blog={blog} />

        {currentUser && <CommentForm blogId={id} />}
      </div>

      <CommentList blogId={id} currentUserId={currentUserId} />
    </main>
  );
}
