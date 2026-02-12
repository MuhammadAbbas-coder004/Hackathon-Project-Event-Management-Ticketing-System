import React from "react";

export default function Page404() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white p-4">
      {/* Floating Button */}
      <a
        href="https://twitter.com/intent/follow?screen_name=aish2004gupta"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 left-4 w-12 h-12 flex items-center justify-center transition-transform transform hover:scale-110"
      >
        <svg
          className="w-full h-full text-blue-900"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0.583 21 69.0166 37.3"
        >
          <path
            className="fill-current"
            d="M5.35 58.00Q2 57.50 1 54.92Q0 52.35 1.40 48.40L8 29.65Q8.90 27.05 10.07 25.20Q11.25 23.35 13.03 22.35Q14.80 21.35 17.45 21.35Q21.45 21.35 23.48 23.55Q25.50 25.75 26.85 29.65L33.40 48.40Q34.80 52.35 33.93 54.92Q33.05 57.50 29.65 58.00Q26.90 58.35 24.88 57.35Q22.85 56.35 22.45 54.10Q22.15 52.60 22.38 51.60Q22.60 50.60 22.80 50.00Q22.95 49.50 22.82 49.02Q22.70 48.55 22.05 48.55L12.75 48.55Q12.10 48.55 11.97 49.02Q11.85 49.50 12.05 50.00Q12.25 50.60 12.45 51.60Q12.65 52.60 12.40 54.10Q12 56.35 10.05 57.35Q8.10 58.35 5.35 58.00Z"
          />
        </svg>
      </a>

      <div className="text-center">
        <div className="bg-[url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif')] bg-center bg-no-repeat h-96 w-full sm:w-3/4 mx-auto flex items-center justify-center">
          <h1 className="text-6xl sm:text-8xl font-bold text-center text-gray-800">404</h1>
        </div>
        <div className="-mt-12">
          <h3 className="text-2xl sm:text-4xl font-semibold">Looks like you're lost</h3>
          <p className="mt-2 text-gray-600">The page you are looking for is not available!</p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
          >
            Go to Home
          </a>
        </div>
      </div>
    </section>
  );
}
