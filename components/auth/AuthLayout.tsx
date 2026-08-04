import AuthHero from "./AuthHero";
import LoginForm from "./LoginForm";

export default function AuthLayout() {
  return (
    <main className="min-h-screen bg-[#07191E] flex items-center justify-center p-8">
      <div className="w-full max-w-7xl overflow-hidden rounded-3xl border border-[#02F5A1]/10 bg-[#10272D] shadow-2xl">

        <div className="grid min-h-[760px] grid-cols-1 lg:grid-cols-2">

          <AuthHero />

          <LoginForm />

        </div>
      </div>
    </main>
  );
}