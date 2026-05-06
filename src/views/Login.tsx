import React, { useMemo, useState } from 'react';
import {
  signInWithEmailAndPassword,
  type User,
} from 'firebase/auth';
import type { FormEvent } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { auth, missingFirebaseKeys, prepareAuthPersistence } from '../lib/firebase.js';

type LoginProps = {
  onAuthenticated?: (user: User, token: string) => void;
};

type UsuarioGraphql = {
  id: string;
  nombre: string;
  correoElectronico: string;
  firebaseUID?: string | null;
  createdAt: string;
  updatedAt: string;
};

type SignUpEmailPasswordResponse = {
  signUpEmailPassword?: {
    success: boolean;
    message: string;
    usuario?: UsuarioGraphql | null;
    firebaseUID?: string | null;
  } | null;
};

type LoginEmailPasswordResponse = {
  loginEmailPassword?: {
    success: boolean;
    message: string;
    usuario?: UsuarioGraphql | null;
    firebaseUID?: string | null;
    idToken?: string | null;
  } | null;
};

type SignUpEmailPasswordVariables = {
  input: {
    nombre: string;
    correoElectronico: string;
    contrasena: string;
  };
};

type LoginEmailPasswordVariables = {
  input: {
    correoElectronico: string;
    idToken: string;
  };
};

const SIGN_UP_EMAIL_PASSWORD = gql`
  mutation SignUpEmailPassword($input: SignUpEmailPasswordInput!) {
    signUpEmailPassword(input: $input) {
      success
      message
      usuario {
        id
        nombre
        correoElectronico
        firebaseUID
        createdAt
        updatedAt
      }
      firebaseUID
    }
  }
`;

const LOGIN_EMAIL_PASSWORD = gql`
  mutation LoginEmailPassword($input: LoginEmailPasswordInput!) {
    loginEmailPassword(input: $input) {
      success
      message
      usuario {
        id
        nombre
        correoElectronico
        firebaseUID
        createdAt
        updatedAt
      }
      firebaseUID
      idToken
    }
  }
`;

const friendlyError = (code?: string) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo no tiene un formato válido.';
    case 'auth/user-not-found':
      return 'No existe una cuenta con ese correo.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    case 'auth/email-already-in-use':
      return 'Ese correo ya está registrado.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intenta de nuevo más tarde.';
    default:
      return 'No se pudo completar la autenticación.';
  }
};

export default function Login({ onAuthenticated }: LoginProps) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signUpEmailPassword] = useMutation<SignUpEmailPasswordResponse, SignUpEmailPasswordVariables>(SIGN_UP_EMAIL_PASSWORD);
  const [loginEmailPassword] = useMutation<LoginEmailPasswordResponse, LoginEmailPasswordVariables>(LOGIN_EMAIL_PASSWORD);

  const isConfigured = missingFirebaseKeys.length === 0 && Boolean(auth);

  const title = useMemo(() => (
    mode === 'login' ? 'Inicia sesión en LookFin' : 'Crea tu cuenta en LookFin'
  ), [mode]);

  const subtitle = useMemo(() => (
    mode === 'login'
      ? 'Usa tu correo y contraseña de Firebase Authentication para entrar a la app web.'
      : 'Registra una nueva cuenta con Firebase Auth y empieza a usar LookFin.'
  ), [mode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!isConfigured) {
      setError('Faltan variables VITE_FIREBASE_* en el frontend. Revisa la configuración de Firebase.');
      return;
    }

    setLoading(true);

    try {
      const firebaseAuth = await prepareAuthPersistence();
      let credential;

      if (mode === 'login') {
        credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        const signUpResponse = await signUpEmailPassword({
          variables: {
            input: {
              nombre: name.trim(),
              correoElectronico: email,
              contrasena: password,
            },
          },
        });

        if (!signUpResponse.data?.signUpEmailPassword?.success) {
          throw new Error(signUpResponse.data?.signUpEmailPassword?.message || 'No se pudo registrar el usuario.');
        }

        credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      }

      const token = await credential.user.getIdToken();
      const backendResponse = await loginEmailPassword({
        variables: {
          input: {
            correoElectronico: email,
            idToken: token,
          },
        },
      });

      if (!backendResponse.data?.loginEmailPassword?.success) {
        throw new Error(backendResponse.data?.loginEmailPassword?.message || 'No se pudo sincronizar el usuario con la base de datos.');
      }

      localStorage.setItem('lf_firebase_token', token);
      localStorage.setItem(
        'lf_firebase_user',
        JSON.stringify({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: credential.user.displayName,
        }),
      );

      onAuthenticated?.(credential.user, token);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      setError(firebaseError?.code ? friendlyError(firebaseError.code) : firebaseError?.message || 'No se pudo completar la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#050816] text-[#e9f1ff]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.28),transparent_35%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_30%),linear-gradient(180deg,#060b18_0%,#050816_100%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[48px_48px]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <section className="flex flex-col justify-center">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
              LookFin
            </span>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Un acceso limpio y seguro para tu chat financiero.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              {subtitle}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['Auth real', 'Firebase Authentication con correo y contraseña.'],
                ['Sesión persistente', 'Mantiene el usuario logueado al recargar.'],
                ['Listo para API', 'El token queda disponible para tu backend.'],
              ].map(([titleText, body]) => (
                <article key={titleText} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <h2 className="text-sm font-semibold text-white">{titleText}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1224]/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
              <div className="mb-6">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300/80">Acceso</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
              </div>

              {!isConfigured && (
                <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                  Falta configurar las variables <span className="font-semibold">VITE_FIREBASE_API_KEY</span>, <span className="font-semibold">VITE_FIREBASE_AUTH_DOMAIN</span>, <span className="font-semibold">VITE_FIREBASE_PROJECT_ID</span> y <span className="font-semibold">VITE_FIREBASE_APP_ID</span>.
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-200">Nombre</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Tu nombre"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Correo electrónico</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Contraseña</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </label>

                {error && (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !isConfigured}
                  className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-cyan-500 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Procesando...' : mode === 'login' ? 'Entrar a LookFin' : 'Crear cuenta'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode(mode === 'login' ? 'register' : 'login');
                }}
                className="mt-4 w-full text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
              >
                {mode === 'login' ? 'No tengo cuenta, quiero crear una' : 'Ya tengo cuenta, quiero iniciar sesión'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
