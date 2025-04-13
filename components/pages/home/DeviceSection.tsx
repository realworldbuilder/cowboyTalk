import Image from 'next/image';

const DeviceSection = () => {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-width">
        <h2 className="mb-8 text-center text-2xl font-medium text-dark/90 md:text-3xl">
          Works on all your devices
        </h2>
        <div className="relative flex flex-col items-center lg:flex-row lg:items-start lg:justify-center">
          <div className="w-full max-w-[350px] lg:max-w-[300px]">
            <Image
              src="/images/mobile.png"
              width={500}
              height={600}
              alt="Cowboy Talk on mobile"
              className="w-full object-contain"
              priority
            />
          </div>
          <div className="mt-8 w-full max-w-[700px] lg:-ml-12 lg:mt-0">
            <Image
              src="/images/desktop-2.png"
              width={800}
              height={500}
              alt="Cowboy Talk on desktop"
              className="w-full object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeviceSection;
