import cv, { Mat } from "@techstark/opencv-js";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Function to apply Gaussian blur
export function blurImage(image: Mat, dst: Mat, amount: number) {
  const ksize = new cv.Size(amount, amount);
  const sigmaX = 0;
  cv.GaussianBlur(image, dst, ksize, sigmaX, 0, cv.BORDER_DEFAULT);
}

// Function to apply Gaussian blur
export function brightening(image: Mat, dst: Mat, amount: number) {
  const M = cv.Mat.eye(amount, amount, cv.CV_32FC1);
  const anchor = new cv.Point(-1, -1);
  cv.filter2D(image, dst, cv.CV_8U, M, anchor, 0, cv.BORDER_DEFAULT);
  M.delete();
}