interface PageTitleProps {
  title?: string;
  description?: string;
}

export const PageTitle = ({ title, description }: PageTitleProps) => {


  return (
    <div className="mb-6 p-6 bg-gray-50 rounded-xl shadow-sm border border-gray-200">
      
      {/* Title */}
      <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
        {title}
      </h2>

      {/* Description */}
      <p className="text-sm md:text-base leading-relaxed bg-blue-100 px-6 py-2 rounded-full text-gray-700 inline-block">
        {description}
      </p>

    </div>
  );
};