import { formatVitalValue } from '../utils'
import styles from './VitalHeadingContainer.module.css'

export const VitalHeadingContainer = ({ vitalType, value, description }) => {
  return (
    <div className={styles.vitalHeadingContainer}>
      <div className={styles.valueContainer}>
        <h2 className={styles.vitalType}>{vitalType}</h2>
        <p className={styles.vitalValue}>
          {value >= 0 ? formatVitalValue(value, vitalType) : 'Not Calculated'}
        </p>
      </div>
      <p className={styles.vitalDescription}>{description}</p>
    </div>
  )
}
