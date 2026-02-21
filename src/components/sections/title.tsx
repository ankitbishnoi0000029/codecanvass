export const PageTitle = (selectedData: any) => {
    console.log(selectedData)
  return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
          {/* Title */}
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 uppercase ">
              {selectedData?.urlName || selectedData?.label ||"SQL Converter"}
          </h2>

          {/* Description */}
          <p className="text-md leading-relaxed bg-blue-200 p-1 px-6 rounded-xl text-gray-700 w-fit">
              {selectedData?.des || selectedData?.description ||
                  "Choose a converter from the sidebar to get started."}
          </p>
      </div>
  )
}
