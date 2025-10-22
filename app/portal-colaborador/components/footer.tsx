export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-4 py-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <span className="text-gray-600 font-medium">ProSeleta</span>
        </div>

        <a
          href="https://www.conectaskills.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
        >
          www.conectaskills.com.br
        </a>
      </div>
    </footer>
  )
}
