import './App.css'
import MainPage from "./pages/MainPage.tsx";
import styles from './pages/MainPage.module.css';
import { useState } from 'react';

export default function App () {
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [isErrorClosing, setIsErrorClosing] = useState(false);

  const showError = (message: string) => {
    setIsErrorClosing(false);
    setErrorHeader(message);

    // Start closing animation after 4 seconds
    setTimeout(() => {
      setIsErrorClosing(true);
      // Remove from DOM after animation completes (800ms)
      setTimeout(() => {
        setErrorHeader(null);
        setIsErrorClosing(false);
      }, 800);
    }, 4000);
  };

  return (
    <>
      <MainPage onError={showError}/>
      {errorHeader && (
        <div className={isErrorClosing ? styles.errorPopupHidden : styles.errorPopup}>
          {errorHeader}
        </div>
      )}
    </>
  )
}
