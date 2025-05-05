export default function Card({ title, children, className = "" }) {
  return (
    // Removed border border-gray-100, changed shadow-sm to shadow-md
    <div className={`bg-white rounded-md shadow-md ${className}`}>
      {title && (
        // Adjusted padding py-4 to py-5, slightly darker title text
        <div className="px-6 py-5 border-b border-gray-100"> {/* Kept light border under title */}
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}