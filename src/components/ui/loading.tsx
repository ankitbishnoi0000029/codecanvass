 export const LoadingComponent = () => {
  return (
     <div className="flex min-h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 space-y-4 border-r">

        {/* Sidebar Title */}
        <div className="h-6 w-40 bg-gray-300 rounded shimmer"></div>

        {/* Menu Items */}
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-4 w-full bg-gray-300 rounded shimmer"
            ></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">

        {/* Title */}
        <div className="h-8 w-72 bg-gray-300 rounded shimmer"></div>

        {/* Description */}
        <div className="h-16 w-full bg-gray-300 rounded-xl shimmer"></div>

        {/* Editors */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Left */}
          <div className="space-y-3">
            <div className="h-4 w-32 bg-gray-300 rounded shimmer"></div>
            <div className="h-44 w-full bg-gray-300 rounded-xl shimmer"></div>
          </div>

          {/* Right */}
          <div className="space-y-3">
            <div className="h-4 w-32 bg-gray-300 rounded shimmer"></div>
            <div className="h-44 w-full bg-gray-300 rounded-xl shimmer"></div>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-300 rounded-lg shimmer"></div>
          <div className="h-10 w-24 bg-gray-300 rounded-lg shimmer"></div>
          <div className="h-10 w-28 bg-gray-300 rounded-lg shimmer"></div>
        </div>

        {/* FAQ */}
        <div className="space-y-3 pt-6">
          <div className="h-6 w-40 bg-gray-300 rounded shimmer"></div>
          <div className="h-4 w-full bg-gray-300 rounded shimmer"></div>
          <div className="h-4 w-5/6 bg-gray-300 rounded shimmer"></div>
          <div className="h-4 w-4/6 bg-gray-300 rounded shimmer"></div>
        </div>

      </div>
    </div>
  );
};