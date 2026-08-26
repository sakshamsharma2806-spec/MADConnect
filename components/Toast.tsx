"use client";

import { useEffect, useState } from "react";

export default function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`toast ${show ? "active" : ""}`} onClick={onClose}>
      {message}
    </div>
  );
}
