import type { StoreBook } from '@/lib/store/books'
import { DISPLAY_FONT, SANS_FONT } from '@/lib/typography'

// Styled placeholder cover: an ink-framed paper panel with the title set in
// the display serif and a vermillion spine accent. Never a gray box. When a
// real coverUrl lands (LS large_thumb_url), it renders the image instead.

interface BookCoverProps {
  book: StoreBook
  size?: 'card' | 'detail'
}

export default function BookCover({ book, size = 'card' }: BookCoverProps) {
  const isDetail = size === 'detail'

  if (book.coverUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={book.coverUrl}
        alt={`Couverture : ${book.title}`}
        style={{
          display: 'block',
          width: '100%',
          aspectRatio: '3 / 4',
          objectFit: 'cover',
          borderRadius: 'var(--r-sm)',
        }}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3 / 4',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isDetail ? '28px 24px' : '20px 18px',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--text-primary)',
        borderRadius: 'var(--r-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Vermillion spine accent */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: isDetail ? 10 : 7,
          backgroundColor: 'var(--accent)',
        }}
      />
      <span
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: isDetail ? '0.75rem' : '0.625rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {book.author}
      </span>
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 400,
          fontSize: isDetail ? 'clamp(1.5rem, 3vw, 2.25rem)' : '1.0625rem',
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
        }}
      >
        {book.title}
      </span>
      <span
        style={{
          height: 2,
          width: isDetail ? 56 : 36,
          backgroundColor: 'var(--text-primary)',
          borderRadius: 'var(--r-pill)',
        }}
      />
    </div>
  )
}
