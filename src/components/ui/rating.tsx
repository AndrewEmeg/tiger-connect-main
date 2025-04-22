interface RatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
}

export const Rating = ({ value, onChange, readonly = false }: RatingProps) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    className={`text-xl ${
                        star <= value ? "text-yellow-400" : "text-gray-300"
                    }`}
                >
                    ★
                </button>
            ))}
        </div>
    );
};
