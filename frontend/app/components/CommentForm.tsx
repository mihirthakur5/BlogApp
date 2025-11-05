"use client";

import { useState } from "react";
import { useCreateCommentMutation } from "../../src/services/api";

interface CommentFormProps {
  blogId: number;
  onCommentAdded?: () => void;
}

export default function CommentForm({
  blogId,
  onCommentAdded,
}: CommentFormProps) {
  const [createComment, { isLoading: isCreatingComment }] =
    useCreateCommentMutation();
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment({ blogId, content: newComment.trim() }).unwrap();
      setNewComment("");
      onCommentAdded?.();
    } catch (err) {
      alert("Failed to add comment");
    }
  };

  return (
    <section className="mt-8 mb-8">
      <h2 className="text-lg font-semibold mb-4">Add a Comment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment..."
          className="w-full shadow-md p-3 bg-white rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          required
        />
        <button
          type="submit"
          disabled={isCreatingComment || !newComment.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors"
        >
          {isCreatingComment ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </section>
  );
}
