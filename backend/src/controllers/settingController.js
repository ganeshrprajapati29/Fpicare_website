import Setting from '../models/Setting.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getSettings = asyncHandler(async (_req, res) => {
  res.json(await Setting.getSite());
});

export const updateSettings = asyncHandler(async (req, res) => {
  const s = await Setting.getSite();
  const { _id, key, createdAt, updatedAt, __v, ...data } = req.body;
  s.set(data);
  await s.save();
  res.json(s);
});
