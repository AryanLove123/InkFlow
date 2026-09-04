import { initializeApp } from 'firebase/app';
import {environment} from '../environments/environment';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = environment.firebase;
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();