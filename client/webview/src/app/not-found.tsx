'use client';

import Error from 'next/error';

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <Error statusCode={404} displayName="淘宝客" title="淘宝客: your page is not found" />
      </body>
    </html>
  );
}