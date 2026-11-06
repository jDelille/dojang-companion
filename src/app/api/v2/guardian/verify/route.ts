import {connectedKiosk} from '@/server/kiosk-connected';
export async function POST(request:Request){return connectedKiosk(request,'guardianVerify');}
