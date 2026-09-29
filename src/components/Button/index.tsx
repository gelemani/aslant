import type { ReactNode } from 'react'
import styles from './styles.module.css'

export interface ButtonProps {
  href?: string
  onClick?: () => void
  variant: 'primary' | 'secondary' | 'text'
  size?: 'md' | 'sm'
  surface?: 'shade' | 'sunlit'
  type?: 'button' | 'submit'
  disabled?: boolean
  busy?: boolean
  className?: string
  children: ReactNode
}

/**
 * The one button (7.3). A link when `href` is given (same-page links are routed
 * through jumpTo by SmoothScroll's delegated listener), otherwise a <button>.
 * `busy` shows "Sending" with a 1 px line of light travelling along the bottom edge.
 */
export function Button({
  href,
  onClick,
  variant,
  size = 'md',
  surface = 'shade',
  type = 'button',
  disabled = false,
  busy = false,
  className,
  children,
}: ButtonProps) {
  const cls = [styles.button, styles[variant], className].filter(Boolean).join(' ')
  const data = {
    'data-size': size,
    'data-surface-tone': surface,
    'data-busy': busy ? '' : undefined,
  }
  const label = busy ? 'Sending' : children
  const content = (
    <>
      <span className={styles.label}>{label}</span>
      {busy ? <span className={styles.line} aria-hidden="true" /> : null}
    </>
  )

  if (href !== undefined && !disabled) {
    return (
      <a href={href} onClick={onClick} className={cls} {...data}>
        {content}
      </a>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={busy || undefined}
      className={cls}
      {...data}
    >
      {content}
    </button>
  )
}

export default Button
