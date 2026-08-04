import AuthInput from "./AuthInput";

export default function LoginForm() {
  return (
    <section className="flex items-center justify-center p-10 lg:p-20">

      <div className="w-full max-w-md">

        <span className="text-sm font-medium uppercase tracking-widest text-[#02F5A1]">
          Welcome Back
        </span>

        <h1 className="mt-4 text-5xl font-bold text-white">
          Sign In
        </h1>

        <p className="mt-3 text-slate-400">
          Login to access your admin dashboard.
        </p>

        <div className="mt-10 space-y-6">

          <AuthInput
            label="Email"
            placeholder="you@example.com"
            type="email"
          />

          <AuthInput
            label="Password"
            placeholder="••••••••"
            type="password"
          />

        </div>

        <div className="mt-5 flex items-center justify-between">

          <label className="flex items-center gap-2 text-sm text-slate-300">

            <input
              type="checkbox"
              className="accent-[#02F5A1]"
            />

            Remember me

          </label>

          <button className="text-sm text-[#02F5A1] hover:underline">
            Forgot Password?
          </button>

        </div>

        <button className="mt-8 h-14 w-full rounded-xl bg-[#02F5A1] text-lg font-semibold text-[#07191E] transition hover:bg-[#00D68F]">
          Sign In
        </button>

      </div>

    </section>
  );
}