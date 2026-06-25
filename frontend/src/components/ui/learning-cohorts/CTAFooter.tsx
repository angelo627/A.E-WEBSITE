import pic1 from "/african3.png"
import pic2 from "/african8.png"
import arrow from "../learning-cohorts/images/arrow-narrow-right.png"

export default function CTAFooter() {
  return (
    <section className="w-full py-32 ae-brand-page">

      <div className="max-w-7xl mx-auto px-6 space-y-32">

        {/* ================= TOP CTA ================= */}
        <div className="grid md:grid-cols-2 items-center gap-12">

          {/* IMAGE (closer to edge) */}
          <div className="flex justify-start">
            <div className="w-full max-w-[400px] aspect-[400/425] rounded-[40px] overflow-hidden mb-8 md:mb-0 border border-[var(--ae-border)] shadow-md">
              <img
                src= {pic1}
                className="object-cover w-full h-full"
                alt="Become an Instructor"
              />
            </div>
          </div>

          {/* TEXT (tight beside image) */}
          <div className="max-w-md ml-0 ae-brand-card p-8 rounded-2xl border border-[var(--ae-border)] shadow-sm">
            <h3 className="text-xl font-semibold mb-3 text-left text-[var(--text-color)]">
              Become an Instructor
            </h3>

            <p className="text-[var(--text-color)]/60 text-sm mb-5 leading-relaxed text-left">
              Instructors from around the world teach millions of students on AE.
              We provide the tools and skills to teach what you love.
            </p>

            <div className="flex justify-start">
              <button className="ae-brand-button px-5 py-2.5 rounded-lg text-sm transition border-none flex items-center justify-center gap-2">
                Start Your Instructor Journey <img src={arrow} className="w-5 h-5"/>
              </button>
            </div>
          </div>

        </div>

        {/* ================= BOTTOM CTA ================= */}
        <div className="grid md:grid-cols-2 items-center gap-12">

          {/* TEXT */}
          <div className="ae-brand-card p-6 sm:p-8 rounded-2xl border border-[var(--ae-border)] shadow-sm order-2 md:order-1 flex flex-col items-start w-full md:max-w-md">
            <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-left text-[var(--text-color)] break-words w-full">
              Transform your life through education
            </h3>

            <p className="text-[var(--text-color)]/60 text-sm mb-5 leading-relaxed text-left">
              Learners around the world are launching new careers, advancing in
              their fields, and enriching their lives.
            </p>

            <div className="flex justify-start">
              <button className="ae-brand-button px-6 py-2.5 rounded-lg text-sm transition border-none flex items-center justify-center gap-2">
                Checkout Courses <img src={arrow} className="w-5 h-5"/>
              </button>
            </div>
          </div>

          {/* IMAGE (closer to right edge) */}
          <div className="flex justify-center md:justify-end order-1 md:order-2 w-full mb-8 md:mb-0">
            <div className="w-full max-w-[471.5px] aspect-[471.5/385] rounded-[40px] overflow-hidden border border-[var(--ae-border)] shadow-md">
              <img
                src= {pic2}
                className="object-cover w-full h-full"
                alt="Transform your life"
              />
            </div>
          </div>

        </div>

        {/* ================= FOOTER ================= */}
        <footer className="pt-16 border-t border-[var(--ae-border)] bg-transparent">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* LEFT */}
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold mb-4 text-left text-[var(--text-color)] italic">
                Algorithmic Explorers.
              </h2>
              <p className="text-[var(--text-color)]/60 text-sm mb-4 leading-relaxed text-left">
                Work together seamlessly with real-time updates and communication.
              </p>
              <p className="text-[var(--text-color)] text-sm text-left font-semibold">
                Team Conditional & Policy
              </p>
            </div>

            {/* PAGES */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-left text-[var(--text-color)]">Pages</h3>
              <ul className="space-y-3 text-sm text-[var(--text-color)]/60 text-left">
                <li className="hover:text-[var(--ae-blue)] cursor-pointer transition-colors">Home</li>
                <li className="hover:text-[var(--ae-blue)] cursor-pointer transition-colors">Projects</li>
                <li className="hover:text-[var(--ae-blue)] cursor-pointer transition-colors">AE News</li>
                <li className="hover:text-[var(--ae-blue)] cursor-pointer transition-colors">Exco Team</li>
              </ul>
            </div>

            {/* COMPANY */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-left text-[var(--text-color)]">Company</h3>
              <ul className="space-y-3 text-sm text-[var(--text-color)]/60 text-left">
                <li className="hover:text-[var(--ae-blue)] cursor-pointer transition-colors">Customer</li>
                <li className="hover:text-[var(--ae-blue)] cursor-pointer transition-colors">Enterprise</li>
                <li className="hover:text-[var(--ae-blue)] cursor-pointer transition-colors">Partners</li>
                <li className="hover:text-[var(--ae-blue)] cursor-pointer transition-colors">Job</li>
              </ul>
            </div>

          </div>

          {/* BOTTOM */}
          <div className="mt-12 pt-8 border-t border-[var(--ae-border)] text-center text-sm text-[var(--text-color)]/40">
            @ae. all right reserve
          </div>
        </footer>

      </div>
    </section>
  );
}