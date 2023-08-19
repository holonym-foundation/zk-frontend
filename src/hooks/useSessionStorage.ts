import { useState } from "react";

export default function useSessionStorage(key: string, initialValue: any) {
  const [item, setInnerValue] = useState(() => {
    try {
      return window.sessionStorage.getItem(key)
        ? JSON.parse(window.sessionStorage.getItem(key)!)
        : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: any) => {
    try {
      setInnerValue(value);
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  };

  return [item, setValue];
}
