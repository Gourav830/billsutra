import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-black/5 bg-[#f7f2ea] py-12 text-[#1f1b16] dark:border-white/10 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="text-lg font-semibold">BillSutra</div>
            <p className="mt-2 text-sm text-[#5c4b3b] dark:text-slate-300">
              Business management built for small teams.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]">
              Product
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#5c4b3b] dark:text-slate-300">
              <li>
                <Link href="#features">Features</Link>
              </li>
              <li>
                <Link href="#pricing">Pricing</Link>
              </li>
              <li>
                <Link href="#updates">Updates</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]">
              Company
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#5c4b3b] dark:text-slate-300">
              <li>
                <Link href="#about">About</Link>
              </li>
              <li>
                <Link href="#contact">Contact</Link>
              </li>
              <li>
                <Link href="#careers">Careers</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]">
              Resources
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#5c4b3b] dark:text-slate-300">
              <li>
                <Link href="#docs">Documentation</Link>
              </li>
              <li>
                <Link href="#blog">Blog</Link>
              </li>
              <li>
                <Link href="#help">Help Center</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]">
              Legal
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#5c4b3b] dark:text-slate-300">
              <li>
                <Link href="#privacy">Privacy</Link>
              </li>
              <li>
                <Link href="#terms">Terms</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-black/5 pt-6 text-sm text-[#8a6d56] dark:border-white/10">
          (c) 2026 BillSutra. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
