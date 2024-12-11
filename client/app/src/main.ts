import { start } from "./kernel/app";
import log from 'electron-log';
require('module-alias/register');

log.info("preload load")
import {Shop} from "@model/shop/shop"
try{
  log.info(new Shop(1, "test", "test").id)
}catch(e){
  log.error(e)
}
 start();