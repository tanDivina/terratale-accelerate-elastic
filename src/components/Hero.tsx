export default function Hero() {
  return (
    <section className="bg-[#8db9ca] py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-6xl md:text-7xl lg:text-8xl text-stone-900 mb-6 leading-tight">
          <span className="italic font-normal">Discover</span> the Wetlands
          <br />
          <span className="italic font-normal">of</span> Bocas del Toro
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Explore the rich biodiversity and natural beauty of the San San Pond Sak Wetlands,
          home to countless species and vital ecosystems.
        </p>
        <div className="max-w-4xl mx-auto mt-8">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-2xl"
              src="https://www.youtube.com/embed/9n6Jb-N5KnY?modestbranding=1&rel=0&showinfo=0"
              title="San San Pond Sak Wetlands Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
