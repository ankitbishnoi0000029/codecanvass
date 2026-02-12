export default function LoginPage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow">
          <h1 className="text-2xl font-semibold text-center mb-4">
            Login
          </h1>
  
          <input
            type="text"
            placeholder="Username"
            className="w-full mb-3 p-2 border rounded"
          />
  
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-2 border rounded"
          />
  
          <button className="w-full bg-blue-600 text-white p-2 rounded">
            Login
          </button>
        </div>
      </div>
    );
  }
  