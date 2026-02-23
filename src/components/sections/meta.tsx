


const Meta = (selectedData: any) => {

    const description = selectedData?.des || selectedData?.selectedData?.des || selectedData?.selectedData?.description || selectedData?.description;

    const keywordString =
        selectedData?.selectedData?.keyword ||
        selectedData?.keyword;

    const keywords = keywordString
        ? keywordString.split(",")
        : [];

    return (
        <div className="w-full mx-auto my-16 px-4">

            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-200 p-8">

                {/* Soft Gradient Glow */}
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-purple-500 to-blue-500 opacity-10 rounded-full blur-3xl"></div>

                {/* Description Section */}
                <div className="relative z-10 mb-10">

                    <p className="text-gray-600 text-base leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                        {description}
                    </p>
                </div>

                {/* Keywords Section */}
                <div className="relative z-10">
                   

                    <div className="flex flex-wrap gap-3">
                        {keywords.map((kw: string, index: number) => (
                            <span
                                key={index}
                                className="px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md hover:scale-105 hover:shadow-lg transition-all duration-200"
                            >
                                {kw.trim()}
                            </span>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Meta;