import { Bird, Fish, TreePine } from 'lucide-react';

const highlights = [
  {
    icon: Bird,
    title: 'Avian Paradise',
    description: 'Home to over 100 species of birds including herons, kingfishers, and rare tropical species.',
    image: 'https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    icon: Fish,
    title: 'Marine Life',
    description: 'Manatees, dolphins, and diverse fish species thrive in these protected waters.',
    image: 'https://images.pexels.com/photos/3894157/pexels-photo-3894157.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    icon: TreePine,
    title: 'Mangrove Forests',
    description: 'Dense mangrove ecosystems that protect coastlines and nurture countless species.',
    image: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

export default function WildlifeGallery() {
  return (
    <section id="wildlife" className="bg-[#f5f3ed] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl text-stone-900 mb-4">
            <span className="italic">Experience</span> the Biodiversity
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            A sanctuary for endangered species and a vital ecosystem for the Caribbean coast
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {highlights.map((item) => (
            <div key={item.title} className="group">
              <div className="relative overflow-hidden rounded-2xl mb-6 aspect-[4/5]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <item.icon className="w-8 h-8 text-white mb-3" />
                </div>
              </div>
              <h3 className="text-2xl text-stone-900 mb-2">{item.title}</h3>
              <p className="text-stone-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
