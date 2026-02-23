interface PageTitleProps {
  selectedData?: {
    urlName?: string;
    des?: string;
    description?: string;
    label?: string;
  };
  urlName?: string;
  des?: string;
  description?: string;
  label?: string;
}

export const PageTitle = (props: PageTitleProps) => {
  const data = props.selectedData || props;

  const title =
    data?.urlName ||
    data?.label ;

  const description =
    data?.des ||
    data?.description ||
    "Choose a converter from the sidebar to get started.";

  return (
    <div className="mb-6 p-6 bg-gray-50 rounded-xl shadow-sm border border-gray-200">
      
      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 uppercase tracking-wide">
        {title}
      </h2>

      {/* Description */}
      <p className="text-sm md:text-base leading-relaxed bg-blue-100 px-6 py-2 rounded-full text-gray-700 inline-block">
        {description}
      </p>

    </div>
  );
};