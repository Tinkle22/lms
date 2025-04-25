export default function PageHeader({ title, children }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center space-x-4">
          {children}
        </div>
      </div>
      <div className="h-1 w-24 bg-blue-500 mt-4"></div>
    </div>
  );
}