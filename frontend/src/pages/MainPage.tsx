import styles from './MainPage.module.css'
import {Viewer} from "resium";

export default function MainPage () {
    return(
        <div className={styles.mainContainer}>
            <Viewer full/>
        </div>
    )
}