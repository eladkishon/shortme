export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
      <p className="mb-4">The URL you're looking for doesn't exist.</p>
      <a href="/" className="text-blue-600 hover:underline">
        Go back home
      </a>
    </div>
  );
} 