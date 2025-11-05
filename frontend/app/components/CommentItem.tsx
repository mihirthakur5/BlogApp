"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from "../../src/services/api";
import { TbEdit, TbTrash, TbCheck, TbX } from "react-icons/tb";

interface CommentItemProps {
  comment: {
    id: number;
    content: string;
    createdAt: string;
    author: {
      id: number;
      username: string;
    };
  };
  currentUserId?: number;
  onCommentDeleted?: () => void;
  onCommentUpdated?: () => void;
}

export default function CommentItem({
  comment,
  currentUserId,
  onCommentDeleted,
  onCommentUpdated,
}: CommentItemProps) {
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteComment(comment.id).unwrap();
      onCommentDeleted?.();
    } catch (err) {
      alert("Failed to delete comment");
    }
  };

  const handleUpdate = async () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateComment({
        commentId: comment.id,
        content: editContent.trim(),
      }).unwrap();
      setIsEditing(false);
      onCommentUpdated?.();
    } catch (err) {
      alert("Failed to update comment");
      setEditContent(comment.content); // Reset to original content
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const modifiedDate = new Date(comment.createdAt)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    })
    .replace(" ", "·");

  const isOwner = currentUserId && Number(currentUserId) === comment.author.id;

  return (
    <div className="p-4 rounded-lg flex flex-col gap-2 hover:bg-whitetransition-colors">
      <div className="flex justify-around items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/author/${comment.author.id}`}
              className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              {comment.author.username}
            </Link>

            <span className="text-sm text-gray-500">{modifiedDate}</span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={isUpdating}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating || !editContent.trim()}
                  className="flex items-center gap-1 font-semibold px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TbCheck size={16} />
                  {isUpdating ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="flex items-center gap-1 font-semibold px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  <TbX size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 leading-relaxed">{comment.content}</p>
          )}
        </div>

        {isOwner && !isEditing && (
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              title="Edit comment"
            >
              <TbEdit size={15} />
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
              title="Delete comment"
            >
              <TbTrash size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
