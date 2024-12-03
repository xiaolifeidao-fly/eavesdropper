import createMiddleware from 'next-intl/middleware';
import {locales, pathnames, localePrefix, defaultLocale} from './navigation';
import { Shop }  from '@model/shop/shop.test';

import { pageData } from '@api/shop/shop.test.api';
import { useEffect } from 'react';

export default createMiddleware({
  defaultLocale,
  localePrefix,
  pathnames,
  locales,
});


async function test(){
  const result = await pageData();
  console.log(result);
}

test();
export const config = {
  // Skip all paths that should not be internationalized
  // matcher: ['/((?!_next|.*\\..*).*)']
};