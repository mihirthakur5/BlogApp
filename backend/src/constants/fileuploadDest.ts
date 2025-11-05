import { join } from 'path';

export const FILE_UPLOAD_DEST = join(process.cwd(), 'src', 'uploads');
export const BLOG_UPLOAD_DEST = join(FILE_UPLOAD_DEST, 'blogs');
export const AVATAR_UPLOAD_DEST = join(FILE_UPLOAD_DEST, 'avatars');
