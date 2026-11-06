import {kioskConfig,kioskUnavailable} from '@/server/kiosk-gateway';
import {recoveryContext} from '@/server/kiosk-recovery';
export async function GET(request:Request){try{return await recoveryContext(request,kioskConfig());}catch{return kioskUnavailable();}}
