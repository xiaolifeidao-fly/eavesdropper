'use client';

import Error from 'next/error';

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <Error statusCode={404} displayName="鲲鹏上传-淘宝版" title="鲲鹏上传-淘宝版: your page is not found" />
      </body>
    </html>
  );
}