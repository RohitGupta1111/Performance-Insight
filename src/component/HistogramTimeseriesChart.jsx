import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    BarChart,
    Bar,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";

import WebVitalsContext from '../context/WebVitalsContext';
import { processHistoricalApiDataForHistogram } from '../utils';
import styles from './HistogramTimeseriesChart.module.css';
import { MONTH_NAMES } from '../constants';

const HistogramTimeseriesChart = ({ historicalApiData, metric }) => {
    const [histData, setHistData] = useState([]);

    const formatDate = (d) => {
        if (!d) return "";
        return `${d.day} ${MONTH_NAMES[d.month - 1]} ${d.year}`;
    };

    // ---------- CUSTOM TOOLTIP ----------
    const CustomTooltip = ({ active, payload }) => {
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

                <div className={styles.tooltipBins}>
                    {point.bins.map((bin, i) => (
                        <div key={i}>
                            {bin.start}–{bin.end === Infinity ? "∞" : bin.end}:{" "}
                            {(bin.density * 100).toFixed(1)}%
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // ---------- GET VISIBLE MONTHS ----------
    const uniqueMonths = useMemo(() => {
        const list = [];
        for (let i = 0; i < histData.length; i++) {
            if (i === 0 || histData[i].monthLabel !== histData[i - 1].monthLabel) {
                list.push({ index: i });
            }
        }
        return list;
    }, [histData]);

    const visibleMonths = useMemo(() => {
        const s = new Set();
        uniqueMonths.forEach((m, pos) => {
            if (pos % 2 === 1) s.add(m.index);
        });
        return s;
    }, [uniqueMonths]);

    const monthTickFormatter = (value) => {
        const index = Number(value);
        const point = histData[index];
        if (!point) return "";
        return visibleMonths.has(index) ? point.monthLabel : "";
    };


    useEffect(() => {
        if (historicalApiData) {
            setHistData(processHistoricalApiDataForHistogram(historicalApiData, metric));
        }
    }, [historicalApiData, metric]);

    return (
        <ResponsiveContainer width={230} height={150}>
            <BarChart data={histData}>

                {/* matching P75 structure: only minimal props */}
                <Bar dataKey="good" stackId="a" fill="#008000" />
                <Bar dataKey="ni"   stackId="a" fill="#ffa500" />
                <Bar dataKey="poor" stackId="a" fill="#ff0000" />

                <XAxis
                    dataKey="xIndexStr"
                    type="category"
                    tickFormatter={monthTickFormatter}
                    interval={0}
                    tickLine={false}
                />


                <YAxis
                    domain={[0, 1]}
                    ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                    tickFormatter={v => `${v * 100}%`}
                    tickLine={false}
                />

                <Tooltip content={<CustomTooltip />} cursor={false} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default HistogramTimeseriesChart;
