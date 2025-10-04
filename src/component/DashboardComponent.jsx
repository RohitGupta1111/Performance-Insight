import { useEffect, useRef, useState } from "react";
import "./DashboardComponent.css";
import LinearIndicator from "./LinearIndicator";

function DashboardComponent ({webVitalsData}) {


    return (
        <div class="dashboard-component-container">
            <ul>
                {Object.keys(webVitalsData).length > 0 && Object.keys(webVitalsData).map((vitalDataKey) => {
                    return (
                    <li key={vitalDataKey}>
                        <LinearIndicator
                            value={webVitalsData[vitalDataKey]}
                            variant={vitalDataKey}
                        />
                    </li>
                    )
                })}
            </ul>
        </div>
    );
}

export default DashboardComponent;