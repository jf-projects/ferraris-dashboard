import Image from "next/image";

export default function AuthHero() {
  return (
    <section className="relative hidden lg:block">

      <Image
        src="/images/bg2.jpg"
        alt="Login Background"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-linear-to-b from-[#07191E]/30 via-[#07191E]/20 to-[#07191E]/80" />

      <div className="absolute left-10 top-10">

        <h1 className="text-3xl font-bold text-white">
          Ferraris Dashboard
        </h1>

      </div>

      <div className="absolute right-10 top-10">

        <button className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-white backdrop-blur-md transition hover:bg-white/20">
          Back to Website →
        </button>

      </div>

      <div className="absolute bottom-14 left-10">

        <h2 className="max-w-sm text-5xl font-semibold leading-tight text-white">
          Manage everything from one dashboard.
        </h2>

        <p className="mt-4 text-lg text-slate-300">
          Modern. Fast. Secure.
        </p>

      </div>

    </section>
  );
}