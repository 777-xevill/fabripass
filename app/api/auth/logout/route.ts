import {destroySession} from '../../../auth';
import {json,fail} from '../../lib';

export const dynamic='force-dynamic';

export async function POST(){
  try{
    await destroySession();
    return json({ok:true});
  }catch(e){return fail(e)}
}
