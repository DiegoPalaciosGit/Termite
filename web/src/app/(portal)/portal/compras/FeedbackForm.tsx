'use client'
import { useState } from 'react'
import { guardarFeedback } from '../actions'

const inputCls = 'w-full border border-warm bg-white text-bark text-sm px-3 py-2.5 focus:outline-none focus:border-terra transition-colors placeholder:text-dust'

export default function FeedbackForm({
  hojaId,
  initialRating,
  initialComment,
}: {
  hojaId: number
  initialRating: number
  initialComment: string
}) {
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)
  const hasFeedback = initialRating > 0

  return (
    <form action={guardarFeedback} className="space-y-3">
      <input type="hidden" name="hoja_id" value={hojaId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1" role="radiogroup" aria-label="Calificación">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className={`text-2xl transition-colors ${
              n <= (hover || rating) ? 'text-amber' : 'text-warm'
            }`}
            aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        name="comment"
        rows={2}
        defaultValue={initialComment}
        placeholder="Cuéntanos qué te gustó o qué podemos mejorar…"
        className={`${inputCls} resize-none`}
      />
      <button
        type="submit"
        disabled={rating === 0}
        className="bg-terra hover:bg-terra-dark disabled:bg-warm disabled:cursor-not-allowed text-white font-medium py-2 px-4 text-xs tracking-wide transition-colors"
      >
        {hasFeedback ? 'Actualizar opinión' : 'Enviar opinión'}
      </button>
    </form>
  )
}
