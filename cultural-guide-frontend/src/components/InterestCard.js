export function InterestCard({ interest, onToggle }) {
    const Icon = interest.icon;
    const isSelected = interest.selected;

    return (
        <button
            onClick={() => onToggle(interest.id)}
            aria-pressed={isSelected}
            className={`
        p-6 rounded-xl border-2 transition-all text-left w-full
        ${isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}
      `}
        >
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
          ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}
        `}>
                    <Icon className="w-7 h-7" />
                </div>

                {/* Title */}
                <div className="flex-1">
                    <h3 className={isSelected ? 'text-indigo-900' : 'text-gray-900'}>
                        {interest.title}
                    </h3>
                </div>

                {/* Checkmark */}
                <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
          ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}
        `}>
                    {isSelected && (
                        <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
            </div>
        </button>
    );
}
