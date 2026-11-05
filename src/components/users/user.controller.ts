import type { NextFunction, Request, Response } from 'express';
import * as userService from './user.service';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await userService.loginUser(req.body);
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
};
