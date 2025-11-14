import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { processHistoricalApiDataForP75Linechart } from '../utils';
import WebVitalsContext from '../context/WebVitalsContext';
import styles from './P75DistributionChart.module.css';
import { MONTH_NAMES } from '../constants';

const P75distributionChart = ({ historicalApiData, metric }) => {
    const [p75Data, setP75Data] = useState([]);

    // format YYYY-MM-DD → readable
    const formatDate = (d) => {
        if (!d) return "";
        return `${d.day} ${MONTH_NAMES[d.month - 1]} ${d.year}`;
    };

    // ---------- CUSTOM TOOLTIP ----------
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;

        const point = payload[0].payload;

        return (
            <div className={styles.tooltipBox}>
                <div className={styles.tooltipTitle}>
                    {point.monthLabel}
                </div>

                <div className={styles.tooltipRange}>
                    {formatDate(point.firstDate)} – {formatDate(point.lastDate)}
                </div>

                <div className={styles.tooltipValue}>
                    P75: <strong>{point.p75} ms</strong>
                </div>
            </div>
        );
    };

    // ---------- GET VISIBLE MONTHS ----------
    const uniqueMonths = useMemo(() => {
        const list = [];
        for (let i = 0; i < p75Data.length; i++) {
            if (i === 0 || p75Data[i].monthLabel !== p75Data[i - 1].monthLabel) {
                list.push({ index: i, label: p75Data[i].monthLabel });
            }
        }
        return list;
    }, [p75Data]);

    const visibleMonths = useMemo(() => {
        const s = new Set();
        uniqueMonths.forEach((m, pos) => {
            if (pos % 2 === 1) { // every second month
                s.add(m.index);
            }
        });
        return s;
    }, [uniqueMonths]);

    const monthTickFormatter = (xIndex) => {
        const point = p75Data[xIndex];
        if (!point) return "";
        return visibleMonths.has(xIndex) ? point.monthLabel : "";
    };

    useEffect(() => {
        setP75Data(processHistoricalApiDataForP75Linechart(historicalApiData, metric));
    }, [historicalApiData, metric]);

    return (
        <ResponsiveContainer width={230} height={150}>
            <LineChart data={p75Data}>
                <Line dataKey="p75" dot={false} strokeWidth={2} />
                
                <XAxis
                    dataKey="xIndex"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    scale="linear"
                    tickFormatter={monthTickFormatter}
                    interval={0}
                    tickLine={false}
                />


                <YAxis tickLine={false} />

                <Tooltip content={<CustomTooltip />} cursor={false} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default P75distributionChart;
