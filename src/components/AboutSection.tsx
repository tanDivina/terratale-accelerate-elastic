import { MapPin, Shield, Waves } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl text-stone-900 mb-6">
              <span className="italic">Protecting</span> Paradise
            </h2>
            <p className="text-lg text-stone-600 leading-relaxed mb-6">
              The San San Pond Sak Wetlands span over 16,000 hectares of pristine coastal ecosystem
              in the Bocas del Toro archipelago of Panama. This vital wetland serves as a critical
              habitat for endangered species and plays an essential role in coastal protection.
            </p>
            <p className="text-lg text-stone-600 leading-relaxed">
              Recognized as a Wetland of International Importance under the Ramsar Convention,
              these wetlands represent one of the most biodiverse regions in Central America.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="bg-stone-100 p-3 rounded-xl">
                <MapPin className="w-6 h-6 text-stone-700" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-stone-900 mb-2">Location</h3>
                <p className="text-stone-600">
                  Bocas del Toro Province, Caribbean coast of Panama
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-stone-100 p-3 rounded-xl">
                <Shield className="w-6 h-6 text-stone-700" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-stone-900 mb-2">Conservation Status</h3>
                <p className="text-stone-600">
                  Ramsar Site, protected under national and international law
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-stone-100 p-3 rounded-xl">
                <Waves className="w-6 h-6 text-stone-700" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-stone-900 mb-2">Ecosystem</h3>
                <p className="text-stone-600">
                  Mangroves, seagrass beds, coral reefs, and coastal forests
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
