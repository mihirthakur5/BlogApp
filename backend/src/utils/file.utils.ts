import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export const fileNameEditor = (
  req: Request,
  file: any,
  cb: (err: any, filename: string) => void,
) => {
  const newName = `${Date.now()}-${file.originalname}`;
  cb(null, newName);
};

export const imageFileFilter = (
  req: Request,
  file: any,
  cb: (err: any, valid: boolean) => void,
) => {
  if (
    !file.originalname ||
    !file.originalname.match(/\.(jpg|jpeg|png|webp)$/)
  ) {
    return cb(new BadRequestException('Invalid file type'), false);
  }

  return cb(null, true);
};
