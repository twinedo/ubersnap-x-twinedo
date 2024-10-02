'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import Footer from "@/components/ui/footer";
import noImage from '@/assets/no-image.svg';
import icDefault from '@/assets/ic-default.png';
import cv from "@techstark/opencv-js"
import { TFilterItem } from "./page.type";
import { blurImage, brightening } from "@/lib/utils";

export default function Home() {
  const [imageInputSource, setImageInputSource] = useState<string>('')

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isCrop, setIsCrop] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  const [currentPage, setCurrentPage] = useState<'default' | 'edit'>('default')

  const onImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files as FileList;
    setImageInputSource(URL.createObjectURL(file?.[0]))
  }

  const [selectedFilter, setSelectedFilter] = useState<'no-effect' | 'blur' | 'brighter'>('no-effect');
  const filters = useMemo(() => [
    {
      id: '1',
      text: 'Default',
      effect: 'no-effect',
      picture: icDefault
    },
    {
      id: '2',
      text: 'Blur',
      effect: 'blur',
      picture: imageInputSource
    },
    {
      id: '3',
      text: 'Brighter',
      effect: 'brighter',
      picture: imageInputSource
    },
  ] as TFilterItem[], [imageInputSource])

  const handleImageLoad = useCallback(() => {
    if (imageInputSource.length > 0 && imageRef.current && canvasRef.current) {
      let mat = cv.imread(imageRef.current);  // Get the image from the img tag
      cv.imshow(canvasRef.current, mat);  // Show the image on the canvas
      mat.delete();
    }
  }, [imageInputSource]);

  const onNextButton = useCallback(() => {
    setCurrentPage('edit')
    setTimeout(() => {
      handleImageLoad();
    }, 200);
  }, [handleImageLoad])

  const onChangeEffect = (item: TFilterItem) => {
    let mat = cv.imread(canvasRef.current!);
    let dst = new cv.Mat();

    // Reset to default if the same filter is selected
    if (selectedFilter === item.effect) {
      setSelectedFilter('no-effect');
      handleImageLoad();
      mat.delete();
      dst.delete();
      return;
    }

    // Apply the effect based on the selected filter
    switch (item.effect) {
      case 'blur':
        setSelectedFilter(item.effect);
        blurImage(mat, dst, 5);
        break;

      case 'brighter':
        setSelectedFilter(item.effect);
        brightening(mat, dst, 2);
        break;

      default:
        setSelectedFilter('no-effect');
        handleImageLoad();
        break;
    }

    cv.imshow(canvasRef.current!, dst);
    mat.delete();
    dst.delete();
  };

  // Start cropping when mouse is pressed
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    setStartPoint({ x: e.clientX - rect!.left, y: e.clientY - rect!.top });
    setIsCropping(true);
  };

  // Track the mouse movement and update the crop rectangle
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCropping || !startPoint || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = currentX - startPoint.x;
    const height = currentY - startPoint.y;

    setCropRect({ x: startPoint.x, y: startPoint.y, width, height });
  };

  // Apply the crop on mouse release
  const handleMouseUp = () => {
    setIsCropping(false);
    cropImage();
  };

  // Function to crop
  const cropImage = () => {
    if (!cropRect || !imageRef.current || !canvasRef.current) return;

    const imgElement = imageRef.current;
    const canvas = canvasRef.current;

    // Read the image into OpenCV matrix
    let mat = cv.imread(imgElement);

    // Create a rectangle for cropping
    let rect = new cv.Rect(
      Math.max(0, cropRect.x),
      Math.max(0, cropRect.y),
      Math.abs(cropRect.width),
      Math.abs(cropRect.height)
    );

    let cropped = mat.roi(rect);
    cv.imshow(canvas, cropped);
    cropped.delete();
    mat.delete();
  };

  const onCheckCrop = (checked: boolean) => {
    if (!checked) {
      handleImageLoad()
    }
    setIsCrop(checked)
  }

  // Function to download
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const dataURL = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'ubersnap-'+ new Date().toLocaleDateString()+'.png'; // File name for download
    link.click();
  };

  return (
    <>
      <Label className="text-bold">Welcome to Ubersnap</Label>
      <div className="flex flex-col w-full lg:max-w-sm justify-center gap-1.5">
        <Label htmlFor="canvasInput">Select Image</Label>
        <div 
          className="flex flex-col w-full lg:max-w-sm justify-center my-4">
          <Input 
            id="canvasInput" 
            type="file" 
            onChange={onImageAttach} 
            className="opacity-0 w-[300px] h-[300px] absolute" 
            />
          <Image 
            priority
            id="imageSrc" 
            ref={imageRef} 
            src={imageInputSource.length === 0 ? noImage : imageInputSource} 
            alt="input-img" 
            width={300} 
            height={300} 
            className="rounded-xl self-center" 
            onLoad={handleImageLoad} 
          />
        </div>
        <Button variant='outline' onClick={onNextButton}>Next</Button>
      </div>

      {/* mode edit */}
      {currentPage === 'edit' && (
        <div className="flex flex-col w-full lg:max-w-sm justify-center gap-1.5 relative">
          <Label htmlFor="canvasInput">Preview Image</Label>
          <div className="flex flex-col w-full lg:max-w-sm justify-center md:my-4 relative">
            <canvas
              id="canvasOutput"
              ref={canvasRef}
              height="300"
              width="300"
              className="rounded-xl self-center w-[300px] h-[300px]"
              onMouseDown={(e) => isCrop && handleMouseDown(e)}
              onMouseMove={(e) => isCrop && handleMouseMove(e)}
              onMouseUp={() => isCrop && handleMouseUp()}></canvas>
          </div>

          {/* effect list */}
          <div className="flex flex-row items-center gap-2">
            {filters?.map(item => (
                <div key={item.id} onClick={() => onChangeEffect(item)} className="cursor-pointer">
                  <Image 
                    src={item.picture} 
                    alt={item.effect} 
                    width={50} 
                    height={50} 
                    className={`rounded-xl p-1 border-2 ${item.effect === 'blur' && 'blur-sm'} ${item.effect === 'brighter' && 'brightness-150'} ${item.effect === selectedFilter ? 'border-red-400' : 'border-gray'}`} 
                  />
                  <Label>{item.text}</Label>
                </div>
            ))}
          </div>
          <div className="my-3">
            <div className="flex flex-row items-center gap-3">
              <Label htmlFor="cropCheck">Crop</Label>
              <Checkbox id="cropCheck" onCheckedChange={onCheckCrop} />
            </div>
            {/* Display the crop rectangle visually */}
            {isCrop && cropRect && (
              <div
                style={{
                  position: 'absolute',
                  left: cropRect.x,
                  top: cropRect.y,
                  width: cropRect.width,
                  height: cropRect.height,
                  border: '2px dashed red',
                  pointerEvents: 'none',
                }}
              ></div>
            )}
          </div>
          <div className="flex flex-row gap-2 w-full">
            <Button variant='outline' className="flex flex-1" onClick={() => setCurrentPage('default')}>Back</Button>
            <Button variant='default' className="flex flex-1" onClick={downloadImage}>Submit</Button>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
