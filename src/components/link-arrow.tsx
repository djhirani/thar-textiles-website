import styles from "./link-arrow.module.css";

/** A drawn link indicator, never a platform-dependent Unicode emoji. */
export function LinkArrow() {
  return (
    <span className={styles.arrow} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" focusable="false">
        <path
          d="M6 18 18 6M6 6h12v12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
