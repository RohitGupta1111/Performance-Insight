import { useState } from "react"
import WebVitalsContext from "./WebVitalsContext";
import { DEFAULT_VITALS_DATA } from "../enums";

const WebVitalsState = (props) => {
    
    const [webVitalsData, setWebVitalsData] = useState(DEFAULT_VITALS_DATA);
    
    return (
        <WebVitalsContext.Provider value={{webVitalsData, setWebVitalsData}}>
            {props.children}
        </WebVitalsContext.Provider>
    )
}

export default WebVitalsState;