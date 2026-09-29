export interface FocusTitleProps {
  as?: 'h1'
  children: string
  className?: string
}

/**
 * The hero H1 (brief 4.8.1). Real text in the server HTML; its pre-intro state
 * (opacity 0) is set by the CSS gate on [data-hero-title] (4.4). The optical focus-in
 * is played by the hero intro through `focus-in.ts`, which splits the words only when
 * the intro starts and reverts the split when it ends. Used nowhere else.
 */
export function FocusTitle({ as: Tag = 'h1', children, className }: FocusTitleProps) {
  return (
    <Tag id="first-light-title" className={className} tabIndex={-1} data-hero-title="" data-og-keep="">
      {children}
    </Tag>
  )
}

export default FocusTitle
