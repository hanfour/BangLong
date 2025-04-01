'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

type ScriptSettings = {
  googleAnalytics?: string;
  headScripts?: string;
  bodyStartScripts?: string;
  bodyEndScripts?: string;
};

export default function CustomScripts() {
  const [scripts, setScripts] = useState<ScriptSettings>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response = await fetch('/api/settings?type=advanced', {
          cache: 'no-store',
        });

        if (!response.ok) {
          console.error('無法獲取腳本設定');
          return;
        }

        const data = await response.json();
        
        if (data.settings && data.settings.advanced) {
          setScripts(data.settings.advanced);
        }
      } catch (error) {
        console.error('獲取腳本設定時發生錯誤:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchScripts();
  }, []);

  // Insert bodyStart and bodyEnd scripts into specific containers
  useEffect(() => {
    if (!isLoaded) return;

    // Handle body start scripts
    if (scripts.bodyStartScripts) {
      const startContainer = document.getElementById('body-start-scripts-container');
      if (startContainer) {
        startContainer.innerHTML = scripts.bodyStartScripts;
      }
    }

    // Handle body end scripts
    if (scripts.bodyEndScripts) {
      const endContainer = document.getElementById('body-end-scripts-container');
      if (endContainer) {
        endContainer.innerHTML = scripts.bodyEndScripts;
      }
    }
  }, [isLoaded, scripts.bodyStartScripts, scripts.bodyEndScripts]);

  if (!isLoaded) return null;

  return (
    <>
      {/* Google Analytics */}
      {scripts.googleAnalytics && (
        <Script 
          id="google-analytics"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${scripts.googleAnalytics}`}
        />
      )}
      
      {scripts.googleAnalytics && (
        <Script 
          id="google-analytics-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${scripts.googleAnalytics}');
            `
          }}
        />
      )}

      {/* 頭部腳本 */}
      {scripts.headScripts && (
        <Script
          id="head-scripts"
          dangerouslySetInnerHTML={{ __html: scripts.headScripts }}
        />
      )}
    </>
  );
}