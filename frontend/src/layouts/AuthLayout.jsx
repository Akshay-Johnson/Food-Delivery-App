export default function AuthLayout({ title, children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="
                    absolute inset-0
                    bg-cover bg-center bg-no-repeat 
                    bg-[url('/assets/loginimage.jpg')]
                    blur-md
                    scale-105

                "
      ></div>

      <div
        className="
                    relative z-10
                    w-full max-w-md 
                    p-8 
                    rounded-2xl 
                    bg-black/70 
                    backdrop-blur-md
                    shadow-2xl
                    border border-white

                "
      >
        <h1 className="text-2xl text-white font-bold mb-6 text-center">
          {title}
        </h1>

        {children}
      </div>
    </div>
  );
}
