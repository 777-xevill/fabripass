import {Suspense} from 'react';
import Signup from './signup';
export const metadata={title:'Create account | FabriPass',description:'Create your FabriPass workspace.'};
export default function Page(){return <Suspense><Signup/></Suspense>}
