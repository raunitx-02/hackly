import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updatePassword,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserProfile(docSnap.data());
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    async function signup({ email, password, name, role, college, phone, gender, age, yearOfStudy, branch, state }) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const profile = {
            uid: cred.user.uid,
            name,
            email,
            role,
            college: college || '',
            phone: phone || '',
            gender: gender || '',
            age: age || '',
            yearOfStudy: yearOfStudy || '',
            branch: branch || '',
            state: state || '',
            createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', cred.user.uid), profile);
        setUserProfile(profile);
        return cred;
    }

    async function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // LOGIN with Google — fails if no Firestore profile exists yet
    async function loginWithGoogle() {
        const cred = await signInWithPopup(auth, googleProvider);
        const docRef = doc(db, 'users', cred.user.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            // Sign them back out so they're not in a half-state
            await signOut(auth);
            throw Object.assign(new Error('no-account'), { code: 'hackly/no-account' });
        }
        setUserProfile(docSnap.data());
        return cred;
    }

    // SIGNUP with Google — fails if account already exists, returns cred for profile completion
    async function signupWithGoogle() {
        const cred = await signInWithPopup(auth, googleProvider);
        const docRef = doc(db, 'users', cred.user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            // Already registered — sign out and tell them
            await signOut(auth);
            throw Object.assign(new Error('already-exists'), { code: 'hackly/already-exists' });
        }
        // Don't create profile yet — redirect to CompleteProfilePage
        return cred;
    }

    // Called from CompleteProfilePage after Google signup
    async function completeGoogleProfile({ uid, name, email, role, college, phone, gender, age, yearOfStudy, branch, state }) {
        const profile = {
            uid, name, email, role,
            college: college || '',
            phone: phone || '',
            gender: gender || '',
            age: age || '',
            yearOfStudy: yearOfStudy || '',
            branch: branch || '',
            state: state || '',
            createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', uid), profile);
        setUserProfile(profile);
    }


    async function logout() {
        await signOut(auth);
        setUserProfile(null);
    }

    async function updateProfile(data) {
        if (!currentUser) return;
        const docRef = doc(db, 'users', currentUser.uid);
        await updateDoc(docRef, data);
        setUserProfile(prev => ({ ...prev, ...data }));
    }

    async function changePassword(currentPassword, newPassword) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
    }

    async function deleteAccount(currentPassword) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await deleteDoc(doc(db, 'users', currentUser.uid));
        await deleteUser(currentUser);
        setUserProfile(null);
    }

    const hasFeature = (featureKey) => {
        if (userProfile?.role === 'admin') return true;
        const plan = userProfile?.currentPlan || 'Free / Trial';

        // Feature Access Matrix
        const matrix = {
            'ai_generator': ['Growth', 'Institution Pro'],
            'reliability_badges': ['Growth', 'Institution Pro'],
            'campus_pulse': ['Growth', 'Institution Pro'],
            'blind_judging': ['Growth', 'Institution Pro'],
            'reports': ['Starter', 'Growth', 'Institution Pro'],
            'advanced_analytics': ['Growth', 'Institution Pro'],
            'pdf_certificates': ['Growth', 'Institution Pro'],
        };

        const allowedPlans = matrix[featureKey] || [];
        return allowedPlans.includes(plan);
    };

    const value = {
        currentUser,
        userProfile,
        isAdmin: userProfile?.role === 'admin',
        hasFeature,
        loading,
        signup,
        login,
        loginWithGoogle,
        signupWithGoogle,
        completeGoogleProfile,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
