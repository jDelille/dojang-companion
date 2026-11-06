import { hubEnabled } from '@/server/hub-gateway';
import StaffOperations from '@/views/operations/staffOperations';
export const dynamic = 'force-dynamic';
export default async function OperationsPage({searchParams}:{searchParams:Promise<{section?:string}>}){const {section}=await searchParams;const allowed=['shifts','attendance','reports','courses','testing','communications','trials','students','setup','ai'];return <StaffOperations enabled={hubEnabled()} initialSection={section&&allowed.includes(section)?section:'shifts'}/>;}
