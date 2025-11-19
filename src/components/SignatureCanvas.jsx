import React, { useRef, useEffect } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const SignatureCanvas = ({ signatureRef, onBegin, onEnd }) => {
  const clearSignature = () => {
    signatureRef.current.clear();
    onEnd();
  };

  useEffect(() => {
    const canvas = signatureRef.current.getCanvas();
    const resizeCanvas = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signatureRef.current.fromData(signatureRef.current.toData());
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [signatureRef]);


  return (
    <div className="relative">
      <SignaturePad
        ref={signatureRef}
        penColor="black"
        canvasProps={{ className: 'w-full h-40 bg-white rounded border cursor-crosshair' }}
        onBegin={onBegin}
        onEnd={onEnd}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={clearSignature}
        className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:text-gray-800"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default SignatureCanvas;