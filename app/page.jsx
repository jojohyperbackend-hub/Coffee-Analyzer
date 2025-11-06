// app/page.jsx
// Halaman utama: login Google + komponen CameraScan (flow lengkap)

"use client";
import { useEffect, useState } from "react";
import { signInWithGoogle, signOut, onAuthChange } from "@/lib/firebase";
import CameraScan from "@/components/CameraScan";

export default function Page() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  async function handleLogin() {
    try {
      const { user } = await signInWithGoogle();
      setUser(user);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleLogout() {
    await signOut();
    setUser(null);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-amber-50">
      <h1 className="text-2xl font-bold mb-4">☕ Coffee Analyzer</h1>

      {!user ? (
        <button
          onClick={handleLogin}
          className="bg-amber-700 text-white px-5 py-2 rounded-lg shadow"
        >
          🔑 Login dengan Google
        </button>
      ) : (
        <>
          <p className="mb-3 text-sm">
            Login sebagai <b>{user.displayName}</b>
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded-lg mb-4"
          >
            Keluar
          </button>
          <CameraScan />
        </>
      )}
    </main>
  );
}
