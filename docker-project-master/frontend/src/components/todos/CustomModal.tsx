import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react"

export function CustomModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
        style={{
          animation: isOpen ? "fadeIn 0.3s ease-out" : "fadeOut 0.3s ease-out",
        }}
      />

      <div
        className={`relative bg-white rounded-2xl shadow-2xl border border-white/20 ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden`}
        style={{
          animation: isOpen ? "slideIn 0.3s ease-out" : "slideOut 0.3s ease-out",
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.95) translateY(-10px); }
        }
      `}</style>
    </div>
  );
}