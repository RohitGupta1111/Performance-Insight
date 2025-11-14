import styles from './ToolTipText.module.css'

const TooltipText = ({ children, tooltipText }) => {
  return (
    <div className={styles.tooltip}>
      {children}
      <span className={styles.tooltipText}>{tooltipText}</span>
    </div>
  )
}

export default TooltipText
