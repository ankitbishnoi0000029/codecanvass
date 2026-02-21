


const Meta = (selectedData: any) => {
    console.log(selectedData)
    return (
        <div className="my-auto">
        
        <div className="my-8 p-4 border rounded-lg bg-gray-50 space-y-3">
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-md shadow-sm mb-4">
                    <h3 className="text-sm font-semibold text-blue-700 mb-1">Description</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                        { selectedData?.des || selectedData?.description}
                    </p>
                </div>


            <div>
                <strong className="block mb-2">Keywords:</strong>

                <div className="flex flex-wrap gap-2">
                        {selectedData?.keyword
        ?.split(",")
                        .map((kw: string, index: number) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm border border-purple-200 shadow-sm hover:bg-purple-200 transition ">
                                {kw.trim()}
                            </span>
                        ))}
                </div>
            </div>
            </div>
        </div>
    )
}

export default Meta