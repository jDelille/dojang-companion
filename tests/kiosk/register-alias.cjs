// Test-only: tsc keeps "@/..." imports as-is in its CommonJS output, so map them
// to the compiled build (DOJANG_KIOSK_BUILD, set by tools/test-kiosk-domain.sh).
const Module=require('node:module');
const path=require('node:path');
const resolve=Module._resolveFilename;
Module._resolveFilename=function(request,...rest){
  if(request.startsWith('@/'))request=path.join(process.env.DOJANG_KIOSK_BUILD,request.slice(2));
  return resolve.call(this,request,...rest);
};
