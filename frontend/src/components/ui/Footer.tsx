

function Footer() {
  return (
     <div className="mt-20  pt-10 px-6 md:px-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 text-sm items-start">
            {/* Brand / Description */}
            <div className="md:col-span-2">
              <h4 className="font-bold text-[var(--ae-plum-deep)] text-2xl md:text-3xl mb-2">
                Algorithmic Explorers.
              </h4>
              <p className="my-4 md:my-6 text-gray-600 text-base md:text-[16px]">
                Work together seamlessly with real-time updates and
                communication.
              </p>
              <p className="font-semibold text-[var(--ae-plum-deep)] text-sm md:text-[18px]">
                Team Conditional & Policy
              </p>
            </div>

            {/* Pages */}
            <div>
              <h4 className="font-bold text-[var(--ae-plum-deep)] text-lg md:text-[20px] mb-4 md:mb-5">
                Pages
              </h4>
              <ul className="space-y-2 md:space-y-4 text-xs md:text-sm">
                <li className="text-gray-600 hover:text-[var(--ae-blue)] cursor-pointer transition-colors">
                  Home
                </li>
                <li className="text-gray-600 hover:text-[var(--ae-blue)] cursor-pointer transition-colors">
                  Projects
                </li>
                <li className="text-gray-600 hover:text-[var(--ae-blue)] cursor-pointer transition-colors">
                  AE News
                </li>
                <li className="text-gray-600 hover:text-[var(--ae-blue)] cursor-pointer transition-colors">
                  Exco Team
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-[var(--ae-plum-deep)] text-lg md:text-[20px] mb-4 md:mb-5">
                Company
              </h4>
              <ul className="space-y-2 md:space-y-4 text-xs md:text-sm">
                <li className="text-gray-600 hover:text-[var(--ae-blue)] cursor-pointer transition-colors">
                  Customer
                </li>
                <li className="text-gray-600 hover:text-[var(--ae-blue)] cursor-pointer transition-colors">
                  Enterprise
                </li>
                <li className="text-gray-600 hover:text-[var(--ae-blue)] cursor-pointer transition-colors">
                  Partners
                </li>
                <li className="text-gray-600 hover:text-[var(--ae-blue)] cursor-pointer transition-colors">
                  Job
                </li>
              </ul>
            </div>


          </div>
          <div className="line max-w-250 mx-auto my-14 w-full h-0.5 bg-gray-200"></div>

          {/* Footer Note */}
        <div className="text-center text-gray-500 text-xs mt-10">
           ©ae. all right reserve
          </div>
        </div>
  )
}

export default Footer
