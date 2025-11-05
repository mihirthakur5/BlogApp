"use client";

import { useGetCommentsQuery } from "../../src/services/api";
import CommentItem from "./CommentItem";
import LoadingSpinner from "./LoadingSpinner";

interface CommentListProps {
  blogId: number;
  currentUserId?: number;
}

export default function CommentList({
  blogId,
  currentUserId,
}: CommentListProps) {
  const {
    data: comments,
    isLoading: commentsLoading,
    refetch,
  } = useGetCommentsQuery(blogId);

  const handleCommentUpdated = () => {
    refetch();
  };

  if (commentsLoading) {
    return (
      <section className="">
        <h2 className="text-lg font-semibold mb-4">Comments</h2>
        <LoadingSpinner text="Loading comments..." />
      </section>
    );
  }

  return (
    <section className="max-h-[40vh] md:max-h-[80vh] w-full md:w-1/3">
      <h2 className="text-lg font-semibold mb-4">
        Comments ({comments?.length || 0})
      </h2>

      {comments && comments.length > 0 ? (
        <>
          <div className=" overflow-y-auto max-h-[80vh] bg-white rounded-md shadow-md lg:max-h-[74vh]">
            {comments.map((comment: any, i) => (
              <div key={i} className="border-b last:border-0">
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  onCommentUpdated={handleCommentUpdated}
                  onCommentDeleted={refetch}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}
    </section>
  );
}
