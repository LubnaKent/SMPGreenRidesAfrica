import { UserPlus, ClipboardCheck, GraduationCap, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Apply",
    description: "Submit your application through our simple online form. We welcome drivers from all backgrounds with a passion for green mobility.",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Screen",
    description: "Complete our comprehensive screening process including background checks, driving assessment, and qualification verification.",
  },
  {
    number: "03",
    icon: GraduationCap,
    title: "Train",
    description: "Participate in our training program covering e-vehicle operation, safety protocols, customer service, and professional conduct.",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Partner",
    description: "Get matched with leading e-mobility partners and start your journey as a certified green mobility professional.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
            Your Journey to Green Mobility
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            A simple four-step process to becoming a certified green mobility driver and joining Africa&apos;s sustainable transportation revolution.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-green-200 via-green-400 to-green-200" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step Card */}
                <div className="flex flex-col items-center text-center">
                  {/* Number Badge */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center shadow-lg shadow-green-200">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-green-600 flex items-center justify-center text-sm font-bold text-green-600">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow - Mobile/Tablet */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block lg:hidden absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-0.5 h-8 bg-green-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            Start Your Application
          </a>
        </div>
      </div>
    </section>
  );
}
