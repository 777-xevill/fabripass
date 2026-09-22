import {Suspense} from 'react';
import Login from './login';
export const metadata={title:'Sign in | FabriPass',description:'Sign in to your FabriPass workspace.'};
export default function Page(){return <Suspense><Login/></Suspense>}
